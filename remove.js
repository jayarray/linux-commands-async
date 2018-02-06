let PATH = require('./path.js');
let FS = require('fs-extra');
var RIMRAF = require('rimraf');

//-------------------------------------------------
// REMOVE (rm)

class Remove {
  static File(path) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(path);
      if (error) {
        reject(error);
        return;
      }

      PATH.Path.Exists(path).then(exists => {
        if (!exists) {
          reject(`Path does not exist: ${path}`);
          return;
        }

        PATH.Path.IsFile(path).then(isFile => {
          if (!isFile) {
            resolve(`Path is not a file: ${path}`);
            return;
          }

          FS.unlink(path, (err) => {
            if (err) {
              reject(`Failed to remove file: ${err}`);
              return;
            }
            resolve(true);
          });
        }).catch(reject);
      }).catch(reject);
    });
  }

  static Directory(path) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(path);
      if (error) {
        reject(error);
        return;
      }

      PATH.Path.Exists(path).then(exists => {
        if (!exists) {
          reject(`Path does not exist: ${path}`);
          return;
        }

        PATH.Path.IsDir(path).then(isDir => {
          if (!isDir) {
            resolve(`Path is not a directory: ${path}`);
            return;
          }

          RIMRAF(path, (err) => {
            if (err) {
              reject(`Failed to remove directory: ${err}`);
              return;
            }
            resolve(true);
          });
        }).catch(reject);
      }).catch(reject);
    });
  }
}

//------------------------------
// EXPORTS

exports.Remove = Remove;