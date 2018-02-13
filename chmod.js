let PERMISSIONS = require('./permissions.js').Permissions;
let ERROR = require('./error.js').Error;
let PATH = require('./path.js');
let FS = require('fs-extra');

//-----------------------------------------
// CHMOD
class Chmod {
  static ValidClassChars() {
    return PERMISSIONS.ValidClassChars();
  }

  static ValidTypeChars() {
    return ['r', 'w', 'x'];
  }

  static UsingPermString(permStr, path) {
    return new Promise((resolve, reject) => {
      PATH.Exists(path).then(exists => {
        if (!exists) {
          reject(`Path does not exist: ${path}`);
          return;
        }

        PERMISSIONS.CreatePermissionsObjectUsingPermissionsString(permStr.trim()).then(obj => {
          let octalNumber = parseInt(obj.octal.string);
          FS.chmod(path, octalNumber, (err) => {
            if (err) {
              reject(`Failed to change permissions: ${err}`);
              return;
            }
            resolve(true);
          });
        }).catch(reject);
      }).catch(reject);
    });
  }

  static UsingOctalString(octalStr, path) {
    return new Promise((resolve, reject) => {
      PATH.Exists(path).then(exists => {
        if (!exists) {
          reject(`Path does not exist: ${path}`);
          return;
        }

        PERMISSIONS.CreatePermissionsObjectUsingOctalString(octalStr.trim()).then(obj => {
          let octalNumber = parseInt(obj.octal.string);
          FS.chmod(path, octalNumber, (err) => {
            if (err) {
              reject(`Failed to change permissions: ${err}`);
              return;
            }
            resolve(true);
          });
        }).catch(reject);
      }).catch(reject);
    });
  }

  static RemovePermissions(classes, types, path) { // Example: classes = 'ugo',  types = 'rwx'
    return new Promise((resolve, reject) => {
      let error = Error.ClassesStringError(classes);
      if (error) {
        reject(error);
        return;
      }

      error = Error.TypesStringError(types);
      if (error) {
        reject(error);
        return;
      }

      PERMISSIONS.Permissions(path).then(permsObj => {
        // Modify permsObj
        classes.split('').forEach(c => {
          types.split('').forEach(t => {
            permsObj[c][t] = false;
          });
        });

        // Create new permStr based on modified permsObj
        let newPermStr = `${permsObj.u.r ? 'r' : '-'}${permsObj.u.w ? 'w' : '-'}${permsObj.u.x ? permsObj.u.xchar : '-'}`;
        newPermStr += `${permsObj.g.r ? 'r' : '-'}${permsObj.g.w ? 'w' : '-'}${permsObj.g.x ? permsObj.g.xchar : '-'}`;
        newPermStr += `${permsObj.o.r ? 'r' : '-'}${permsObj.o.w ? 'w' : '-'}${permsObj.o.x ? permsObj.o.xchar : '-'}`;

        // Convert newPermStr into octal
        let octalStr = PERMISSIONS.PermissionsStringToOctalString(newPermStr);
        if (octalStr.error) {
          reject(octalStr.error);
          return;
        }

        // Change permissions
        let octalNumber = parseInt(octalStr.string);
        FS.chmod(path, octalNumber, (err) => {
          if (err) {
            reject(`Failed to change permissions: ${err}`);
            return;
          }
          resolve(true);
        });
      }).catch(reject);
    });
  }

  static AddPermissions(classes, types, path) {
    return new Promise((resolve, reject) => {
      let error = Error.ClassesStringError(classes);
      if (error) {
        reject(error);
        return;
      }

      error = Error.TypesStringError(types);
      if (error) {
        reject(error);
        return;
      }

      PERMISSIONS.Permissions(path).then(permsObj => {
        // Modify permsObj
        classes.split('').forEach(c => {
          types.split('').forEach(t => {
            permsObj[c][t] = true;
          });
        });

        // Create new permStr based on modified permsObj
        let newPermStr = `${permsObj.u.r ? 'r' : '-'}${permsObj.u.w ? 'w' : '-'}${permsObj.u.x ? permsObj.u.xchar : '-'}`;
        newPermStr += `${permsObj.g.r ? 'r' : '-'}${permsObj.g.w ? 'w' : '-'}${permsObj.g.x ? permsObj.g.xchar : '-'}`;
        newPermStr += `${permsObj.o.r ? 'r' : '-'}${permsObj.o.w ? 'w' : '-'}${permsObj.o.x ? permsObj.o.xchar : '-'}`;

        // Convert newPermStr into octal
        let octalStr = PERMISSIONS.PermissionsStringToOctalString(newPermStr);
        if (octalStr.error) {
          reject(octalStr.error);
          return;
        }

        // Change permissions
        let octalNumber = parseInt(octalStr.string);
        FS.chmod(path, octalNumber, (err) => {
          if (err) {
            reject(`Failed to change permissions: ${err}`);
            return;
          }
          resolve(true);
        });
      }).catch(reject);
    });
  }

  static SetPermissions(classes, types, path) {
    return new Promise((resolve, reject) => {
      let error = Error.ClassesStringError(classes);
      if (error) {
        reject(error);
        return;
      }

      error = Error.TypesStringError(types);
      if (error) {
        reject(error);
        return;
      }

      PERMISSIONS.Permissions(path).then(permsObj => {
        // Modify permsObj
        classes.split('').forEach(c => {
          let typesList = Chmod.ValidTypeChars();
          typesList.forEach(t => {
            if (types.includes(t))
              permsObj[c][t] = true;
            else
              permsObj[c][t] = false;
          });
        });

        // Create new permStr based on modified permsObj
        let newPermStr = `${permsObj.u.r ? 'r' : '-'}${permsObj.u.w ? 'w' : '-'}${permsObj.u.x ? permsObj.u.xchar : '-'}`;
        newPermStr += `${permsObj.g.r ? 'r' : '-'}${permsObj.g.w ? 'w' : '-'}${permsObj.g.x ? permsObj.g.xchar : '-'}`;
        newPermStr += `${permsObj.o.r ? 'r' : '-'}${permsObj.o.w ? 'w' : '-'}${permsObj.o.x ? permsObj.o.xchar : '-'}`;

        let octalStr = PERMISSIONS.PermissionsStringToOctalString(newPermStr);
        if (octalStr.error) {
          reject(octalStr.error);
          return;
        }

        // Change permissions
        let octalNumber = parseInt(octalStr.string);
        FS.chmod(path, octalNumber, (err) => {
          if (err) {
            reject(`Failed to change permissions: ${err}`);
            return;
          }
          resolve(true);
        });
      }).catch(reject);
    });
  }
}

//------------------------------------
// ERROR

class Error {
  static ClassesStringError(string) {
    let error = ERROR.StringError(string);
    if (error)
      return `Class string is ${error}`;

    let min = 1;
    let max = 3;

    // Check length
    if (string.length < min || string.length > max)
      return `Class string must have ${min} to ${max} characters`;

    // Check for invalid chars
    for (let i = 0; i < string.length; ++i) {
      let currChar = string.charAt(i);
      if (!Chmod.ValidClassChars().includes(char))
        return `Classes string contains invalid characters`;
    }

    return null;
  }

  static TypesStringError(string) {
    let error = ERROR.StringError(string);
    if (error)
      return `Types string is ${error}`;

    let min = 1;
    let max = 3;

    // Check length
    if (string.length < min || string.length > max)
      return `Types string must have ${min} to ${max} characters`;

    // Check for invalid chars
    for (let i = 0; i < string.length; ++i) {
      let currChar = string.charAt(i);
      if (!Chmod.ValidTypeChars().includes(char))
        return `Types string contains invalid characters`;
    }

    return null;
  }
}

//------------------------------------
// EXPORTS

exports.Chmod = Chmod;