let VALIDATE = require('./validate.js');
let REMOVE = require('./remove.js');
let CHMOD = require('./chmod.js');
let PATH = require('./path.js');

//---------------------------------------------------
// FILE

function Remove(path, executor) {
  return REMOVE.Files([path], executor);
}

function Create(path, text, executor) {
  let pathError = VALIDATE.IsStringInput(path);
  if (pathError)
    return Promise.reject(`Failed to create file: path is ${pathError}`);

  let textError = VALIDATE.IsStringInput(text);
  if (textError)
    return Promise.reject(`Failed to create file: text is ${textError}`);

  if (!executor)
    return Promise.reject(`Failed to create file: Executor is required`);

  return new Promise((resolve, reject) => {
    executor.Execute(`echo "${text}" > ${path}`, []).then(output => {
      if (output.stderr) {
        reject(`Failed to create file: ${output.stderr}`);
        return;
      }
      resolve(true);
    }).catch(error => reject(`Failed to create file: ${error}`));
  });
}

function MakeExecutable(path, executor) {
  let pathError = VALIDATE.IsStringInput(path);
  if (pathError)
    return Promise.reject(`Failed to make file executable: path is ${pathError}`);

  if (!executor)
    return Promise.reject(`Failed to make file executable: Executor is required`);

  return new Promise((resolve, reject) => {
    PATH.IsFile(path, executor).then(isFile => {
      if (!isFile) {
        reject(`Failed to make file executable: path is not a file: ${path}`);
        return;
      }

      CHMOD.AddPermissions('ugo', 'x', [path], false, executor).then(success => {
        resolve(true);
      }).catch(error => reject(`Failed to make file executable: ${error}`));
    }).catch(error => reject(`Failed to make file executable: ${error}`));
  });
}

function Read(path, executor) {
  let pathError = VALIDATE.IsStringInput(path);
  if (pathError)
    return Promise.reject(`Failed to read file: path is ${pathError}`);

  if (!executor)
    return Promise.reject(`Failed to read file: Executor is required`);

  return new Promise((resolve, reject) => {
    PATH.IsFile(path, executor).then(isFile => {
      if (!isFile) {
        reject(`Failed to read file: path is not a file: ${path}`);
        return;
      }

      executor.Execute('cat', [path]).then(output => {
        if (output.stderr) {
          reject(`Failed to read file: ${output.stderr}`);
          return;
        }
        resolve(output.stdout);
      }).catch(error => reject(`Failed to read file: ${error}`));
    }).catch(error => reject(`Failed to read file: ${error}`));
  });
}

function ReadLines(path, executor) {
  return new Promise((resolve, reject) => {
    Read(path, executor).then(string => {
      resolve(string.split('\n'));
    }).catch(error => reject(`Failed to read lines: ${error}`));
  });
}

//-------------------------------
// EXPORTS

exports.Remove = Remove;
exports.Create = Create;
exports.MakeExecutable = MakeExecutable;
exports.Read = Read;
exports.ReadLines = ReadLines;