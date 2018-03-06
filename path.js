let PATH = require('path');
let VALIDATE = require('./validate.js');

//-----------------------------------
// PATH

function IsFileOrDirectoryDict(paths, executor) {
  let pathsError = PathsValidator(paths);
  if (pathsError)
    return Promise.reject(`Failed to determine if paths are files or directories: ${pathsError}`);

  if (!executor)
    return Promise.reject(`Failed to determine if paths are files or directories: Executor is required`);

  return new Promise((resolve, reject) => {
    let cmdList = [];
    paths.forEach(path => {
      let cmd = `if [ -e ${path} ]; then`;
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

function IsFileOrDirectory(path, executor) {
  let pathError = PathValidator(path);
  if (pathError)
    return Promise.reject(`Failed to determine if path is file or directory: ${pathError}`);

  if (!executor)
    return Promise.reject(`Failed to determine if path is file or directory: Executor is required`);

  return new Promise((resolve, reject) => {
    IsFileOrDirectoryDict([path], executor).then(dict => {
      resolve(dict[path]);
    }).catch(error => `Failed to determine if path is file or directory: ${error}`);
  });
}

function Exists(path, executor) {
  let pathError = PathValidator(path);
  if (pathError)
    return Promise.reject(`Failed to check if path exists: ${pathError}`);

  if (!executor)
    return Promise.reject(`Failed to check if path exists: Executor is required`);

  return new Promise((resolve, reject) => {
    IsFileOrDirectoryDict([path], executor).then(dict => {
      let val = dict[path];

      if (val == 'invalid') {
        reject(`Failed to check if path exists: Path is invalid`);
        return;
      }

      if (val == 'f' || val == 'd')
        resolve(true);
      else if (val == 'dne')
        resolve(false);
    }).catch(error => reject(`Failed to check if path exists: ${error}`));
  });
}

function ExistsDict(paths, executor) {
  let pathsError = PathsValidator(paths);
  if (pathsError)
    return Promise.reject(`Failed to check if all paths exist: ${pathsError}`);

  if (!executor)
    return Promise.reject(`Failed to check if all paths exist: Executor is required`);

  return new Promise((resolve, reject) => {
    IsFileOrDirectoryDict(paths, executor).then(dict => {
      let existsDict = {};

      for (let i = 0; i < paths.length; ++i) {
        let currPath = paths[i];
        let currDictResult = dict[currPath];

        if (currDictResult == 'f' || currDictResult == 'd')
          existsDict[currPath] = true;
        else
          existsDict[currPath] = false;
      }

      resolve(existsDict);
    }).catch(error => reject(`Failed to check if path exists: ${error}`));
  });
}

function IsFile(path, executor) {
  let pathError = PathValidator(path);
  if (pathError)
    return Promise.reject(`Failed to check if path is a file: ${pathError}`);

  if (!executor)
    return Promise.reject(`Failed to check if path is a file: Executor is required`);

  return new Promise((resolve, reject) => {
    IsFileOrDirectoryDict([path], executor).then(dict => {
      let val = dict[path];

      if (val == 'dne') {
        reject(`Failed to check if path is a file: path does not exist: ${path}`);
        return;
      }

      if (val == 'invalid') {
        reject(`Failed to check if path is a file: path is invalid`);
        return;
      }

      if (val == 'f')
        resolve(true);
      else
        resolve(false);
    }).catch(error => reject(`Failed to check if path is a file: ${error}`));
  });
}

function IsFileDict(paths, executor) {
  let pathsError = PathsValidator(paths);
  if (pathsError)
    return Promise.reject(`Failed to check if all paths are files: ${pathsError}`);

  if (!executor)
    return Promise.reject(`Failed to check if all paths are files: Executor is required`);

  return new Promise((resolve, reject) => {
    IsFileOrDirectoryDict(paths, executor).then(dict => {
      // Check for any DNE paths
      let dnePaths = [];
      paths.forEach(path => {
        if (dict[path] == 'dne')
          dnePaths.push(path);
      });

      // Report any missing paths
      if (dnePaths.length > 0) {
        let errorStr = '';
        if (dnePaths.length == 1)
          errorStr = `Failed to check if all paths are files: This path does not exist: ${dnePaths[0]}`;
        else
          errorStr = `Failed to check if all paths are files: The following (${dnePaths.length}) paths do not exist:\n${dnePaths.join('\n')}`;

        reject(errorStr);
        return;
      }

      // Check for any INVALID paths
      let invalidPaths = [];
      paths.forEach(path => {
        if (dict[path] == 'invalid')
          invalidPaths.push(path);
      });

      // Report any INVALID paths
      if (invalidPaths.length > 0) {
        let errorStr = '';
        if (invalidPaths.length == 1)
          errorStr = `Failed to check if all paths are files: This path is invalid: ${invalidPaths[0]}`;
        else
          errorStr = `Failed to check if all paths are files: The following (${invalidPaths.length}) paths are invalid:\n${invalidPaths.join('\n')}`;

        reject(errorStr);
        return;
      }

      // Create dict
      let isFileDict = {};
      paths.forEach(path => {
        isFileDict[path] = dict[path] == 'f';
      });

      resolve(isFileDict);
    }).catch(error => `Failed to check if all paths are files: ${error}`);
  });
}

function IsDir(path, executor) {
  let pathError = PathValidator(path);
  if (pathError)
    return Promise.reject(`Failed to check if path is a directory: ${pathError}`);

  if (!executor)
    return Promise.reject(`Failed to check if path is a directory: Executor is required`);

  return new Promise((resolve, reject) => {
    IsFileOrDirectoryDict([path], executor).then(dict => {
      let val = dict[path];

      if (val == 'dne') {
        reject(`Failed to check if path is a directory: path does not exist: ${path}`);
        return;
      }

      if (val == 'invalid') {
        reject(`Failed to check if path is a directory: path is invalid`);
        return;
      }

      if (val == 'd')
        resolve(true);
      else
        resolve(false);
    }).catch(error => reject(`Failed to check if path is a directory: ${error}`));
  });
}

function IsDirDict(paths, executor) {
  let pathsError = PathsValidator(paths);
  if (pathsError)
    return Promise.reject(`Failed to check if all paths are directories: ${pathsError}`);

  if (!executor)
    return Promise.reject(`Failed to check if all paths are directories: Executor is required`);

  return new Promise((resolve, reject) => {
    IsFileOrDirectoryDict(paths, executor).then(dict => {
      // Check for any DNE paths
      let dnePaths = [];
      paths.forEach(path => {
        if (dict[path] == 'dne')
          dnePaths.push(path);
      });

      // Report any missing paths
      if (dnePaths.length > 0) {
        let errorStr = '';
        if (dnePaths.length == 1)
          errorStr = `Failed to check if all paths are directories: This path does not exist: ${dnePaths[0]}`;
        else
          errorStr = `Failed to check if all paths are directories: The following (${dnePaths.length}) paths do not exist:\n${dnePaths.join('\n')}`;

        reject(errorStr);
        return;
      }

      // Check for any INVALID paths
      let invalidPaths = [];
      paths.forEach(path => {
        if (dict[path] == 'invalid')
          invalidPaths.push(path);
      });

      // Report any INVALID paths
      if (invalidPaths.length > 0) {
        let errorStr = '';
        if (invalidPaths.length == 1)
          errorStr = `Failed to check if all paths are directories: This path is invalid: ${invalidPaths[0]}`;
        else
          errorStr = `Failed to check if all paths are directories: The following (${invalidPaths.length}) paths are invalid:\n${invalidPaths.join('\n')}`;

        reject(errorStr);
        return;
      }

      // Create dict
      let isDirDict = {};
      paths.forEach(path => {
        isDirDict[path] = dict[path] == 'd';
      });

      resolve(isDirDict);
    }).catch(error => `Failed to check if all paths are files: ${error}`);
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

function Escape(path) {
  return escape(path);
}

function ContainsWhitespace(path) {
  return path.includes(' ');
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
    let currPath = paths[i];
    let invalidType = VALIDATE.IsStringInput(currPath);
    if (invalidType)
      return `paths contain a path that is ${invalidType}`;
  }
  return null;
}

//------------------------------------
// EXPORTS

exports.IsFileOrDirectoryDict = IsFileOrDirectoryDict;
exports.IsFileOrDirectory = IsFileOrDirectory;
exports.Exists = Exists;
exports.ExistsDict = ExistsDict;
exports.IsFile = IsFile;
exports.IsFileDict = IsFileDict;
exports.IsDir = IsDir;
exports.IsDirDict = IsDirDict;
exports.Filename = Filename;
exports.Extension = Extension;
exports.ParentDirName = ParentDirName;
exports.ParentDir = ParentDir;
exports.Escape = Escape;
exports.ContainsWhitespace = ContainsWhitespace;