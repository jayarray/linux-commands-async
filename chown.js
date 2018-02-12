let PATH = require('./path.js');
let FS = require('fs-extra');
let ADMIN = require('./admin.js').Admin;
let ERROR = require('./error.js').Error;

//----------------------------------------------
// HELPERS

function idToInteger(uid) {
  return new Promise((resolve, reject) => {
    let error = ERROR.NullOrUndefined // CONT HERE
  });
}

//-----------------------------------------------
// CHOWN
class Chown {
  static chown(path, uid, gid) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(path);
      if (error) {
        reject(error);
        return;
      }

      error = Error.IdNumberError(uid);
      if (error) {
        reject(`uid ${error}`);
        return;
      }

      error = Error.IdNumberError
      if (Number.isInteger(uid) && uid >= 0) {
        reject({ success: false, error: `uid must be integer equal to or greater than 0` });
        return;
      }

      invalidType = invalid_type(gid);
      if (invalidType) {
        reject({ success: false, error: `gid is ${invalidType}` });
        return;
      }

      if (Number.isInteger(uid) && uid >= 0) {
        reject({ success: false, error: `gid must be integer equal to or greater than 0` });
        return;
      }

      let pTrimmed = path.trim();
      Path.error(pTrimmed).then(results => {
        if (results.error) {
          reject({ success: false, error: results.error });
          return;
        }

        if (!results.exists) {
          reject({ success: false, error: `Path does not exist: ${pTrimmed}` });
          return;
        }

        FS.chown(pTrimmed, uid, gid, (err) => {
          if (err) {
            reject({ success: false, error: `FS_CHOWN_ERROR: ${erri}` });
            return;
          }
          resolve({ success: true, error: null });
        });
      }).catch(fatalFail);
    });
  }
}

//-----------------------------------
// ERROR

class Error {
  static IdStringError(id) {
    let error = ERROR.StringError(id);
    if (error)
      return error;
    return null;
  }

  static IdNumberError(id) {
    let error = ERROR.IntegerError(id);
    if (error)
      return `id is ${error}`;

    let min = 0;
    error = ERROR.BoundIntegerError(id, min, null);
    if (error)
      return error;
    return null;
  }

  static IdError(id) {
    let error = ERROR.NullOrUndefined(id);
    if (error)
      return error;

    // Check if name string
    if (typeof id == 'string') {
      error = ERROR.StringError(id);
      if (error)
        return error;
      return null;
    }

    // Check if id number
    let idMin = 0;
    if (Number.isInteger(id)) {
      error = ERROR.IdNumberError(id);
      if (error)
        return error;
      return null;
    }

    return `id is not a valid string or integer`;
  }
}
