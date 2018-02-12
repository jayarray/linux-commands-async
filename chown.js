let PATH = require('./path.js');
let FS = require('fs-extra');
let ERROR = require('./error.js').Error;

//-----------------------------------------------
// CHOWN
class Chown {
  static chown(path, uid, gid) { // uid, gid are integers
    return new Promise((resolve, reject) => {
      PATH.Exists(path).then(exists => {
        if (!exists) {
          reject(`Path does not exist: ${path}`);
          return;
        }

        let error = ERROR.IntegerError(uid);
        if (error) {
          reject(`uid is ${error}`);
          return;
        }

        error = ERROR.IntegerError(gid);
        if (error) {
          reject(`gid is ${error}`);
          return;
        }

        FS.chown(path, uid, gid, (err) => {
          if (err) {
            reject(`Failed to change owner permissions: ${err}`);
            return;
          }
          resolve(true);
        });
      }).catch(reject);
    });
  }
}

//-----------------------------------
// EXPORTS

exports.Chown = Chown;
