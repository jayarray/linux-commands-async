let VALIDATE = require('./validate.js');
let REMOVE = require('./remove.js');
let CHMOD = require('./chmod.js');
let PATH = require('./path.js');

//---------------------------------------------------
// FILE

/**
 * Delete a file.
 * @param {string} path
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise that resolves if successful, otherwise it returns an error.
 */
function Remove(path, executor) {
  return REMOVE.Files([path], executor);
}

/**
 * Create a file.
 * @param {string} path
 * @param {string} text
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise that will resolve if successful, otherwise it returns an error.
 */
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
      resolve();
    }).catch(error => reject(`Failed to create file: ${error}`));
  });
}

/**
 * Make file executable.
 * @param {string} path
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise that will resolve if successful, otherwise it returns an error.
 */
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
        resolve();
      }).catch(error => reject(`Failed to make file executable: ${error}`));
    }).catch(error => reject(`Failed to make file executable: ${error}`));
  });
}

/**
 * Retrieve file content as a single string.
 * @param {string} path
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise<string>} Returns a promise. If it resolves, it returns a string. Else, it returns an error.
 */
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

/**
 * Retrieve file content as multiple strings.
 * @param {string} path
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise<string>} Returns a promise. If it resolves, it returns an array of strings representing lines of text. Else, it returns an error.
 */
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