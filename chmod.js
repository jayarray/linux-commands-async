let PERMISSIONS = require('./permissions.js').Permissions;
let ERROR = require('./error.js').Error;
let PATH = require('./path.js').Path;
let FS = require('fs-extra');

//-----------------------------------------
// CHMOD
class Chmod {
  static UsingPermString(permStr, path) {
    return new Promise((resolve, reject) => {
      let error = ERROR.StringError(permStr);
      if (error) {
        reject(`Permissions string is ${error}`);
        return;
      }

      PATH.Exists(path).then(exists => {
        if (!exists) {
          reject(`Path does not exist: ${path}`);
          return;
        }

        let permsObj = PERMISSIONS.CreatePermissionsObjectUsingPermissionsString(permStr.trim());
        if (permsObj.error) {
          reject(permsObj.error);
          return;
        }

        FS.chmod(path, permsObj.obj.octal.string, (err) => {
          if (err) {
            reject(`Failed to change permissions: ${err}`);
            return;
          }
          resolve(true);
        });

      }).catch(reject);
    });
  }

  static UsingOctalString(octalStr, path) {
    return new Promise((resolve, reject) => {
      let error = ERROR.StringError(octalStr);
      if (error) {
        reject(`Octal string is ${error}`);
        return;
      }

      PATH.Exists(path).then(exists => {
        if (!exists) {
          reject(`Path does not exist: ${path}`);
          return;
        }

        let permsObj = PERMISSIONS.CreatePermissionsObjectUsingOctalString(octalStr.trim());
        if (permsObj.error) {
          reject(permsObj.error);
          return;
        }

        FS.chmod(path, permsObj.obj.octal.string, (err) => {
          if (err) {
            reject(`Failed to change permissions: ${err}`);
            return;
          }
          resolve(true);
        });
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
        FS.chmod(path, octalStr.string, (err) => {
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
        FS.chmod(path, octalStr.string, (err) => {
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
        let classesList = Chmod.ValidClassChars();
        let typesList = Chmod.ValidTypeChars();

        classesList.forEach(c => {
          typesList.forEach(t => {
            if (classes.includes(c) && types.includes(t))
              permsObj[c][t] = true;
            else
              permsObj[c][t] = false;
          });
        });

        // Create new permStr based on modified permsObj
        let ux = '';
        if (permsObj.u.x == true && permsObj.u.xchar == '-')
          ux = 'x';
        else if (permsObj.u.x == true && permsObj.u.xchar != '-')
          ux = permsObj.u.xchar;
        else
          ux = '-';

        let gx = '';
        if (permsObj.g.x == true && permsObj.g.xchar == '-')
          gx = 'x';
        else if (permsObj.g.x == true && permsObj.g.xchar != '-')
          gx = permsObj.g.xchar;
        else
          gx = '-';

        let ox = '';
        if (permsObj.o.x == true && permsObj.o.xchar == '-')
          ox = 'x';
        else if (permsObj.o.x == true && permsObj.o.xchar != '-')
          ox = permsObj.o.xchar;
        else
          ox = '-';

        let newPermStr = `${permsObj.u.r ? 'r' : '-'}${permsObj.u.w ? 'w' : '-'}${ux}`;
        newPermStr += `${permsObj.g.r ? 'r' : '-'}${permsObj.g.w ? 'w' : '-'}${gx}`;
        newPermStr += `${permsObj.o.r ? 'r' : '-'}${permsObj.o.w ? 'w' : '-'}${ox}`;

        let octalStr = PERMISSIONS.PermissionsStringToOctalString(newPermStr);
        if (octalStr.error) {
          reject(octalStr.error);
          return;
        }

        // Change permissions
        FS.chmod(path, octalStr.string, (err) => {
          if (err) {
            reject(`Failed to change permissions: ${err}`);
            return;
          }
          resolve(true);
        });
      }).catch(reject);
    });
  }

  static ValidClassChars() {
    return PERMISSIONS.ValidClassChars();
  }

  static ValidTypeChars() {
    return ['r', 'w', 'x'];
  }
}

//------------------------------------
// ERROR

class Error {
  static ClassesStringError(string) {
    let error = ERROR.StringError(string);
    if (error)
      return `Classes string is ${error}`;

    let min = 1;
    let max = 3;

    // Check length
    if (string.length < min || string.length > max)
      return `Classes string must have ${min} to ${max} characters`;

    // Check for invalid chars
    for (let i = 0; i < string.length; ++i) {
      let currChar = string.charAt(i);
      if (!Chmod.ValidClassChars().includes(currChar))
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
      if (!Chmod.ValidTypeChars().includes(currChar))
        return `Types string contains invalid characters`;
    }

    return null;
  }
}

//------------------------------------
// EXPORTS

exports.Chmod = Chmod;