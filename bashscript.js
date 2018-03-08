let FILE = require('./file.js');
let VALIDATE = require('./validate.js');

//----------------------------------------
// BASH SCRIPT

/**
 * Create a basch script file.
 * @param {string} path Location where file should be created.
 * @param {string} content Text to be written in file. (Omit '#!/bin/bash' as it is first line in file).
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise that will resolve if successful, otherwise it rejects and returns an error.
 */
function Create(path, content, executor) {
  let pathError = VALIDATE.IsStringInput(path);
  if (pathError)
    return Promise.reject(`Failed to create bash script: path is ${pathError}`);

  let contentError = VALIDATE.IsStringInput(content);
  if (contentError == 'null' || contentError == 'undefined' || contentError == 'not a string')
    return Promise.reject(`Failed to create bash script: content is ${contentError}`);

  if (!executor)
    return Promise.reject(`Failed to create bashscript: Executor is required`);

  return new Promise((resolve, reject) => {
    FILE.Create(path, `#!/bin/bash\n${content}`, executor).then(success => {
      FILE.MakeExecutable(path, executor).then(success => {
        resolve(true);
      }).catch(error => reject(`Failed to create bashscript: ${error}`));
    }).catch(error => reject(`Failed to create bashscript: ${error}`));
  });
}

/**
 * Creates bash script, executes it, and cleans it up.
 * @param {string} path Location where file should be created.
 * @param {string} content Text to be written in file. (Omit '#!/bin/bash' as it is first line in file).
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise. If it resolves, it returns a string with the output. Else, it rejects and returns an error.
 */
function Execute(path, content, executor) {
  let pathError = VALIDATE.IsStringInput(path);
  if (pathError)
    return Promise.reject(`Failed to execute bash script: path is ${pathError}`);

  let contentError = VALIDATE.IsStringInput(content);
  if (contentError == 'null' || contentError == 'undefined' || contentError == 'not a string')
    return Promise.reject(`Failed to execute bash script: content is ${contentError}`);

  if (!executor)
    return Promise.reject(`Failed to execute bashscript: Executor is required`);

  return new Promise((resolve, reject) => {
    Create(path, content, executor).then(success => {
      executor.Execute(path, []).then(output => {
        resolve(output.stdout);
        FILE.Remove(path, executor).then(success => {
        }).catch(error => reject(`Failed to execute bash script: ${error}`));
      }).catch(error => reject(`Failed to execute bash script: ${error}`));
    }).catch(error => reject(`Failed to execute bash script: ${error}`));
  });
}

//-----------------------------
// EXPORTS

exports.Create = Create;
exports.Execute = Execute;