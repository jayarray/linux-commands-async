let PATH = require('path');
let VALIDATE = require('./validate.js');

//-----------------------------------
// PATH

/**
 * Check the status of multiple paths.
 * @param {Array<string>} paths List of paths to query.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise<{path: string}>} Returns a promise. If it resolves, it returns an dictionary of all queried paths, each of which is assigned one of the following strings: 'f' (file), 'd' (directory), 'dne' (does not exist), 'invalid'. Else, it rejects and returns an error.
 */
function Query(paths, executor) {
  let pathsError = PathsValidator(paths);
  if (pathsError)
    return Promise.reject(`Failed to determine if paths are files or directories: ${pathsError}`);

  if (!executor)
    return Promise.reject(`Failed to determine if paths are files or directories: Executor is required`);

  return new Promise((resolve, reject) => {
    let cmdList = [];
    paths.forEach(path => {
      let cmd = `if [ -e ${path} ]; then`; // can you do !exists and return dne to avoid nested ifs?
      cmd += ` if [ -d ${path} ]; then echo "d";`;
      cmd += ` else`;
      cmd += ` if [ -f ${path} ]; then  echo "f";`;
      cmd += ` else echo "invalid";`;
      cmd += ` fi fi`;
      cmd += ` else echo "dne"; fi`;

      cmdList.push(cmd);
    });

    executor.Execute(cmdList.join('\n'), []).then(output => {
      if (output.stderr) {
        reject(`Failed to determine if paths are files or directories: ${outptu.stderr}`);
        return;
      }

      let lines = output.stdout.trim().split('\n')
        .filter(line => line && line != '' && line.trim() != '')
        .map(line => line.trim());

      let dict = {};
      for (let i = 0; i < lines.length; ++i) {
        let currLine = lines[i];
        let currPath = paths[i];
        dict[currPath] = currLine;
      }

      resolve(dict);
    }).catch(error => `Failed to determine if paths are files or directories: ${error}`);
  });
}

/**
 * Check if path exists.
 * @param {string} path
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise<boolean>} Returns a promise. If it resolves, it returns a boolean value. Else, it returns an error.
 */
function Exists(path, executor) {
  let pathError = PathValidator(path);
  if (pathError)
    return Promise.reject(`Failed to check if path exists: ${pathError}`);

  if (!executor)
    return Promise.reject(`Failed to check if path exists: Executor is required`);

  return new Promise((resolve, reject) => {
    Query([path], executor).then(dict => {
      let type = dict[path];
      if (type == 'f' || type == 'd')
        resolve(true);
      else
        resolve(false);
    }).catch(error => reject(`Failed to check if path is a file: ${error}`));
  });
}

/**
 * Check if path is a file.
 * @param {string} path
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise<boolean>} Returns a promise. If it resolves, it returns a boolean value. Else it returns an error.
 */
function IsFile(path, executor) {
  let pathError = PathValidator(path);
  if (pathError)
    return Promise.reject(`Failed to check if path is a file: ${pathError}`);

  if (!executor)
    return Promise.reject(`Failed to check if path is a file: Executor is required`);

  return new Promise((resolve, reject) => {
    Query([path], executor).then(dict => {
      if (dict[path] == 'f')
        resolve(true);
      else
        resolve(false);
    }).catch(error => reject(`Failed to check if path is a file: ${error}`));
  });
}

/**
 * Check if path is a directory.
 * @param {string} path
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise<boolean>} Returns a promise. If it resolves, it returns a boolean value. Else, it returns an error.
 */
function IsDir(path, executor) {
  let pathError = PathValidator(path);
  if (pathError)
    return Promise.reject(`Failed to check if path is a directory: ${pathError}`);

  if (!executor)
    return Promise.reject(`Failed to check if path is a directory: Executor is required`);

  return new Promise((resolve, reject) => {
    Query([path], executor).then(dict => {
      if (dict[path] == 'd')
        resolve(true);
      else
        resolve(false);
    }).catch(error => reject(`Failed to check if path is a directory: ${error}`));
  });
}

/**
 * Get filename from path.
 * @param {string} path
 * @returns {string} Returns a string containing the filename.
 */
function Filename(path) {
  return PATH.basename(path);
}

/**
 * Get file extension from path.
 * @param {string} path
 * @returns {string} Returns a string containing the file extension.
 */
function Extension(path) {
  return PATH.extname(path);
}

/**
 * Get parent name from path.
 * @param {string} path
 * @returns {string} Returns a string containing the parent directory name.
 */
function ParentDirName(path) {
  return PATH.dirname(path).split(PATH.sep).pop();
}

/**
 * Get parent directory from path.
 * @param {string} path
 * @returns {string} Returns a string containing full path to parent directory.
 */
function ParentDir(path) {
  return PATH.dirname(path);
}

//---------------------------------
// HELPERS

function PathValidator(p) {
  let error = VALIDATE.IsStringInput(p);
  if (error)
    return `Path is ${error}`;
  return null;
}

function PathsValidator(paths) {
  let error = VALIDATE.IsArray(paths);
  if (error)
    return `paths are ${error}`;

  for (let i = 0; i < paths.length; ++i) {
    let invalidType = VALIDATE.IsStringInput(paths[i]);
    if (invalidType)
      return `paths contain a path that is ${invalidType}`;
  }
  return null;
}

//------------------------------------
// EXPORTS

exports.Query = Query;
exports.Exists = Exists;
exports.IsFile = IsFile;
exports.IsDir = IsDir;
exports.Filename = Filename;
exports.Extension = Extension;
exports.ParentDirName = ParentDirName;
exports.ParentDir = ParentDir;