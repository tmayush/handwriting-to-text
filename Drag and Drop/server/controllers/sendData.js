const { GLOBAL_ENV, GLOBAL_SEND_DATA } = require("../globals/global");
const {
  readFileProperly,
  getExtension,
  writeResponse,
  getContentType,
} = require("../utils/default_functions");

const fs = require("fs");
const path = require("path");

function handleFileErrors(err, res, content_type) {
  const json_content_type = getContentType("json");
  console.log(err);
  if (err.code == "ENOENT") {
    writeResponse(
      res,
      json_content_type,
      404,
      JSON.stringify({ Page_Not_Found: 404 })
    );
  } else {
    writeResponse(
      res,
      json_content_type,
      404,
      JSON.stringify({ Bad_Request: 500 })
    );
  }
  return false;
}

function handleEmptyFiles(res, data, content_type) {
  writeResponse(res, content_type, 200, data);
}

async function sendData(req_url, res) {
  if (req_url == "/") {
    req_url = "/index.html";
  }
  const total_path = path.join(GLOBAL_ENV.VARS.public, req_url);
  const req_url_ext = getExtension(req_url);
  const content_type = getContentType(req_url_ext);
  // console.log(path.join(GLOBAL_ENV.VARS.public, req_url));
  const fdata = await readFileProperly(total_path).catch((err) =>
    handleFileErrors(err, res, content_type)
  );
  if (fdata.length == 0) handleEmptyFiles(res, fdata, content_type);
  else if (fdata == false) return;
  else if (fdata.length > 0) writeResponse(res, content_type, 200, fdata);
}

module.exports = {
  sendData,
};
