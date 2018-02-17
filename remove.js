let PATH = require('./path.js');
let FS = require('fs-extra');
var RIMRAF = require('rimraf');
let COMMAND = require('./command.js').Command;

//-------------------------------------------------
// REMOVE (rm)

class Remove {
  static File(path, remoteExecutor = null) {
    return new Promise((resolve, reject) => {
      let pathError = PATH.Error.PathValidator(path);
      if (pathError) {
        reject(`Failed to remove file: ${pathError}`);
        return;
      }

      if (remoteExecutor === undefined) {
        reject(`Failed to remove file: Connection is undefined`);
        return;
      }

      if (remoteExecutor == null) {
        PATH.Path.Exists(path).then(exists => {
          if (!exists) {
            reject(`Failed to remove local file: Path does not exist: ${path}`);
            return;
          }

          PATH.Path.IsFile(path).then(isFile => {
            if (!isFile) {
              reject(`Failed to remove local file: Path is not a file: ${path}`);
              return;
            }

            FS.unlink(path, (err) => {
              if (err) {
                reject(`Failed to remove local file: ${err}`);
                return;
              }
              resolve(true);
            });
          }).catch(error => reject(`Failed to remove local file: ${error}`));
        }).catch(error => reject(`Failed to remove local file: ${error}`));
      }
      else {
        PATH.Path.Exists(path, remoteExecutor).then(exists => {
          if (!exists) {
            reject(`Failed to remove remote file: Path does not exist: ${path}`);
            return;
          }

          PATH.Path.IsFile(path, remoteExecutor).then(isFile => {
            if (!isFile) {
              reject(`Failed to remove remote file: Path is not a file: ${path}`);
              return;
            }

            let cmdStr = CommandStringBuiler.RemoveFile(path);

            COMMAND.Execute(cmdStr, [], remoteExecutor).then(output => {
              if (output.stderr) {
                reject(`Failed to remove remote file: ${output.stderr}`);
                return;
              }
              resolve(true);
            }).catch(error => reject(`Failed to remove remote file: ${error}`));
          }).catch(error => reject(`Failed to remove remote file: Path does not exist: ${path}`));
        }).catch(error => reject(`Failed to remove remote file: ${error}`));
      }
    });
  }

  static Directory(path, remoteExecutor = null) {
    return new Promise((resolve, reject) => {
      let pathError = PATH.Error.PathValidator(path);
      if (pathError) {
        reject(`Failed to remove directory: ${pathError}`);
        return;
      }

      if (remoteExecutor === undefined) {
        reject(`Failed to remove directory: Connection is undefined`);
        return;
      }

      if (remoteExecutor == null) {
        PATH.Path.Exists(path).then(exists => {
          if (!exists) {
            reject(`Failed to remove local directory: Path does not exist: ${path}`);
            return;
          }

          PATH.Path.IsDir(path).then(isDir => {
            if (!isDir) {
              reject(`Failed to remove local directory: Path is not a directory: ${path}`);
              return;
            }

            RIMRAF(path, (err) => {
              if (err) {
                reject(`Failed to remove local directory: ${err}`);
                return;
              }
              resolve(true);
            });
          }).catch(error => reject(`Failed to remove local directory: ${error}`));
        }).catch(error => reject(`Failed to remove local directory: ${error}`));
      }
      else {
        PATH.Path.Exists(path, remoteExecutor).then(exists => {
          if (!exists) {
            reject(`Failed to remove remote directory: Path does not exist: ${path}`);
            return;
          }

          PATH.Path.IsDir(path, remoteExecutor).then(isDir => {
            if (!isDir) {
              reject(`Failed to remove remote directory: Path is not a file: ${path}`);
              return;
            }

            let cmdStr = CommandStringBuiler.RemoveDir(path);

            COMMAND.Execute(cmdStr, [], remoteExecutor).then(output => {
              if (output.stderr) {
                reject(`Failed to remove remote directory: ${output.stderr}`);
                return;
              }
              resolve(true);
            }).catch(error => reject(`Failed to remove remote directory: ${error}`));
          }).catch(error => reject(`Failed to remove remote directory: Path does not exist: ${path}`));
        }).catch(error => reject(`Failed to remove remote directory: ${error}`));
      }
    });
  }
}

//---------------------------------
// COMMAND STRING BUILDER
class CommandStringBuiler {
  static RemoveFile(path) {
    return `rm -f ${path}`;
  }

  static RemoveDir(path) {
    return `rm -rf ${path}`;
  }
}

//------------------------------
// EXPORTS

exports.Remove = Remove;