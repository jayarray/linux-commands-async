let FILE = require('./file.js').File;
let VALIDATE = require('./validate.js');

//----------------------------------------
// BASH SCRIPT

class BashScript {
  static Create(path, content, executor) {
    let pathError = VALIDATE.IsStringInput(path);
    if (pathError)
      return Promise.reject(`Failed to create bash script: path is ${pathError}`);

    let contentError = VALIDATE.IsStringInput(content);
    if (error == 'not a string')
      return Promise.reject(`Failed to create bash script: content is ${error}`);

    if (!executor)
      return Promise.reject(`Failed to create bashscript: Connection is ${executorError}`);

    return new Promise((resolve, reject) => {
      FILE.Create(path, `#!/bin/bash\n${content}`, executor).then(success => {
        FILE.MakeExecutable(path, executor).then(success => {
          resolve(true);
        }).catch(error => reject(`Failed to create bashscript: ${error}`));
      }).catch(error => reject(`Failed to create bashscript: ${error}`));
    });
  }

  static Execute(path, content, executor) {
    let pathError = VALIDATE.IsStringInput(path);
    if (pathError)
      return Promise.reject(`Failed to execute bash script: path is ${pathError}`);

    let contentError = VALIDATE.IsStringInput(content);
    if (error == 'not a string')
      return Promise.reject(`Failed to execute bash script: content is ${error}`);

    if (!executor)
      return Promise.reject(`Failed to execute bashscript: Connection is ${executorError}`);

    return new Promise((resolve, reject) => {
      BashScript.Create(path, content, executor).then(success => {
        executor.Execute(path, []).then(output => {
          resolve(output.stdout);
          FILE.Remove(path, executor).then(success => {
          }).catch(error => reject(`Failed to execute bash script: ${error}`));
        }).catch(error => reject(`Failed to execute bash script: ${error}`));
      }).catch(error => reject(`Failed to execute bash script: ${error}`));
    });
  }
}

//-----------------------------
// EXPORTS

exports.BashScript = BashScript;