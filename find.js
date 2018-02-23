let _path = require('path');

let PATH = require('./path.js');
let COMMAND = require('./command.js').Command;
let ERROR = require('./error.js');
let LINUX_COMMANDS = require('./linuxcommands.js');

//------------------------------------
// FIND
class Find {
  static FilesByName(path, pattern, maxDepth, executor) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathValidator(path);
      if (error) {
        reject(`Failed to find files by name: ${error}`);
        return;
      }

      error = Error.PatternValidator(pattern);
      if (error) {
        reject(`Failed to find files by name: ${error}`);
        return;
      }

      error = Error.MaxDepthValidator(maxDepth);
      if (error) {
        reject(`Failed to find files by name: ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to find files by name: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.FindFilesByName(path, pattern, maxDepth);
      COMMAND.Execute(cmd, [], executor).then(output => {
        let deniedPaths = [];

        if (output.stderr) {
          if (output.stderr.includes('Permission denied')) {
            let lines = output.stderr.split('\n').filter(line => line && line.trim() != '' && line != path);

            for (let i = 0; i < lines.length; ++i) {
              let currLine = lines[i];
              let dPath = currLine.split(':')[1].trim();
              deniedPaths.push(dPath);
            }
          }
          else {
            reject(`Failed to find files by name: ${output.stderr}`);
            return;
          }
        }

        let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path && line != path);
        resolve({ paths: paths, denied: deniedPaths });
      }).catch(`Failed to find files by name: ${error}`);
    });
  }

  static FilesByContent(path, text, maxDepth, executor) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathValidator(path);
      if (error) {
        reject(`Failed to find files by content: ${error}`);
        return;
      }

      error = Error.TextValidator(text);
      if (error) {
        reject(`Failed to find files by content: ${error}`);
        return;
      }

      error = Error.MaxDepthValidator(maxDepth);
      if (error) {
        reject(`Failed to find files by content: ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to find files by content: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.FindFilesByContent(path, text, maxDepth);
      COMMAND.Execute(cmd, [], executor).then(output => {
        let deniedPaths = [];

        if (output.stderr) {
          if (output.stderr.includes('Permission denied')) {
            let lines = output.stderr.split('\n').filter(line => line && line.trim() != '' && line != path);

            for (let i = 0; i < lines.length; ++i) {
              let currLine = lines[i];
              let dPath = currLine.split(':')[1].trim();
              deniedPaths.push(dPath);
            }
          }
          else {
            reject(`Failed to find files by content: ${output.stderr}`);
            return;
          }
        }

        let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path && line != path);
        resolve({ paths: paths, denied: deniedPaths });
      }).catch(error => `Failed to find files by content: ${error}`);
    });
  }

  static FilesByUser(path, user, maxDepth, executor) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathValidator(path);
      if (error) {
        reject(`Failed to find files by user: ${error}`);
        return;
      }

      error = ERROR.StringValidator(user);
      if (error) {
        reject(`Failed to find files by user: user is ${error} `);
        return;
      }

      error = Error.MaxDepthValidator(maxDepth);
      if (error) {
        reject(`Failed to find files by user: ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to find files by user: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.FindFilesByUser(path, user, maxDepth);
      COMMAND.Execute(cmd, [], executor).then(output => {
        let deniedPaths = [];

        if (output.stderr) {
          if (output.stderr.includes('Permission denied')) {
            let lines = output.stderr.split('\n').filter(line => line && line.trim() != '' && line != path);

            for (let i = 0; i < lines.length; ++i) {
              let currLine = lines[i];
              let dPath = currLine.split(':')[1].trim();
              deniedPaths.push(dPath);
            }
          }
          else {
            reject(`Failed to find files by user: ${output.stderr}`);
            return;
          }
        }

        let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path && line != path);
        resolve({ paths: paths, denied: deniedPaths });
      }).catch(`Failed to find files by user: ${error}`);
    });
  }

  static DirsByName(path, pattern, maxDepth, executor) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathValidator(path);
      if (error) {
        reject(`Failed to find directories by name: ${error}`);
        return;
      }

      error = Error.PatternValidator(pattern);
      if (error) {
        reject(`Failed to find directories by name: ${error}`);
        return;
      }

      error = Error.MaxDepthValidator(maxDepth);
      if (error) {
        reject(`Failed to find directories by name: ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to find directories by name: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.FindDirsByName(path, pattern, maxDepth);
      COMMAND.Execute(cmd, [], executor).then(output => {
        let deniedPaths = [];

        if (output.stderr) {
          if (output.stderr.includes('Permission denied')) {
            let lines = output.stderr.split('\n').filter(line => line && line.trim() != '' && line != path);

            for (let i = 0; i < lines.length; ++i) {
              let currLine = lines[i];
              let dPath = currLine.split(':')[1].trim();
              deniedPaths.push(dPath);
            }
          }
          else {
            reject(`Failed to find directories by name: ${output.stderr}`);
            return;
          }
        }

        let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path && line != path);
        resolve({ paths: paths, denied: deniedPaths });
      }).catch(`Failed to find directories by name: ${error}`);
    });
  }

  static EmptyFiles(path, maxDepth, executor) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathValidator(path);
      if (error) {
        reject(`Failed to find empty files: ${error}`);
        return;
      }

      error = Error.MaxDepthValidator(maxDepth);
      if (error) {
        reject(`Failed to find empty files: ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to find empty files: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.FindEmptyFiles(path, maxDepth);
      COMMAND.Execute(cmd, [], executor).then(output => {
        let deniedPaths = [];

        if (output.stderr) {
          if (output.stderr.includes('Permission denied')) {
            let lines = output.stderr.split('\n').filter(line => line && line.trim() != '' && line != path);

            for (let i = 0; i < lines.length; ++i) {
              let currLine = lines[i];
              let dPath = currLine.split(':')[1].trim();
              deniedPaths.push(dPath);
            }
          }
          else {
            reject(`Failed to find empty files: ${output.stderr}`);
            return;
          }
        }

        let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path && line != path);
        resolve({ paths: paths, denied: deniedPaths });
      }).catch(`Failed to find empty files: ${error}`);
    });
  }

  static EmptyDirs(path, maxDepth, executor) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathValidator(path);
      if (error) {
        reject(`Failed to find empty directories: ${error}`);
        return;
      }

      error = Error.MaxDepthValidator(maxDepth);
      if (error) {
        reject(`Failed to find empty directories: ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to find empty directories: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.FindEmptyDirs(path, maxDepth);
      COMMAND.Execute(cmd, [], executor).then(output => {
        let deniedPaths = [];

        if (output.stderr) {
          if (output.stderr.includes('Permission denied')) {
            let lines = output.stderr.split('\n').filter(line => line && line.trim() != '' && line != path);

            for (let i = 0; i < lines.length; ++i) {
              let currLine = lines[i];
              let dPath = currLine.split(':')[1].trim();
              deniedPaths.push(dPath);
            }
          }
          else {
            reject(`Failed to find empty directories: ${output.stderr}`);
            return;
          }
        }

        let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path && line != path);
        resolve({ paths: paths, denied: deniedPaths });
      }).catch(`Failed to find empty directories: ${error}`);
    });
  }

  static Manual(args, executor) {
    return new Promise((resolve, reject) => {
      let error = Error.ArgsValidator(args);
      if (error) {
        reject(`Failed to execute find command: ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to execute find command: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.FindManual(args);
      COMMAND.Execute(cmd, [], executor).then(output => {
        let deniedPaths = [];

        if (output.stderr) {
          if (output.stderr.includes('Permission denied')) {
            let lines = output.stderr.split('\n').filter(line => line && line.trim() != '' && line != path);

            for (let i = 0; i < lines.length; ++i) {
              let currLine = lines[i];
              let dPath = currLine.split(':')[1].trim();
              deniedPaths.push(dPath);
            }
          }
          else {
            reject(`Failed to execute find command: ${output.stderr}`);
            return;
          }
        }

        let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path && line != path);
        resolve({ paths: paths, denied: deniedPaths });
      }).catch(error => `Failed to execute find command: ${error}`);
    });
  }
}

//------------------------------
// ERROR

class Error {
  static ArgsValidator(args) {
    let error = ERROR.ArrayValidator(args);
    if (error)
      return `args is ${error} `;

    for (let i = 0; i < args.length; ++i) {
      let currArg = args[i];

      let argIsValidString = ERROR.StringValidator(currArg) == null;
      let argIsValidNumber = !isNaN(currArg);

      if (!argIsValidString && !argIsValidNumber)
        return `Arg elements must be string or number type`;
    }

    return null;
  }

  static MaxDepthValidator(maxDepth) {
    if (maxDepth == null)
      return null;

    let error = ERROR.IntegerValidator(maxDepth);
    if (error)
      return `MaxDepth is ${error} `;

    let min = 0;
    error = ERROR.BoundIntegerError(maxDepth, min, null);
    if (error)
      return `MaxDepth is ${error} `;

    return null;
  }

  static PatternValidator(pattern) {
    let error = ERROR.NullOrUndefined(pattern);
    if (error)
      return `Pattern is ${error} `;

    if (typeof pattern != 'string')
      return 'Pattern must be string type';

    if (pattern == '')
      return 'Pattern cannot be empty';

    return null;
  }

  static TextValidator(text) {
    let error = ERROR.NullOrUndefined(text);
    if (error)
      return `Text is ${error} `;

    if (typeof text != 'string')
      return 'Text must be string type';

    if (text == '')
      return 'Text cannot be empty';

    return null;
  }
}

//------------------------------
// EXPORTS

exports.Find = Find;