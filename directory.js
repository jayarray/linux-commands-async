let REMOVE = require('./remove.js').Remove;
let MKDIR = require('./mkdir.js').Mkdir;
let PATH = require('./path.js');
let DISKUSAGE = require('./diskusage.js').DiskUsage;
let VALIDATE = require('./validate.js');

//-----------------------------------------
// DIRECTORY

class Directory {
  static Remove(path, executor) {
    return REMOVE.Directories([path], executor);
  }

  static Create(path, executor) {
    let pathError = VALIDATE.IsStringInput(path);
    if (pathError)
      return Promise.reject(`Failed to create directory: ${pathError}`);

    if (!executor)
      return Promise.reject(`Failed to create directory: Executor is required`);

    return new Promise((resolve, reject) => {
      MKDIR.Mkdirp(path, executor).then(success => {
        resolve(true);
      }).catch(error => reject(`Failed tp create directory: ${error}`));
    });
  }

  static Size(path, executor) {
    let pathError = VALIDATE.IsStringInput(path);
    if (pathError)
      return Promise.reject(`Failed to get directory size: ${pathError}`);

    if (!executor)
      return Promise.reject(`Failed to get directory size: Executor is required`);

    return new Promise((resolve, reject) => {
      DISKUSAGE.DirSize(path, executor).then(size => {
        resolve(size);
      }).catch(reject);
    });
  }
}

//--------------------------------------
// EXPORTS

exports.Directory = Directory;