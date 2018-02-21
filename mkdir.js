let PATH = require('./path.js');
let ERROR = require('./error.js');
let COMMAND = require('./command.js').Command;
let LINUX_COMMANDS = require('./linuxcommands.js');

//------------------------------------------------------
// MKDIR (mkdir)

class Mkdir {
  static Mkdir(path, executor) {
    return new Promise((resolve, reject) => {
      let pathError = PATH.Error.PathValidator(path);
      if (pathError) {
        reject(`Failed to make directory: ${pathError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to make directory: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.MakeDir(path);
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to make directory: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => reject(`Failed to make directory: ${error}`));
    });
  }

  static Mkdirp(path, executor) {
    return new Promise((resolve, reject) => {
      let pathError = PATH.Error.PathValidator(path);
      if (pathError) {
        reject(`Failed to make directory path: ${pathError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to make directory path: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.MakeDirP(path);
      COMMAND.Execute(cmd, [], executor).then(output => {
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