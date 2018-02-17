let PATH = require('path');
let FS = require('fs-extra');
let ERROR = require('./error.js');
let COMMAND = require('./command.js').Command;

//-----------------------------------
// PATH
class Path {
  static Exists(path, remoteExecutor = null) {
    return new Promise((resolve, reject) => {
      let pathError = Error.PathValidator(path);
      if (pathError) {
        reject(`Failed to check if path exists: ${pathError}`);
        return;
      }

      if (remoteExecutor === undefined) {
        reject(`Failed to check if path exists: Connection is undefined`);
        return;
      }

      if (remoteExecutor == null) { // Local (uses FS)
        FS.access(path, FS.F_OK, (err) => {
          if (err)
            resolve(false);
          else
            resolve(true);
          return;
        });
      }
      else {
        let cmdStr = CommandStringBuiler.Exists(path);

        COMMAND.Execute(cmdStr, [], remoteExecutor).then(output => {
          if (output.stderr) {
            reject(`Failed to check if path exists: ${output.stderr}`);
            return;
          }

          let value = parseInt(output.stdout.trim());
          resolve(value == 1);  // 1 is true, 0 is false
        }).catch(error => {
          reject(`Failed to check if path exists: ${error}`);
        });
      }
    });
  }

  static IsFile(path, remoteExecutor = null) {
    return new Promise((resolve, reject) => {
      if (remoteExecutor == null) {
        Path.Exists(path).then(exists => {
          if (!exists) {
            reject(`Failed to check if local path is a file: Path does not exist: ${path}`);
            return;
          }

          FS.lstat(path, (err, stats) => {
            if (err)
              reject(`Failed to check if local path is a file: ${err}`);
            else
              resolve(stats.isFile() && !stats.isDirectory());
          });
        }).catch(error => {
          reject(`Failed to check if local path is a file: ${error}`);
        });
      }
      else {
        Path.Exists(path, remoteExecutor).then(exists => {
          if (!exists) {
            reject(`Failed to check if remote path is a file: Path does not exist: ${path}`);
            return;
          }

          let cmdStr = CommandStringBuiler.IsFile(path);

          COMMAND.Execute(cmdStr, [], remoteExecutor).then(output => {
            if (output.stderr) {
              reject(`Failed to check if remote path is a file: ${output.stderr}`);
              return;
            }

            let value = parseInt(output.stdout.trim());
            resolve(value == 1);
          }).catch(error => {
            reject(`Failed to check if remote path is a file: ${error}`);
          });
        }).catch(error => {
          reject(`Failed to check if remote path is a file: ${error}`);
        });
      }
    });
  }

  static IsDir(path, remoteExecutor = null) {
    return new Promise((resolve, reject) => {
      if (remoteExecutor == null) {
        Path.Exists(path).then(exists => {
          if (!exists) {
            reject(`Failed to check if local path is a directory: Path does not exist: ${path}`);
            return;
          }

          FS.lstat(path, (err, stats) => {
            if (err)
              reject(`Failed to check if local path is a directory: ${err}`);
            else
              resolve(stats.isDirectory());
          });
        }).catch(error => {
          reject(`Failed to check if local path is a directory: ${error}`);
        });
      }
      else {
        Path.Exists(path, remoteExecutor).then(exists => {
          if (!exists) {
            reject(`Failed to check if remote path is a directory: Path does not exist: ${path}`);
            return;
          }

          let cmdStr = CommandStringBuiler.IsDir(path);

          COMMAND.Execute(cmdStr, [], remoteExecutor).then(output => {
            if (output.stderr) {
              reject(`Failed to check if remote path is a directory: ${output.stderr}`);
              return;
            }

            let value = parseInt(output.stdout.trim());
            resolve(value == 1);
          }).catch(error => {
            reject(`Failed to check if remote path is a directory: ${error}`);
          });
        }).catch(error => {
          reject(`Failed to check if remote path is a directory: ${error}`);
        });
      }
    });
  }

  static Filename(path) {
    let error = Error.PathValidator(path);
    if (error)
      return { name: null, error: error };
    return { name: PATH.basename(path), error: null };
  }

  static Extension(path) {
    let error = Error.PathValidator(path);
    if (error)
      return { extension: null, error: error };
    return { extension: PATH.extname(path), error: null };
  }

  static ParentDirName(path) {
    let error = Error.PathValidator(path);
    if (error)
      return { name: null, error: error };
    return { name: PATH.dirname(path).split(PATH.sep).pop(), error: null };
  }

  static ParentDir(path) {
    let error = Error.PathValidator(path);
    if (error)
      return { dir: null, error: error };
    return { dir: PATH.dirname(path), error: null }; // Full path to parent dir
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
      return { hasWhitespace: null, error: `Path is ${error}` };
    return { hasWhitespace: path.includes(' '), error: null };
  }
}

//---------------------------------
// COMMAND STRING BUILDER

class CommandStringBuiler {
  static Exists(path) {
    return `if [ -e ${path}]; then echo 1; else echo 0; fi`;
  }

  static IsFile(path) {
    return `if [ -f ${path}]; then echo 1; else echo 0; fi`;
  }

  static IsDir(path) {
    return `if [ -d ${path}]; then echo 1; else echo 0; fi`;
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
}

//------------------------------------
// EXPORTS

exports.Path = Path;
exports.CommandStringBuiler = CommandStringBuiler;
exports.Error = Error;