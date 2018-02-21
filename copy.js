let PATH = require('./path.js');
let ERROR = require('./error.js');
let COMMAND = require('./command.js').Command;
let LINUX_COMMANDS = require('./linuxcommands.js');

//-------------------------------------------------
// COPY (cp)
class Copy {
  static File(src, dest, executor) {
    return new Promise((resolve, reject) => {
      let srcError = PATH.Error.PathValidator(src);
      if (srcError) {
        reject(`Failed to copy file: Source is ${srcError}`);
        return;
      }

      let destError = PATH.Error.PathValidator(dest);
      if (destError) {
        reject(`Failed to copy file: Destination is ${destError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to copy file: Connection is ${executorError}`);
        return;
      }

      PATH.Path.Exists(src, executor).then(exists => {
        if (!exists) {
          reject(`Failed to copy file: Source does not exist: ${src}`);
          return;
        }

        PATH.Path.IsFile(src, executor).then(isFile => {
          if (!isFile) {
            reject(`Failed to copy file: Source is not a file: ${src}`);
            return;
          }

          let cmd = LINUX_COMMANDS.CopyFile(src, dest);
          COMMAND.Execute(cmd, [], executor).then(output => {
            if (output.stderr) {
              reject(`Failed to copy file: ${output.stderr}`);
              return;
            }
            resolve(true);
          }).catch(error => reject(`Failed to copy file: ${error}`));
        }).catch(error => reject(`Failed to copy file: ${error}`));
      }).catch(error => reject(`Failed to copy file: ${error}`));
    });
  }

  static Direcory(src, dest, executor) {
    return new Promise((resolve, reject) => {
      let srcError = PATH.Error.PathValidator(src);
      if (srcError) {
        reject(`Failed to copy directory: Source is ${srcError}`);
        return;
      }

      let destError = PATH.Error.PathValidator(dest);
      if (destError) {
        reject(`Failed to copy directory: Destination is ${destError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to copy directory: Connection is ${executorError}`);
        return;
      }

      PATH.Path.Exists(src, executor).then(exists => {
        if (!exists) {
          reject(`Failed to copy directory: Source does not exist: ${src}`);
          return;
        }

        PATH.Path.IsDir(src, executor).then(isFile => {
          if (!isFile) {
            reject(`Failed to copy directory: Source is not a directory: ${src}`);
            return;
          }

          let cmd = LINUX_COMMANDS.CopyDir(src, dest);
          COMMAND.Execute(cmd, [], executor).then(output => {
            if (output.stderr) {
              reject(`Failed to copy directory: ${output.stderr}`);
              return;
            }
            resolve(true);
          }).catch(error => reject(`Failed to copy directory: ${error}`));
        }).catch(error => reject(`Failed to copy directory: ${error}`));
      }).catch(error => reject(`Failed to copy directory: ${error}`));
    });
  }
}

//----------------------------------------
// EXPORTS

exports.Copy = Copy;