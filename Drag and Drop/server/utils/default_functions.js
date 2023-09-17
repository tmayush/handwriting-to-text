const { GLOBAL_DATA_FILES } = require("../globals/global");
const { GLOBAL_ENV } = require("../globals/global");
const fs = require("fs");
const path = require("path");

function getExtension(decoded_url) {
  return path.extname(decoded_url).slice(1);
}

function setContentTypes() {
  GLOBAL_DATA_FILES.content_types = JSON.parse(
    fs.readFileSync(GLOBAL_ENV.VARS.content_types, "utf8")
  );
}

function writeResponse(res, content_type, status_code, data) {
  res.setHeader("Content-Type", content_type);
  res.statusCode = status_code;
  res.write(data);
  res.end();
}

function getContentType(extension) {
  for (const [key, value] of Object.entries(GLOBAL_DATA_FILES.content_types)) {
    if (key == extension) return value;
  }
}

function readFileProperly(loc) {
  return new Promise((resolve, reject) => {
    fs.readFile(loc, "utf8", (err, content) => {
      if (err) {
        reject(err);
      }
      resolve(content);
    });
  });
}

module.exports = {
  getExtension,
  setContentTypes,
  writeResponse,
  getContentType,
  readFileProperly,
};
