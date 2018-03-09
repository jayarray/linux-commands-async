let VALIDATE = require('./validate.js');

//-------------------------------------------------
// COPY (cp)

/**
 * Copy file.
 * @param {string} src Source
 * @param {string} dest Destination
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise that will resolve if successful, otherwise returns an error.
 */
function File(src, dest, executor) {
  let srcError = VALIDATE.IsStringInput(src);
  if (srcError)
    return Promise.reject(`Failed to copy file: Source is ${srcError}`);

  let destError = VALIDATE.IsStringInput(dest);
  if (destError)
    return Promise.reject(`Failed to copy file: Destination is ${destError}`);

  if (!executor)
    return Promise.reject(`Failed to copy file: Executor is required`);

  return new Promise((resolve, reject) => {
    executor.Execute('cp', [src, dest]).then(output => {
      if (output.stderr) {
        reject(`Failed to copy file: ${output.stderr}`);
        return;
      }
      resolve();
    }).catch(error => reject(`Failed to copy file: ${error}`));
  });
}

/**
 * Copy directory.
 * @param {string} src Source
 * @param {string} dest Destination
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise that will resolve if successful, otherwise it returns an error.
 */
function Directory(src, dest, executor) {
  let srcError = VALIDATE.IsStringInput(src);
  if (srcError)
    return Promise.reject(`Failed to copy directory: Source is ${srcError}`);

  let destError = VALIDATE.IsStringInput(dest);
  if (destError)
    return Promise.reject(`Failed to copy directory: Destination is ${destError}`);

  if (!executor)
    return Promise.reject(`Failed to copy directory: Executor is required`);

  return new Promise((resolve, reject) => {
    executor.Execute('cp', ['-R', src, dest]).then(output => {
      if (output.stderr) {
        reject(`Failed to copy directory: ${output.stderr}`);
        return;
      }
      resolve();
    }).catch(error => reject(`Failed to copy directory: ${error}`));
  });
}

//----------------------------------------
// EXPORTS

exports.File = File;
exports.Directory = Directory;