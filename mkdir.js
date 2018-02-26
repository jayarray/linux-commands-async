let VALIDATE = require('./validate.js');

//------------------------------------------------------
// MKDIR (mkdir)

class Mkdir {
  static Mkdir(path, executor) {
    let pathError = VALIDATE.IsStringInput(path);
    if (pathError)
      return Promise.reject(`Failed to make directory: ${pathError}`);

    let executorError = VALIDATE.IsInstance(executor);
    if (executorError)
      return Promise.reject(`Failed to make directory: Connection is ${executorError}`);

    return new Promise((resolve, reject) => {
      executor.Execute('mkdir', [path]).then(output => {
        if (output.stderr) {
          reject(`Failed to make directory: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => reject(`Failed to make directory: ${error}`));
    });
  }

  static Mkdirp(path, executor) {
    let pathError = VALIDATE.IsStringInput(path);
    if (pathError)
      return Promise.reject(`Failed to make directory path: ${pathError}`);

    let executorError = VALIDATE.IsInstance(executor);
    if (executorError)
      return Promise.reject(`Failed to make directory path: Connection is ${executorError}`);

    return new Promise((resolve, reject) => {
      executor.Execute('mkdir', ['-p', path]).then(output => {
        if (output.stderr) {
          reject(`Failed to make directory path: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => reject(`Failed to make directory path: ${error}`));
    });
  }
}

//-------------------------------------
// EXPORTS

exports.Mkdir = Mkdir;