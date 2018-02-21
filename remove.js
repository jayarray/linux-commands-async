let PATH = require('./path.js');
let ERROR = require('./error.js');
let COMMAND = require('./command.js').Command;
let LINUX_COMMANDS = require('./linuxcommands.js');

//-------------------------------------------------
// REMOVE (rm)

class Remove {
  static File(path, executor) {
    return new Promise((resolve, reject) => {
      let pathError = PATH.Error.PathValidator(path);
      if (pathError) {
        reject(`Failed to remove file: ${pathError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to remove file: Connection is ${executorError}`);
        return;
      }

      PATH.Path.Exists(path, executor).then(exists => {
        if (!exists) {
          reject(`Failed to remove file: Path does not exist: ${path}`);
          return;
        }

        PATH.Path.IsFile(path, executor).then(isFile => {
          if (!isFile) {
            reject(`Failed to remove file: Path is not a file: ${path}`);
            return;
          }

          let cmd = LINUX_COMMANDS.RemoveFile(path);
          COMMAND.Execute(cmd, [], executor).then(output => {
            if (output.stderr) {
              reject(`Failed to remove file: ${output.stderr}`);
              return;
            }
            resolve(true);
          }).catch(error => reject(`Failed to remove file: ${error}`));
        }).catch(error => reject(`Failed to remove file: ${error}`));
      }).catch(error => reject(`Failed to remove file: ${error}`));

    });
  }

  static Directory(path, executor) {
    return new Promise((resolve, reject) => {
      let pathError = PATH.Error.PathValidator(path);
      if (pathError) {
        reject(`Failed to remove directory: ${pathError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to remove directory: Connection is ${executorError}`);
        return;
      }

      PATH.Path.Exists(path, executor).then(exists => {
        if (!exists) {
          reject(`Failed to remove directory: Path does not exist: ${path}`);
          return;
        }

        PATH.Path.IsDir(path, executor).then(isDir => {
          if (!isDir) {
            reject(`Failed to remove directory: Path is not a directory: ${path}`);
            return;
          }

          let cmd = LINUX_COMMANDS.RemoveDir(path);
          COMMAND.Execute(cmd, [], executor).then(output => {
            if (output.stderr) {
              reject(`Failed to remove directory: ${output.stderr}`);
              return;
            }
            resolve(true);
          }).catch(error => reject(`Failed to remove directory: ${error}`));
        }).catch(error => reject(`Failed to remove directory: ${error}`));
      }).catch(error => reject(`Failed to remove directory: ${error}`));
    });
  }
}

//------------------------------
// EXPORTS

exports.Remove = Remove;