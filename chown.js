let PATH = require('./path.js');
let FS = require('fs-extra');

//-----------------------------------------------  // CONT HERE
// CHOWN
class Chown {
  static chown(path, uid, gid) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(path);
      if (error) {
        reject(error);
        return;
      }

      error = invalid_type(uid);
      if (invalidType) {
        reject({ success: false, error: `uid is ${invalidType}` });
        return;
      }

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

  static UidGid() {
    // TO DO
    // Cmd: 
  }
}

