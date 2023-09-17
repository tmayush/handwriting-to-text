class FilePaths:
    """Filenames and paths to data."""

    fn_char_list = "../model/charList.txt"
    fn_summary = "../model/summary.json"
    fn_corpus = "../data/corpus.txt"


def get_img_height() -> int:
    """Fixed height for NN."""
    return 32
