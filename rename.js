let _path = require('path');

let PATH = require('./path.js');
let MOVE = require('./move.js');
let VALIDATE = require('./validate.js');

//-----------------------------------------------
// RENAME

/**
 * Change name of file or directory.
 * @param {string} src Source
 * @param {string} newName New desired name file or directory.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise that resolves if successful, otherwise rejects and returns an error.
 */
function Rename(src, newName, executor) {
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

//------------------------------------
// EXPORTS

exports.Rename = Rename;