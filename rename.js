let _path = require('path');

let PATH = require('./path.js').Path;
let MOVE = require('./move.js').Move;
let VALIDATE = require('./validate.js');

//-----------------------------------------------
// RENAME

class Rename {
  static Rename(src, newName, executor) {
    let srcError = VALIDATE.IsStringInput(src);
    if (srcError)
      return Promise.reject(`Failed to rename: Source is ${srcError}`);

    let newNameIsValid = typeof newName == 'string' && newName != '';
    if (!newNameIsValid)
      return Promise.reject(`Failed to rename: New name must be a string type and cannot be empty`);

    if (!executor)
      return Promise.reject(`Failed to rename: Executor is required`);

    return new Promise((resolve, reject) => {
      let parentDir = PATH.ParentDir(src);
      let dest = _path.join(parentDir, newName);

      MOVE.Move(src, dest, executor).then(success => {
        resolve(true);
      }).catch(error => reject(`Failed to rename: ${error}`));
    });
  }
}

//------------------------------------
// EXPORTS

exports.Rename = Rename;