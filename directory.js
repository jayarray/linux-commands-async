let REMOVE = require('./remove.js').Remove;
let MKDIR = require('./mkdir.js').Mkdir;
let PATH = require('./path.js');
let DISKUSAGE = require('./diskusage.js').DiskUsage;
let ERROR = require('./error.js');

//-----------------------------------------
// DIRECTORY

class Directory {
  static Remove(path, executor) {
    return REMOVE.Directory(path, executor);
  }

  static Create(path, executor) {
    return new Promise((resolve, reject) => {
      let pathError = PATH.Error.PathError(path);
      if (pathError) {
        reject(`Failed to create directory: ${pathError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to create directory: Connection is ${executorError}`);
        return;
      }

      MKDIR.Mkdirp(path, executor).then(success => {
        resolve(true);
      }).catch(reject);
    });
  }

  static Size(path, executor) {
    return new Promise((resolve, reject) => {
      let pathError = PATH.Error.PathError(path);
      if (pathError) {
        reject(`Failed to get directory size: ${pathError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to get directory size: Connection is ${executorError}`);
        return;
      }

      DISKUSAGE.DirSize(path, executor).then(size => {
        resolve(size);
      }).catch(reject);
    });
  }
}

//--------------------------------------
// EXPORTS

exports.Directory = Directory;