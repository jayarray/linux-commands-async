let REMOVE = require('./remove.js');
let MKDIR = require('./mkdir.js');
let PATH = require('./path.js');
let DISKUSAGE = require('./diskusage.js');
let VALIDATE = require('./validate.js');

//-----------------------------------------
// DIRECTORY

function Remove(path, executor) {
  return REMOVE.Directories([path], executor);
}

function Create(path, executor) {
  let pathError = VALIDATE.IsStringInput(path);
  if (pathError)
    return Promise.reject(`Failed to create directory: ${pathError}`);

  if (!executor)
    return Promise.reject(`Failed to create directory: Executor is required`);

  return new Promise((resolve, reject) => {
    MKDIR.Mkdirp(path, executor).then(success => {
      resolve(true);
    }).catch(error => reject(`Failed tp create directory: ${error}`));
  });
}

function Size(path, executor) {
  let pathError = VALIDATE.IsStringInput(path);
  if (pathError)
    return Promise.reject(`Failed to get directory size: ${pathError}`);

  if (!executor)
    return Promise.reject(`Failed to get directory size: Executor is required`);

  return new Promise((resolve, reject) => {
    DISKUSAGE.DirSize(path, executor).then(size => {
      resolve(size);
    }).catch(reject);
  });
}

//--------------------------------------
// EXPORTS

exports.Remove = Remove;
exports.Create = Create;
exports.Size = Size;