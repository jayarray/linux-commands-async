let _path = require('path');

let PATH = require('./path.js');
let COMMAND = require('./command.js').Command;
let ERROR = require('./error.js');
let BASHSCRIPT = require('./bashscript.js').BashScript;
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
        if (output.stderr) {
          reject(`Failed to find files by name: ${output.stderr}`);
          return;
        }

        let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path && line != path);
        resolve(paths);
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
        if (output.stderr) {
          reject(`Failed to find files by content: ${output.stderr}`);
          return;
        }

        let paths = outputStr.split('\n').filter(line => line && line.trim() != '' && line != path && line != path && line != tempFilepath);
        resolve(paths);
      }).catch(error => `Failed to find files by content: ${error}`);

      /*
      PATH.Path.Exists(path).then(exists => {
        if (!exists) {
          reject(`Path does not exist: ${path}`);
          return;
        }

        let cmd = `find ${path}`;
        if (maxDepth && maxDepth > 0)
          cmd += ` - maxdepth ${maxDepth}`;
        cmd += ` - type f - exec grep - l "${text}" "{}" \\; `;

        let parentDir = PATH.Path.ParentDir(path).dir;
        let tempFilepath = _path.join(parentDir, 'find_files_by_content.sh');

        BASHSCRIPT.Execute(tempFilepath, cmd).then(outputStr => {
          let paths = outputStr.split('\n').filter(line => line && line.trim() != '' && line != path && line != path && line != tempFilepath);
          resolve(paths);
        }).catch(reject);
      }).catch(reject);*/
    });
  }

  static FilesByUser(path, user, maxDepth, executor) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathValidator(path);
      if (error) {
        reject(`Failed to find files by user: ${error}`);
        return;
      }

      error = ERROR.StringError(user);
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
        if (output.stderr) {
          reject(`Failed to find files by user: ${output.stderr}`);
          return;
        }

        let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path);
        resolve(paths);
      }).catch(`Failed to find files by user: ${error}`);
    });
  }

  static DirsByName(path, pattern, maxDepth, executor) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(path);
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
        if (output.stderr) {
          reject(`Failed to find directories by name: ${output.stderr}`);
          return;
        }

        let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path);
        resolve(paths);
      }).catch(`Failed to find directories by name: ${error}`);
    });
  }

  static EmptyFiles(path, maxDepth, executor) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(path);
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
        if (output.stderr) {
          reject(`Failed to find empty files:: ${output.stderr}`);
          return;
        }

        let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path);
        resolve(paths);
      }).catch(`Failed to find empty files: ${error}`);
    });
  }

  static EmptyDirs(path, maxDepth, executor) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(path);
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
        if (output.stderr) {
          reject(`Failed to find empty directories:: ${output.stderr}`);
          return;
        }

        let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path);
        resolve(paths);
      }).catch(`Failed to find empty directories: ${error}`);
    });
  }

  static Manual(args, executor) {
    return new Promise((resolve, reject) => {
      let error = Error.ArgsValidator(args);
      if (error) {
        reject(`Failed to execute findm command: ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to execute find command: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.FindManual(args);
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to execute find command: ${output.stderr}`);
          return;
        }

        let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path && line != path);
        resolve(paths);
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

      let argIsValidString = ERROR.StringError(currArg) == null;
      let argIsValidNumber = !isNaN(currArg);

      if (!argIsValidString && !argIsValidNumber)
        return `Arg elements must be string or number type`;
    }

    return null;
  }

  static MaxDepthValidator(maxDepth) {
    let error = ERROR.IntegerValidator(maxDepth);
    if (error)
      return `MaxDepth is ${error} `;

    let min = 0;
    error = ERROR.BoundIntegerError(maxDepth, min, null);
    if (error)
      return `MaxDepth is ${maxDepth} `;

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