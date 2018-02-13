let PATH = require('./path.js');
let ERROR = require('./error.js').Error;

//-----------------------------------------------
// RENAME
class Rename {
  static rename(currPath, newName) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(currPath);
      if (error) {
        reject(error);
        return;
      }

      error = ERROR.StringError(newName);
      if (error) {
        reject(`newName is ${error}`);
        return;
      }

      PATH.Path.Exists(currPath).then(exists => {
        if (!exists) {
          reject(`Path does not exist: ${currPath}`);
          return;
        }

        let parentDir = PATH.Path.ParentDir(currPath);
        if (parentDir.error) {
          reject(parentDir.error);
          return;
        }

        let updatedPath = PATH.join(parentDir.dir, newName);

        FS.rename(currPath, updatedPath, (err) => {
          if (err) {
            reject(`Failed to rename: ${err}`);
            return;
          }
          resolve(true);
        });
      }).catch(reject);
    });
  }
}

//------------------------------------
// EXPORTS

exports.Rename = Rename;