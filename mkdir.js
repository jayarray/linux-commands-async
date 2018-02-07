let FS = require('fs-extra');
let PATH = require('./path.js');
let MKDIRP = require('mkdirp');

//------------------------------------------------------
// MKDIR (mkdir)

class Mkdir {
  static Mkdir(path) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(path);
      if (error) {
        reject(error);
        return;
      }

      FS.mkdir(path, (err) => {
        if (err) {
          reject(`Failed to create directory: ${err}`);
          return;
        }
        resolve(true);
      });
    });
  }

  static Mkdirp(path) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(path);
      if (error) {
        reject(error);
        return;
      }

      MKDIRP(path.trim(), (err) => {
        if (err) {
          reject(`Failed to create directory: ${err}`);
          return;
        }
        resolve(true);
      });
    });
  }
}

//-------------------------------------
// MKDIR

exports.Mkdir = Mkdir;