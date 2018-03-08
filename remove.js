let VALIDATE = require('./validate.js');

//-------------------------------------------------
// REMOVE (rm)

/**
 * Delete a file.
 * @param {Array<string>} paths List of filepaths to delete.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise that resolves if successful, otherwise rejects and returns an error.
 */
function Files(paths, executor) {
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
      resolve();
    }).catch(error => reject(`Failed to remove files: ${error}`));
  });
}

/**
 * Delete a directory.
 * @param {Array<string>} paths List of directory paths to delete.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise that resolves if successful, otherwise rejects and returns an error.
 */
function Directories(paths, executor) {
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
      resolve();
    }).catch(error => reject(`Failed to remove directories: ${error}`));
  });
}

//------------------------------
// EXPORTS

exports.Files = Files;
exports.Directories = Directories;