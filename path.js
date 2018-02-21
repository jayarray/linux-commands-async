let PATH = require('path');
let ERROR = require('./error.js');
let COMMAND = require('./command.js').Command;
let LINUX_COMMANDS = require('./linuxcommands.js');

//-----------------------------------
// PATH
class Path {
  static Exists(path, executor) {
    return new Promise((resolve, reject) => {
      let pathError = Error.PathValidator(path);
      if (pathError) {
        reject(`Failed to check if path exists: ${pathError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to check if path exists: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.PathExists(path);
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to check if path exists: ${output.stderr}`);
          return;
        }

        let value = parseInt(output.stdout.trim());
        resolve(value == 1);  // 1 is true, 0 is false
      }).catch(error => {
        reject(`Failed to check if path exists: ${error}`);
      });
    });
  }

  static IsFile(path, executor) {
    return new Promise((resolve, reject) => {
      let pathError = Error.PathValidator(path);
      if (pathError) {
        reject(`Failed to check if path is a file: ${pathError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to check if path is a file: Connection is ${executorError}`);
        return;
      }

      Path.Exists(path, executor).then(exists => {
        if (!exists) {
          reject(`Failed to check if path is a file: Path does not exist: ${path}`);
          return;
        }

        let cmd = LINUX_COMMANDS.PathIsFile(path);
        COMMAND.Execute(cmd, [], executor).then(output => {
          if (output.stderr) {
            reject(`Failed to check if remote path is a file: ${output.stderr}`);
            return;
          }

          let value = parseInt(output.stdout.trim());
          resolve(value == 1); // 1 is true, 0 is false
        }).catch(error => {
          reject(`Failed to check if path is a file: ${error}`);
        });
      }).catch(error => {
        reject(`Failed to check if path is a file: ${error}`);
      });
    });
  }

  static IsDir(path, executor) {
    return new Promise((resolve, reject) => {
      let pathError = Error.PathValidator(path);
      if (pathError) {
        reject(`Failed to check if path is a directory: ${pathError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to check if path is a directory: Connection is ${executorError}`);
        return;
      }

      Path.Exists(path, executor).then(exists => {
        if (!exists) {
          reject(`Failed to check if path is a directory: Path does not exist: ${path}`);
          return;
        }

        let cmd = LINUX_COMMANDS.PathIsDir(path);
        COMMAND.Execute(cmd, [], executor).then(output => {
          if (output.stderr) {
            reject(`Failed to check if path is a directory: ${output.stderr}`);
            return;
          }

          let value = parseInt(output.stdout.trim());
          resolve(value == 1); // 1 is true, 0 is false
        }).catch(error => {
          reject(`Failed to check if path is a directory: ${error}`);
        });
      }).catch(error => {
        reject(`Failed to check if path is a directory: ${error}`);
      });
    });
  }

  static Filename(path) {
    let error = Error.PathValidator(path);
    if (error)
      return { string: null, error: error };
    return { string: PATH.basename(path), error: null };
  }

  static Extension(path) {
    let error = Error.PathValidator(path);
    if (error)
      return { string: null, error: error };
    return { string: PATH.extname(path), error: null };
  }

  static ParentDirName(path) {
    let error = Error.PathValidator(path);
    if (error)
      return { string: null, error: error };
    return { string: PATH.dirname(path).split(PATH.sep).pop(), error: null };
  }

  static ParentDir(path) {
    let error = Error.PathValidator(path);
    if (error)
      return { string: null, error: error };
    return { string: PATH.dirname(path), error: null }; // Full path to parent dir
  }

  static Escape(path) {
    let error = ERROR.NullOrUndefined(path);
    if (error)
      return { string: null, error: `Path is ${error}` };
    return { string: escape(path), error: null };
  }

  static ContainsWhitespace(path) {
    let error = ERROR.NullOrUndefined(path);
    if (error)
      return { bool: null, error: `Path is ${error}` };
    return { bool: path.includes(' '), error: null };
  }
}

//---------------------------------
// HELPERS

class Error {
  static PathValidator(p) {
    let error = ERROR.StringValidator(p);
    if (error)
      return `Path is ${error}`;
    return null;
  }
}

//------------------------------------
// EXPORTS

exports.Path = Path;
exports.Error = Error;