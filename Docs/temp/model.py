import os
import sys
from typing import List, Tuple

import numpy as np
import tensorflow as tf

from dataloader_iam import Batch

# Disable eager mode
tf.compat.v1.disable_eager_execution()


class DecoderType:
    """CTC decoder types."""

    BestPath = 0
    BeamSearch = 1
    WordBeamSearch = 2


class Model:
    """Minimalistic TF model for HTR."""

    def __init__(
        self,
        char_list: List[str],
        decoder_type: str = DecoderType.BestPath,
        must_restore: bool = False,
        dump: bool = False,
    ) -> None:
        """Init model: add CNN, RNN and CTC and initialize TF."""
        self.dump = dump
        self.char_list = char_list
        self.decoder_type = decoder_type
        self.must_restore = must_restore
        self.snap_ID = 0

        # Whether to use normalization over a batch or a population
        self.is_train = tf.compat.v1.placeholder(tf.bool, name="is_train")

        # input image batch
        self.input_imgs = tf.compat.v1.placeholder(tf.float32, shape=(None, None, None))

        # setup CNN, RNN and CTC
        self.setup_cnn()
        self.setup_rnn()
        self.setup_ctc()

        # setup optimizer to train NN
        self.batches_trained = 0
        self.update_ops = tf.compat.v1.get_collection(tf.compat.v1.GraphKeys.UPDATE_OPS)
        with tf.control_dependencies(self.update_ops):
            self.optimizer = tf.compat.v1.train.AdamOptimizer().minimize(self.loss)

        # initialize TF
        self.sess, self.saver = self.setup_tf()

    def setup_cnn(self) -> None:
        """Create CNN layers."""
        cnn_in4d = tf.expand_dims(input=self.input_imgs, axis=3)

        # list of parameters for the layers
        kernel_vals = [5, 5, 3, 3, 3]
        feature_vals = [1, 32, 64, 128, 128, 256]
        stride_vals = pool_vals = [(2, 2), (2, 2), (1, 2), (1, 2), (1, 2)]
        num_layers = len(stride_vals)

        # create layers
        pool = cnn_in4d  # input to first CNN layer
        for i in range(num_layers):
            kernel = tf.Variable(
                tf.random.truncated_normal(
                    [
                        kernel_vals[i],
                        kernel_vals[i],
                        feature_vals[i],
                        feature_vals[i + 1],
                    ],
                    stddev=0.1,
                )
            )
            conv = tf.nn.conv2d(
                input=pool, filters=kernel, padding="SAME", strides=(1, 1, 1, 1)
            )
            conv_norm = tf.compat.v1.layers.batch_normalization(
                conv, training=self.is_train
            )
            relu = tf.nn.relu(conv_norm)
            pool = tf.nn.max_pool2d(
                input=relu,
                ksize=(1, pool_vals[i][0], pool_vals[i][1], 1),
                strides=(1, stride_vals[i][0], stride_vals[i][1], 1),
                padding="VALID",
            )

        self.cnn_out_4d = pool

    def setup_rnn(self) -> None:
        """Create RNN layers."""
        rnn_in3d = tf.squeeze(self.cnn_out_4d, axis=[2])

        # basic cells which is used to build RNN
        num_hidden = 256
        cells = [
            tf.compat.v1.nn.rnn_cell.LSTMCell(num_units=num_hidden, state_is_tuple=True)
            for _ in range(2)
        ]  # 2 layers

        # stack basic cells
        stacked = tf.compat.v1.nn.rnn_cell.MultiRNNCell(cells, state_is_tuple=True)

        # bidirectional RNN
        # BxTxF -> BxTx2H
        (fw, bw), _ = tf.compat.v1.nn.bidirectional_dynamic_rnn(
            cell_fw=stacked, cell_bw=stacked, inputs=rnn_in3d, dtype=rnn_in3d.dtype
        )

        # BxTxH + BxTxH -> BxTx2H -> BxTx1X2H
        concat = tf.expand_dims(tf.concat([fw, bw], 2), 2)

        # project output to chars (including blank): BxTx1x2H -> BxTx1xC -> BxTxC
        kernel = tf.Variable(
            tf.random.truncated_normal(
                [1, 1, num_hidden * 2, len(self.char_list) + 1], stddev=0.1
            )
        )
        self.rnn_out_3d = tf.squeeze(
            tf.nn.atrous_conv2d(value=concat, filters=kernel, rate=1, padding="SAME"),
            axis=[2],
        )
