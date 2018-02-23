let PATH = require('./path.js');
let ERROR = require('./error.js');
let REMOVE = require('./remove.js').Remove;
let CHMOD = require('./chmod.js').Chmod;
let COMMAND = require('./command.js').Command;
let LINUX_COMMANDS = require('./linuxcommands.js');

//---------------------------------------------------
// FILE
class File {
  static Remove(path, executor) {
    return REMOVE.File(path, executor);
  }

  static Create(path, text, executor) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathValidator(path);
      if (error) {
        reject(`Failed to create file: ${error}`);
        return;
      }

      error = ERROR.StringValidator(text);
      if (error) {
        reject(`Failed to create file: text is ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to create file: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.EchoWriteToFile(path, text);
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to create file: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => `Failed to create file: ${error}`);
    });
  }

  static MakeExecutable(path, executor) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathValidator(path);
      if (error) {
        reject(`Failed to make file executable: ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to make file executable: Connection is ${executorError}`);
        return;
      }

      PATH.Path.IsFile(path, executor).then(isFile => {
        if (!isFile) {
          reject(`Failed to make file executable: Path is not a file: ${path}`);
          return;
        }

        CHMOD.AddPermissions('ugo', 'x', [path], false, executor).then(success => {
          resolve(true);
        }).catch(error => `Failed to make file executable: ${error}`);
      }).catch(error => `Failed to make file executable: ${error}`);
    });
  }

  static Read(path, executor) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathValidator(path);
      if (error) {
        reject(`Failed to read file: ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to read file: Connection is ${executorError}`);
        return;
      }

      PATH.Path.IsFile(path, executor).then(isFile => {
        if (!isFile) {
          reject(`Failed to read file: Path is not a file: ${path}`);
          return;
        }

        let cmd = LINUX_COMMANDS.CatReadFileContent(path);
        COMMAND.Execute(cmd, [], executor).then(output => {
          if (output.stderr) {
            reject(`Failed to read file: ${output.stderr}`);
            return;
          }
          resolve(output.stdout);
        }).catch(error => `Failed to read file: ${error}`);
      }).catch(error => `Failed to read file: ${error}`);
    });
  }

  static ReadLines(path, executor) {
    return new Promise((resolve, reject) => {
      File.Read(path, executor).then(string => {
        resolve(string.split('\n'));
      }).catch(error => `Failed to read lines: ${error}`);
    });
  }
}

//-------------------------------
// EXPORTS

exports.File = File;