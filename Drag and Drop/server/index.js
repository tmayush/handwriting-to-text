const { GLOBAL_DATA_FILES, GLOBAL_INDEX } = require("./globals/global");
const { sendData } = require("./controllers/sendData");
const { setEnvVariables } = require("./env/env");
const {
  setContentTypes,
  readFileProperly,
  getExtension,
  writeResponse,
  getContentType,
} = require("./utils/default_functions");

const http = require("http");
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const { spawn } = require("child_process");

/////////////////

setEnvVariables();
setContentTypes();

GLOBAL_INDEX.PORT = 5000;

const server = http.createServer((req, res) => {
  const req_url = req.url;
  if (req.url === "/api/upload" && req.method.toLowerCase() === "post") {
    // parse a file upload
    const form = formidable({
      multiples: true,
      uploadDir: "C:\\Users\\tmayu\\Projects\\Semester_4\\HTR\\data",
      filename: (f, s, p, fo) => {
        return "word.png";
      },
    });
    form.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(err.httpCode || 400, { "Content-Type": "text/plain" });
        res.end(String(err));
        return;
      }
      const ccwd = process.cwd();
      process.chdir("C:\\Users\\tmayu\\Projects\\Semester_4\\HTR\\src");
      const dir = spawn(
        "C:\\Users\\tmayu\\Projects\\Semester_4\\HTR\\venv\\Scripts\\python.exe C:\\Users\\tmayu\\Projects\\Semester_4\\HTR\\src\\main.py",
        { shell: true }
      );
      dir.stdout.on("data", (data) => {
        console.log(`spawn stdout: ${data}`);
      });
      dir.on("exit", (code) => {
        console.log(`spawn child process exited with code ${code}`);
        const data = fs.readFileSync(
          "C:\\Users\\tmayu\\Projects\\Semester_4\\Docs\\temp\\hello.json",
          { encoding: "utf8" }
        );
        // console.log(data);
        writeResponse(res, "application/json", 200, data);
      });
      process.chdir(ccwd);
    });
    return;
  }
  const decoded_url = decodeURIComponent(req_url);
  sendData(decoded_url, res);
  GLOBAL_INDEX.i++;
});

server.listen(GLOBAL_INDEX.PORT, () => {
  console.log(`server listening at http://localhost:${GLOBAL_INDEX.PORT}`);
});

console.log(GLOBAL_INDEX);
