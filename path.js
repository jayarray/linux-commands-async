let PATH = require('path');
let VALIDATE = require('./validate.js');

//-----------------------------------
// PATH

class Path {
  static Exists(path, executor) {
    let pathError = Error.PathValidator(path);
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

  static ExistsDict(paths, executor) {
    let pathsError = Error.PathsValidator(paths);
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
      }).catch(error => `Failed to check if all paths exist: ${error}`);
    });
  }

  static AllExist(paths, executor) {
    let pathsError = Error.PathsValidator(paths);
    if (pathsError)
      return Promise.reject(`Failed to check if all paths exist: ${pathsError}`);

    if (!executor)
      return Promise.reject(`Failed to check if all paths exist: Executor is required`);

    return new Promise((resolve, reject) => {
      Path.ExistsDict(paths, executor).then(existsDict => {
        for (let i = 0; i < paths.length; ++i) {
          let currPath = paths[i];
          if (!existsDict[currPath]) {
            resolve(false);
            return;
          }
        }
        resolve(true);
      }).catch(error => `Failed to check if all paths exist: ${error}`);
    });
  }

  static DoNotExist(paths, executor) {
    let pathsError = Error.PathsValidator(paths);
    if (pathsError)
      return Promise.reject(`Failed to check which paths do not exist: ${pathsError}`);

    if (!executor)
      return Promise.reject(`Failed to check which paths do not exist: Executor is required`);

    return new Promise((resolve, reject) => {
      Path.ExistsDict(paths, executor).then(existsDict => {
        let nonExistantPaths = [];

        for (let i = 0; i < paths.length; ++i) {
          let currPath = paths[i];
          if (!existsDict[currPath])
            nonExistantPaths.push(currPath);
        }
        resolve(nonExistantPaths);
      }).catch(error => `Failed to check which paths do not exist: ${error}`);
    });
  }

  static IsFile(path, executor) {
    let pathError = Error.PathValidator(path);
    if (pathError)
      return Promise.reject(`Failed to check if path is a file: ${pathError}`);

    if (!executor)
      return Promise.reject(`Failed to check if path is a file: Executor is required`);

    return new Promise((resolve, reject) => {
      Path.Exists(path, executor).then(exists => {
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

  static IsFileDict(paths, executor) {
    let pathsError = Error.PathsValidator(paths);
    if (pathsError)
      return Promise.reject(`Failed to check if all paths are files: ${pathsError}`);

    if (!executor)
      return Promise.reject(`Failed to check if all paths are files: Executor is required`);

    return new Promise((resolve, reject) => {
      Path.ExistsDict(paths, executor).then(existsDict => {

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
        }).catch(error => `Failed to check if all paths are files: ${error}`);
      }).catch(error => `Failed to check if all paths are files: ${error}`);
    });
  }

  static AllAreFiles(paths, executor) {
    let pathsError = Error.PathsValidator(paths);
    if (pathsError)
      return Promise.reject(`Failed to check if all paths are files: ${pathsError}`);

    if (!executor)
      return Promise.reject(`Failed to check if all paths are files: Executor is required`);

    return new Promise((resolve, reject) => {
      Path.IsFileDict(paths, executor).then(isFileDict => {
        for (let i = 0; i < paths.length; ++i) {
          let currPath = paths[i];
          if (!isFileDict[currPath]) {
            resolve(false);
            return;
          }
        }
        resolve(true);
      }).catch(error => `Failed to check if all paths are files: ${error}`);
    });
  }

  static IsDir(path, executor) {
    let pathError = Error.PathValidator(path);
    if (pathError)
      return Promise.reject(`Failed to check if path is a directory: ${pathError}`);

    if (!executor)
      return Promise.reject(`Failed to check if path is a directory: Executor is required`);

    return new Promise((resolve, reject) => {
      Path.Exists(path, executor).then(exists => {
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

  static IsDirDict(paths, executor) {
    let pathsError = Error.PathsValidator(paths);
    if (pathsError)
      return Promise.reject(`Failed to check if all paths are directories: ${pathsError}`);

    if (!executor)
      return Promise.reject(`Failed to check if all paths are directories: Executor is required`);

    return new Promise((resolve, reject) => {
      Path.ExistsDict(paths, executor).then(existsDict => {

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
        }).catch(error => `Failed to check if all paths are directories: ${error}`);
      }).catch(error => `Failed to check if all paths are directories: ${error}`);
    });
  }

  static AllAreDirs(paths, executor) {
    let pathsError = Error.PathsValidator(paths);
    if (pathsError)
      return Promise.reject(`Failed to check if all paths are directories: ${pathsError}`);

    if (!executor)
      return Promise.reject(`Failed to check if all paths are directories: Executor is required`);

    return new Promise((resolve, reject) => {
      Path.IsDirDict(paths, executor).then(isDirDict => {
        for (let i = 0; i < paths.length; ++i) {
          let currPath = paths[i];
          if (!isDirDict[currPath]) {
            resolve(false);
            return;
          }
        }
        resolve(true);
      }).catch(error => `Failed to check if all paths are directories: ${error}`);
    });
  }

  static Filename(path) {
    return PATH.basename(path);
  }

  static Extension(path) {
    return PATH.extname(path);
  }

  static ParentDirName(path) {
    return PATH.dirname(path).split(PATH.sep).pop();
  }

  static ParentDir(path) {
    return PATH.dirname(path); // Full path to parent dir
  }

  static Escape(path) {
    return escape(path);
  }

  static ContainsWhitespace(path) {
    return path.includes(' ');
  }
}

//---------------------------------
// HELPERS

class Error {
  static PathValidator(p) {
    let error = VALIDATE.IsStringInput(p);
    if (error)
      return `Path is ${error}`;
    return null;
  }

  static PathsValidator(paths) {
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
}

//------------------------------------
// EXPORTS

exports.Path = Path;