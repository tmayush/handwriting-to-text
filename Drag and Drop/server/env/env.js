const { GLOBAL_ENV } = require("../globals/global");
const fs = require("fs");

function setEnvVariables() {
  const envText = fs.readFileSync(
    "./env/path_variables.json",
    "utf8",
    (err, data) => {
      if (err) {
        return err;
      }
      return data;
    }
  );
  GLOBAL_ENV.VARS = JSON.parse(envText);
}

module.exports = {
  setEnvVariables,
};
