let VALIDATE = require('./validate.js');

//-------------------------------------------------
// REMOVE (rm)

class Remove {
  static Files(paths, executor) {
    let pathsError = VALIDATE.IsArray(paths);
    if (pathsError)
      return Promise.reject(`Failed to remove files: paths are ${pathsError}`);

    if (!executor)
      return Promise.reject(`Failed to remove files: Executor is required`);

    return new Promise((resolve, reject) => {
      executor.Execute('rm', ['-f'].concat(paths)).then(output => {
        if (output.stderr) {
          reject(`Failed to remove files: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => reject(`Failed to remove files: ${error}`));
    });
  }

  static Directories(paths, executor) {
    let pathsError = VALIDATE.IsArray(paths);
    if (pathsError)
      return Promise.reject(`Failed to remove directories: paths are ${pathsError}`);

    if (!executor)
      return Promise.reject(`Failed to remove directories: Executor is required`);

    return new Promise((resolve, reject) => {
      executor.Execute('rm', ['-fR'].concat(paths)).then(output => {
        if (output.stderr) {
          reject(`Failed to remove directory: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => reject(`Failed to remove directories: ${error}`));
    });
  }
}

//------------------------------
// EXPORTS

exports.Remove = Remove;