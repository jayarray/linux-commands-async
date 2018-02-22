let PATH = require('path');
let ERROR = require('./error.js');
let COMMAND = require('./command.js').Command;
let LINUX_COMMANDS = require('./linuxcommands.js');

//-----------------------------------
// PATH
class Path {
  static Exists(path, executor) {
    return new Promise((resolve, reject) => {
      let pathError = Error.PathValidator(path);
      if (pathError) {
        reject(`Failed to check if path exists: ${pathError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to check if path exists: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.PathExists(path);
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to check if path exists: ${output.stderr}`);
          return;
        }

        let value = parseInt(output.stdout.trim());
        resolve(value == 1);  // 1 is true, 0 is false
      }).catch(error => {
        reject(`Failed to check if path exists: ${error}`);
      });
    });
  }

  static ExistsDict(paths, executor) {
    return new Promise((resolve, reject) => {
      let sourcesError = Error.SourcesValidator(paths);
      if (sourcesError) {
        reject(`Failed to check if all paths exist: ${sourcesError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to check if all paths exist: Connection is ${executorError}`);
        return;
      }

      let cmdList = [];
      paths.forEach(path => {
        let cmd = LINUX_COMMANDS.PathExists(path);
        cmdList.push(cmd);
      });

      let cmdStr = cmdList.join('\n');
      COMMAND.Execute(cmdStr, [], executor).then(output => {
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
    return new Promise((resolve, reject) => {
      let sourcesError = Error.SourcesValidator(paths);
      if (sourcesError) {
        reject(`Failed to check if all paths exist: ${sourcesError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to check if all paths exist: Connection is ${executorError}`);
        return;
      }

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

  static IsFile(path, executor) {
    return new Promise((resolve, reject) => {
      let pathError = Error.PathValidator(path);
      if (pathError) {
        reject(`Failed to check if path is a file: ${pathError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to check if path is a file: Connection is ${executorError}`);
        return;
      }

      Path.Exists(path, executor).then(exists => {
        if (!exists) {
          reject(`Failed to check if path is a file: Path does not exist: ${path}`);
          return;
        }

        let cmd = LINUX_COMMANDS.PathIsFile(path);
        COMMAND.Execute(cmd, [], executor).then(output => {
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
    return new Promise((resolve, reject) => {
      let sourcesError = Error.SourcesValidator(paths);
      if (sourcesError) {
        reject(`Failed to check if all paths are files: ${sourcesError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to check if all paths are files: Connection is ${executorError}`);
        return;
      }

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
          let cmd = LINUX_COMMANDS.PathIsFile(path);
          cmdList.push(cmd);
        });

        let cmdStr = cmdList.join('\n');
        COMMAND.Execute(cmdStr, [], executor).then(output => {
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
    return new Promise((resolve, reject) => {
      let sourcesError = Error.SourcesValidator(paths);
      if (sourcesError) {
        reject(`Failed to check if all paths are files: ${sourcesError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to check if all paths are files: Connection is ${executorError}`);
        return;
      }

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
    return new Promise((resolve, reject) => {
      let pathError = Error.PathValidator(path);
      if (pathError) {
        reject(`Failed to check if path is a directory: ${pathError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to check if path is a directory: Connection is ${executorError}`);
        return;
      }

      Path.Exists(path, executor).then(exists => {
        if (!exists) {
          reject(`Failed to check if path is a directory: Path does not exist: ${path}`);
          return;
        }

        let cmd = LINUX_COMMANDS.PathIsDir(path);
        COMMAND.Execute(cmd, [], executor).then(output => {
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
    return new Promise((resolve, reject) => {
      let sourcesError = Error.SourcesValidator(paths);
      if (sourcesError) {
        reject(`Failed to check if all paths are directories: ${sourcesError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to check if all paths are directories: Connection is ${executorError}`);
        return;
      }

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
          let cmd = LINUX_COMMANDS.PathIsDir(path);
          cmdList.push(cmd);
        });

        let cmdStr = cmdList.join('\n');
        COMMAND.Execute(cmdStr, [], executor).then(output => {
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
    return new Promise((resolve, reject) => {
      let sourcesError = Error.SourcesValidator(paths);
      if (sourcesError) {
        reject(`Failed to check if all paths are directories: ${sourcesError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to check if all paths are directories: Connection is ${executorError}`);
        return;
      }

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
    let error = Error.PathValidator(path);
    if (error)
      return { string: null, error: error };
    return { string: PATH.basename(path), error: null };
  }

  static Extension(path) {
    let error = Error.PathValidator(path);
    if (error)
      return { string: null, error: error };
    return { string: PATH.extname(path), error: null };
  }

  static ParentDirName(path) {
    let error = Error.PathValidator(path);
    if (error)
      return { string: null, error: error };
    return { string: PATH.dirname(path).split(PATH.sep).pop(), error: null };
  }

  static ParentDir(path) {
    let error = Error.PathValidator(path);
    if (error)
      return { string: null, error: error };
    return { string: PATH.dirname(path), error: null }; // Full path to parent dir
  }

  static Escape(path) {
    let error = ERROR.NullOrUndefined(path);
    if (error)
      return { string: null, error: `Path is ${error}` };
    return { string: escape(path), error: null };
  }

  static ContainsWhitespace(path) {
    let error = ERROR.NullOrUndefined(path);
    if (error)
      return { bool: null, error: `Path is ${error}` };
    return { bool: path.includes(' '), error: null };
  }
}

//---------------------------------
// HELPERS

class Error {
  static PathValidator(p) {
    let error = ERROR.StringValidator(p);
    if (error)
      return `Path is ${error}`;
    return null;
  }

  static SourcesValidator(sources) {
    let error = ERROR.ArrayValidator(sources);
    if (error)
      return `sources are ${error}`;

    for (let i = 0; i < sources.length; ++i) {
      let currSrc = sources[i];
      let invalidType = ERROR.StringValidator(currSrc);
      if (invalidType)
        return `sources contains a path that is ${invalidType}`;
    }
    return null;
  }
}

//------------------------------------
// EXPORTS

exports.Path = Path;
exports.Error = Error;