let PATH = require('path');
let VALIDATE = require('./validate.js');

//-----------------------------------
// PATH

function Exists(path, executor) {
  let pathError = PathValidator(path);
  if (pathError)
    return Promise.reject(`Failed to check if path exists: ${pathError}`);

  if (!executor)
    return Promise.reject(`Failed to check if path exists: Executor is required`);

  return new Promise((resolve, reject) => {
    let cmd = `if [ -e ${path} ]; then echo 1; else echo 0; fi`;

    executor.Execute(cmd, []).then(output => {
      if (output.stderr) {
        reject(`Failed to check if path exists: ${output.stderr}`);
        return;
      }

      let value = parseInt(output.stdout.trim());
      resolve(value == 1);  // 1 is true, 0 is false
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
    let cmdList = [];
    paths.forEach(path => {
      let cmd = `if [ -e ${path} ]; then echo 1; else echo 0; fi`;
      cmdList.push(cmd);
    });

    let cmdStr = cmdList.join('\n');
    executor.Execute(cmdStr, []).then(output => {
      if (output.stderr) {
        reject(`Failed to check if all paths exist: ${output.stderr}`);
        return;
      }

      let boolArray = output.stdout.trim().split('\n').map(line => parseInt(line.trim()) == 1);

      let existsDict = {};
      for (let i = 0; i < paths.length; ++i) {
        let currPath = paths[i];
        existsDict[currPath] = boolArray[i];
      }
      resolve(existsDict);
    }).catch(error => reject(`Failed to check if all paths exist: ${error}`));
  });
}

function AllExist(paths, executor) {
  let pathsError = PathsValidator(paths);
  if (pathsError)
    return Promise.reject(`Failed to check if all paths exist: ${pathsError}`);

  if (!executor)
    return Promise.reject(`Failed to check if all paths exist: Executor is required`);

  return new Promise((resolve, reject) => {
    ExistsDict(paths, executor).then(existsDict => {
      for (let i = 0; i < paths.length; ++i) {
        let currPath = paths[i];
        if (!existsDict[currPath]) {
          resolve(false);
          return;
        }
      }
      resolve(true);
    }).catch(error => reject(`Failed to check if all paths exist: ${error}`));
  });
}

function DoNotExist(paths, executor) {
  let pathsError = PathsValidator(paths);
  if (pathsError)
    return Promise.reject(`Failed to check which paths do not exist: ${pathsError}`);

  if (!executor)
    return Promise.reject(`Failed to check which paths do not exist: Executor is required`);

  return new Promise((resolve, reject) => {
    ExistsDict(paths, executor).then(existsDict => {
      let nonExistantPaths = [];

      for (let i = 0; i < paths.length; ++i) {
        let currPath = paths[i];
        if (!existsDict[currPath])
          nonExistantPaths.push(currPath);
      }
      resolve(nonExistantPaths);
    }).catch(error => reject(`Failed to check which paths do not exist: ${error}`));
  });
}

function IsFile(path, executor) {
  let pathError = PathValidator(path);
  if (pathError)
    return Promise.reject(`Failed to check if path is a file: ${pathError}`);

  if (!executor)
    return Promise.reject(`Failed to check if path is a file: Executor is required`);

  return new Promise((resolve, reject) => {
    Exists(path, executor).then(exists => {
      if (!exists) {
        reject(`Failed to check if path is a file: Path does not exist: ${path}`);
        return;
      }

      let cmd = `if [ -f ${path} ]; then echo 1; else echo 0; fi`;
      executor.Execute(cmd, []).then(output => {
        if (output.stderr) {
          reject(`Failed to check if remote path is a file: ${output.stderr}`);
          return;
        }

        let value = parseInt(output.stdout.trim());
        resolve(value == 1); // 1 is true, 0 is false
      }).catch(error => reject(`Failed to check if path is a file: ${error}`));
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
    ExistsDict(paths, executor).then(existsDict => {

      // Check for any missing paths
      let nonExistantPaths = [];
      paths.forEach(path => {
        if (!existsDict[path])
          nonExistantPaths.push(path);
      });

      // Report any missing paths
      if (nonExistantPaths.length > 0) {
        let errorStr = '';
        if (nonExistantPaths.length == 1)
          errorStr = `Failed to check if all paths are files: This path does not exist: ${nonExistantPaths[0]}`;
        else
          errorStr = `Failed to check if all paths are files: The following (${nonExistantPaths.length}) paths do not exist:\n${nonExistantPaths.join('\n')}`;

        reject(errorStr);
        return;
      }

      let cmdList = [];
      paths.forEach(path => {
        let cmd = `if [ -f ${path} ]; then echo 1; else echo 0; fi`;
        cmdList.push(cmd);
      });

      let cmdStr = cmdList.join('\n');
      executor.Execute(cmdStr, []).then(output => {
        if (output.stderr) {
          reject(`Failed to check if all paths are files: ${output.stderr}`);
          return;
        }

        let boolArray = output.stdout.trim().split('\n').map(line => parseInt(line.trim()) == 1);

        let isFileDict = {};
        for (let i = 0; i < paths.length; ++i) {
          let currPath = paths[i];
          isFileDict[currPath] = boolArray[i];
        }

        resolve(isFileDict);
      }).catch(error => reject(`Failed to check if all paths are files: ${error}`));
    }).catch(error => reject(`Failed to check if all paths are files: ${error}`));
  });
}

function AllAreFiles(paths, executor) {
  let pathsError = PathsValidator(paths);
  if (pathsError)
    return Promise.reject(`Failed to check if all paths are files: ${pathsError}`);

  if (!executor)
    return Promise.reject(`Failed to check if all paths are files: Executor is required`);

  return new Promise((resolve, reject) => {
    IsFileDict(paths, executor).then(isFileDict => {
      for (let i = 0; i < paths.length; ++i) {
        let currPath = paths[i];
        if (!isFileDict[currPath]) {
          resolve(false);
          return;
        }
      }
      resolve(true);
    }).catch(error => reject(`Failed to check if all paths are files: ${error}`));
  });
}

function IsDir(path, executor) {
  let pathError = PathValidator(path);
  if (pathError)
    return Promise.reject(`Failed to check if path is a directory: ${pathError}`);

  if (!executor)
    return Promise.reject(`Failed to check if path is a directory: Executor is required`);

  return new Promise((resolve, reject) => {
    Exists(path, executor).then(exists => {
      if (!exists) {
        reject(`Failed to check if path is a directory: Path does not exist: ${path}`);
        return;
      }

      let cmd = `if [ -d ${path} ]; then echo 1; else echo 0; fi`;
      executor.Execute(cmd, []).then(output => {
        if (output.stderr) {
          reject(`Failed to check if path is a directory: ${output.stderr}`);
          return;
        }

        let value = parseInt(output.stdout.trim());
        resolve(value == 1); // 1 is true, 0 is false
      }).catch(error => reject(`Failed to check if path is a directory: ${error}`));
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
    ExistsDict(paths, executor).then(existsDict => {

      // Check for any missing paths
      let nonExistantPaths = [];
      paths.forEach(path => {
        if (!existsDict[path])
          nonExistantPaths.push(path);
      });

      // Report any missing paths
      if (nonExistantPaths.length > 0) {
        let errorStr = '';
        if (nonExistantPaths.length == 1)
          errorStr = `This path does not exist: ${nonExistantPaths[0]}`;
        else
          errorStr = `The following (${nonExistantPaths.length}) paths do not exist:\n${nonExistantPaths.join('\n')}`;

        reject(errorStr);
        return;
      }

      let cmdList = [];
      paths.forEach(path => {
        let cmd = `if [ -d ${path} ]; then echo 1; else echo 0; fi`;
        cmdList.push(cmd);
      });

      let cmdStr = cmdList.join('\n');
      executor.Execute(cmdStr, []).then(output => {
        if (output.stderr) {
          reject(`Failed to check if all paths are directories: ${output.stderr}`);
          return;
        }

        let boolArray = output.stdout.trim().split('\n').map(line => parseInt(line.trim()) == 1);

        let isDirDict = {};
        for (let i = 0; i < paths.length; ++i) {
          let currPath = paths[i];
          isDirDict[currPath] = boolArray[i];
        }

        resolve(isDirDict);
      }).catch(error => reject(`Failed to check if all paths are directories: ${error}`));
    }).catch(error => reject(`Failed to check if all paths are directories: ${error}`));
  });
}

function AllAreDirs(paths, executor) {
  let pathsError = PathsValidator(paths);
  if (pathsError)
    return Promise.reject(`Failed to check if all paths are directories: ${pathsError}`);

  if (!executor)
    return Promise.reject(`Failed to check if all paths are directories: Executor is required`);

  return new Promise((resolve, reject) => {
    IsDirDict(paths, executor).then(isDirDict => {
      for (let i = 0; i < paths.length; ++i) {
        let currPath = paths[i];
        if (!isDirDict[currPath]) {
          resolve(false);
          return;
        }
      }
      resolve(true);
    }).catch(error => reject(`Failed to check if all paths are directories: ${error}`));
  });
}

function IsFileOrDir(path, executor) {
  let pathError = PathValidator(path);
  if (pathError)
    return Promise.reject(`Failed to determine if path is file or directory: ${pathError}`);

  if (!executor)
    return Promise.reject(`Failed to determine if path is file or directory: Executor is required`);

  return new Promise((resolve, reject) => {
    let cmd = `if [ -e ${path} ]; then`;
    cmd += ` if [ -d ${path} ]; then echo "d";`;
    cmd += ` else`;
    cmd += ` if [ -f ${path} ]; then  echo "f";`;
    cmd += ` else echo "invalid";`;
    cmd += ` fi fi`;
    cmd += ` else echo "dne"; fi`;

    executor.Execute(cmd, []).then(output => {
      if (output.stderr) {
        reject(`Failed to determine if path is file or directory: ${outptu.stderr}`);
        return;
      }
      resolve(output.stdout.trim());
    }).catch(error => `Failed to determine if path is file or directory: ${error}`);
  });
}

function IsFileOrDirDict(paths, executor) {
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

exports.Exists = Exists;
exports.ExistsDict = ExistsDict;
exports.AllExist = AllExist;
exports.DoNotExist = DoNotExist;
exports.IsFile = IsFile;
exports.IsFileDict = IsFileDict;
exports.AllAreFiles = AllAreFiles;
exports.IsDir = IsDir;
exports.IsDirDict = IsDirDict;
exports.AllAreDirs = AllAreDirs;
exports.IsFileOrDir = IsFileOrDir;
exports.IsFileOrDirDict = IsFileOrDirDict;
exports.Filename = Filename;
exports.Extension = Extension;
exports.ParentDirName = ParentDirName;
exports.ParentDir = ParentDir;
exports.Escape = Escape;
exports.ContainsWhitespace = ContainsWhitespace;