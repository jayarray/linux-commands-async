let FILE = require('./file.js').File;
let COMMAND = require('./command.js').Command;
let ERROR = require('./error.js');

//----------------------------------------
// BASH SCRIPT

class BashScript {
  static Create(path, content, executor) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathValidator(path);
      if (error) {
        reject(`Failed to create bash script: ${error}`);
        return;
      }

      error = ERROR.StringValidator(content);
      if (error == 'not a string') {
        reject(`Failed to create bash script: content is ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to create bashscript: Connection is ${executorError}`);
        return;
      }

      FILE.Create(path, `#!/bin/bash\n${content}`, executor).then(success => {
        FILE.MakeExecutable(path, executor).then(success => {
          resolve(true);
        }).catch(error => `Failed to create bashscript: ${error}`);
      }).catch(error => `Failed to create bashscript: ${error}`);
    });
  }

  static Execute(path, content, executor) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathValidator(path);
      if (error) {
        reject(`Failed to execute bash script: ${error}`);
        return;
      }

      error = ERROR.StringValidator(content);
      if (error == 'not a string') {
        reject(`Failed to execute bash script: content is ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to execute bashscript: Connection is ${executorError}`);
        return;
      }

      BashScript.Create(path, content, executor).then(success => {
        COMMAND.Execute(path, [], executor).then(output => {
          resolve(output.stdout);
          FILE.Remove(path, executor).then(success => {
          }).catch(error => `Failed to execute bash script: ${error}`);
        }).catch(error => `Failed to execute bash script: ${error}`);
      }).catch(error => `Failed to execute bash script: ${error}`);
    });
  }
}

//-----------------------------
// EXPORTS

exports.BashScript = BashScript;