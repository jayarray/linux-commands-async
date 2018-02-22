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

  static MakeExecutable(path) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(path);
      if (error) {
        reject(error);
        return;
      }

      PATH.Path.Exists(path).then(exists => {
        if (!exists) {
          reject(`Path does not exist: ${path}`);
          return;
        }

        PATH.Path.IsFile(path).then(isFile => {
          if (!isFile) {
            reject(`Path is not a file: ${path}`);
            return;
          }

          CHMOD.AddPermissions('ugo', 'x', path).then(success => {
            resolve(true);
          }).catch(reject);
        }).catch(reject);
      }).catch(reject);
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

      PATH.Path.Exists(path, executor).then(exists => {
        if (!exists) {
          reject(`Failed to read file: Path does not exist: ${path}`);
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

let p = '/home/isa/sample.txt';
let text = 'I call it \\"THE ONE\\"';

let C = require('./command.js');
let L = new C.LocalCommand();

File.ReadLines(p, L).then(lines => {
  console.log(`LINES: ${lines}`);
}).catch(error => {
  console.log(`ERROR: ${error}`);
});

//-------------------------------
// EXPORTS

exports.File = File;