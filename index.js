var fs = require("fs");
const path = require("path");
var crypto = require("crypto");

function isNotBackgroundFile(file) {
  if(path.extname(file) === ".css" || path.extname(file) === ".js") {
    return true;
  }
  else {
    return false;
  };
};

function generate384(absoluteFilepath, algorithm) {
  var buffer = fs.readFileSync(absoluteFilepath);
  var body = buffer.toString();
  const enc = "utf8";

  var hash = crypto.createHash(algorithm).update(body, enc);
  var sha  = hash.digest("base64");

  return algorithm + "-" + sha;
};

function saveSubresourceIntegrityHash(staticFilepath, algorithm, json) {
  if (algorithm == "sha256" || algorithm == "sha384" || algorithm == "sha512") {
    const filesInDirectory = fs.readdirSync(staticFilepath);

    for (const file of filesInDirectory) {
      const absoluteFilepath = path.join(staticFilepath, file);

      if (fs.statSync(absoluteFilepath).isDirectory()) {
        saveSubresourceIntegrityHash(absoluteFilepath, algorithm, json);
      }
      else if (isNotBackgroundFile(file)) {
        var newHash =  {
          "filepath": absoluteFilepath,
          "hash": generate384(absoluteFilepath, algorithm)
        };

        json.push(newHash);
      };
    };
  }
  else {
    console.log("Incorrect algorithm, please select a value supported by browsers for sub-resource integrity checking ('sha256', 'sha384', 'sha512').");
  };
};

function get(staticFilepath, algorithm) {
  var json = [];
  saveSubresourceIntegrityHash(staticFilepath, algorithm, json);

  return json;
};

module.exports = {get};
