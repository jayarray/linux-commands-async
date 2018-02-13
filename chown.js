let PATH = require('./path.js').Path;
let FS = require('fs-extra');
let ERROR = require('./error.js').Error;
let ADMIN = require('./admin.js').Admin;
let USERINFO = require('./userinfo.js').UserInfo;

//-----------------------------------------------
// CHOWN
class Chown {
  static Chown(path, uid, gid) { // uid, gid are integers
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

        ADMIN.GetUser(uid).then(user => {
          USERINFO.CurrentUser().then(currUser => {
            ADMIN.GetGroup(gid).then(group => {
              if (user.id != currUser.uid) {
                ADMIN.UserHasRootPermissions(currUser.uid).then(hasRootPermissions => {
                  if (!hasRootPermissions) {
                    reject(`Failed to change owner permissions: user '${currUser.username}' does not have root permissions`);
                    return;
                  }

                  ADMIN.UserCanChangeGroupOwnership(currUser.uid, group.id).then(canChangeOwnership => {
                    if (!canChangeOwnership) {
                      reject(`Failed to change group permissions: user '${currUser.username}' is not part of the group called '${group.name}'`);
                      return
                    }

                    FS.chown(path, uid, gid, (err) => {
                      if (err) {
                        reject(`Failed to change owner/group permissions: ${err}`);
                        return;
                      }
                      resolve(true);
                    });
                  }).catch(reject);
                }).catch(reject);
              }
              else {
                ADMIN.UserCanChangeGroupOwnership(currUser.uid, group.id).then(canChangeOwnership => {
                  if (!canChangeOwnership) {
                    reject(`Failed to change group permissions: user '${currUser.username}' is not part of group called '${group.name}'`);
                    return
                  }

                  FS.chown(path, uid, gid, (err) => {
                    if (err) {
                      reject(`Failed to change owner/group permissions: ${err}`);
                      return;
                    }
                    resolve(true);
                  });
                }).catch(reject);
              }
            }).catch(reject);
          }).catch(reject);
        }).catch(reject);
      }).catch(reject);
    });
  }
}

//-----------------------------------
// EXPORTS

exports.Chown = Chown;
