let REMOVE = require('./remove.js').Remove;
let MKDIR = require('./mkdir.js').Mkdir;
let PATH = require('./path.js');
let DISKUSAGE = require('./diskusage.js').DiskUsage;

//-----------------------------------------
// DIRECTORY

class Directory {
  static Remove(path) {
    return REMOVE.Directory(path);
  }

  static Create(path) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(path);
      if (error) {
        reject(error);
        return;
      }

      MKDIR.Mkdirp(path).then(success => {
        resolve(true);
      }).catch(reject);
    });
  }

  static Size(path) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(path);
      if (error) {
        reject(error);
        return;
      }

      DISKUSAGE.DirSize(path).then(size => {
        resolve(size);
      }).catch(reject);
    });
  }
}

//--------------------------------------
// EXPORTS

exports.Directory = Directory;