let VALIDATE = require('./validate.js');

//------------------------------------------------------
// MKDIR (mkdir)

function MakeDirectory(path, executor) {
  let pathError = VALIDATE.IsStringInput(path);
  if (pathError)
    return Promise.reject(`Failed to make directory: ${pathError}`);

  if (!executor)
    return Promise.reject(`Failed to make directory: Executor is required`);

  return new Promise((resolve, reject) => {
    executor.Execute('mkdir', ['-p', path]).then(output => {
      if (output.stderr) {
        reject(`Failed to make directory: ${output.stderr}`);
        return;
      }
      resolve(true);
    }).catch(error => reject(`Failed to make directory: ${error}`));
  });
}

//-------------------------------------
// EXPORTS

exports.MakeDirectory = MakeDirectory;