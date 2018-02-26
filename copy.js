let PATH = require('./path.js');
let VALIDATE = require('./validate.js');

//-------------------------------------------------
// COPY (cp)

class Copy {
  static File(src, dest, executor) {
    let srcError = PATH.Error.PathValidator(src);
    if (srcError)
      return Promise.reject(`Failed to copy file: Source is ${srcError}`);

    let destError = PATH.Error.PathValidator(dest);
    if (destError)
      return Promise.reject(`Failed to copy file: Destination is ${destError}`);

    if (!executor)
      return Promise.reject(`Executor required.`);

    return new Promise((resolve, reject) => {
      executor.Execute('cp', [src, dest]).then(output => {
        if (output.stderr) {
          reject(`Failed to copy file: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => reject(`Failed to copy file: ${error}`));
    });
  }

  static Direcory(src, dest, executor) {
    let srcError = PATH.Error.PathValidator(src);
    if (srcError)
      return Promise.reject(`Failed to copy directory: Source is ${srcError}`);

    let destError = PATH.Error.PathValidator(dest);
    if (destError)
      return Promise.reject(`Failed to copy directory: Destination is ${destError}`);

    let executorError = VALIDATE.IsInstance(executor);
    if (executorError)
      return Promise.reject(`Failed to copy directory: Connection is ${executorError}`);

    return new Promise((resolve, reject) => {
      executor.Execute('cp', ['-R', src, dest]).then(output => {
        if (output.stderr) {
          reject(`Failed to copy directory: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => reject(`Failed to copy directory: ${error}`));
    });
  }
}

//----------------------------------------
// EXPORTS

exports.Copy = Copy;