let PATH = require('path');
let VALIDATE = require('./validate.js');

//-----------------------------------
// PATH

// This seems like overkill
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

function Filename(path) {
  return PATH.basename(path);
}

function Extension(path) {
  return PATH.extname(path);
}

function ParentDirName(path) {
  return PATH.dirname(path).split(PATH.sep).pop();
}

function ParentDir(path) {
  return PATH.dirname(path); // Full path to parent dir
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
exports.Escape = Escape;
exports.ContainsWhitespace = ContainsWhitespace;