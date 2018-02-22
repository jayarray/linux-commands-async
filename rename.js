let _path = require('path');

let PATH = require('./path.js');
let ERROR = require('./error.js');
let MOVE = require('./move.js').Move;

//-----------------------------------------------
// RENAME
class Rename {
  static Rename(src, newName, executor) {
    return new Promise((resolve, reject) => {
      let srcError = PATH.Error.PathValidator(src);
      if (srcError) {
        reject(`Failed to rename: Source is ${srcError}`);
        return;
      }

      let newNameIsValid = typeof newName == 'string' && newName != '';
      if (!newNameIsValid) {
        reject(`Failed to rename: New name must be a string type and cannot be empty`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to rename: Connection is ${executorError}`);
        return;
      }

      let parentDir = PATH.Path.ParentDir(src);
      if (parentDir.error) {
        reject(`Failed to rename: ${parentDir.error}`);
        return;
      }

      let updatedPath = _path.join(parentDir.string, newName);
      MOVE.Move(src, updatedPath, executor).then(success => {
        resolve(true);
      }).catch(error => reject(`Failed to rename: ${error}`));
    });
  }
}

//------------------------------------
// EXPORTS

exports.Rename = Rename;