let _path = require('path');

let PATH = require('./path.js');
let EXECUTE = require('./execute.js').Execute;
let ERROR = require('./error.js').Error;
let BASHSCRIPT = require('./bashscript.js').BashScript;

//------------------------------------
// FIND
class Find {
  static Manual(path, args) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(path);
      if (error) {
        reject(error);
        return;
      }

      error = Error.ArgsError(args);
      if (error) {
        reject(error);
        return;
      }

      PATH.Path.Exists(path).then(exists => {
        if (!exists) {
          reject(`Path does not exist: ${path}`);
          return;
        }

        EXECUTE.Local('find', [path].concat(args)).then(output => {
          if (output.stderr) {
            reject(output.stderr);
            return;
          }

          let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path && line != path);
          resolve(paths);
        }).catch(reject);
      }).catch(reject);
    });
  }

  static FilesByPattern(path, pattern, maxDepth) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(path);
      if (error) {
        reject(error);
        return;
      }

      error = Error.PatternError(pattern);
      if (error) {
        reject(error);
        return;
      }

      error = Error.MaxDepthError(maxDepth);
      if (error) {
        reject(error);
        return;
      }

      PATH.Path.Exists(path).then(exists => {
        if (!exists) {
          reject(`Path does not exist: ${path}`);
          return;
        }

        let args = [path];
        if (maxDepth && maxDepth > 0)
          args.push('-maxdepth', maxDepth);
        args.push('-type', 'f', '-name', pattern);

        EXECUTE.Local('find', args).then(output => {
          if (output.stderr) {
            reject(output.stderr);
            return;
          }

          let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path && line != path);
          resolve(paths);
        }).catch(reject);
      }).catch(reject);
    });
  }

  static FilesByContent(path, text, maxDepth) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(path);
      if (error) {
        reject(error);
        return;
      }

      error = Error.TextError(text);
      if (error) {
        reject(error);
        return;
      }

      error = Error.MaxDepthError(maxDepth);
      if (error) {
        reject(error);
        return;
      }

      PATH.Path.Exists(path).then(exists => {
        if (!exists) {
          reject(`Path does not exist: ${path}`);
          return;
        }

        let cmd = `find ${path}`;
        if (maxDepth && maxDepth > 0)
          cmd += ` -maxdepth ${maxDepth}`;
        cmd += ` -type f -exec grep -l "${text}" "{}" \\;`;

        let parentDir = PATH.Path.ParentDir(path).dir;
        let tempFilepath = _path.join(parentDir, 'find_files_by_content.sh');

        BASHSCRIPT.Execute(tempFilepath, cmd).then(outputStr => {
          let paths = outputStr.split('\n').filter(line => line && line.trim() != '' && line != path && line != path && line != tempFilepath);
          resolve(paths);
        }).catch(reject);
      }).catch(reject);
    });
  }

  static FilesByUser(path, user, maxDepth) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(path);
      if (error) {
        reject(error);
        return;
      }

      error = ERROR.StringError(user);
      if (error) {
        reject(`user is ${error}`);
        return;
      }

      error = Error.MaxDepthError(maxDepth);
      if (error) {
        reject(error);
        return;
      }

      PATH.Path.Exists(path).then(exists => {
        if (!exists) {
          reject(`Path does not exist: ${path}`);
          return;
        }

        let args = [path];
        if (maxDepth && maxDepth > 0)
          args.push('-maxdepth', maxDepth);
        args.push('-type', 'f', '-user', user);

        let parentDir = PATH.Path.ParentDir(path).dir;
        let tempFilepath = _path.join(parentDir, 'find_files_by_user.sh');

        EXECUTE.Local('find', args).then(output => {
          if (output.stderr) {
            reject(output.stderr);
            return;
          }

          let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path);
          resolve(paths);
        }).catch(reject);
      }).catch(reject);
    });
  }

  static DirsByPattern(path, pattern, maxDepth) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(path);
      if (error) {
        reject(error);
        return;
      }

      error = Error.PatternError(pattern);
      if (error) {
        reject(error);
        return;
      }

      error = Error.MaxDepthError(maxDepth);
      if (error) {
        reject(error);
        return;
      }

      PATH.Path.Exists(path).then(exists => {
        if (!exists) {
          reject(`Path does not exist: ${path}`);
          return;
        }

        let args = [path];
        if (maxDepth && maxDepth > 0)
          args.push('-maxdepth', maxDepth);
        args.push('-type', 'd', '-name', pattern);

        EXECUTE.Local('find', args).then(output => {
          if (output.stderr) {
            reject(output.stderr);
            return;
          }

          let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path);
          resolve(paths);
        }).catch(reject);
      }).catch(reject);
    });
  }

  static EmptyFiles(path, maxDepth) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(path);
      if (error) {
        reject(error);
        return;
      }

      error = Error.MaxDepthError(maxDepth);
      if (error) {
        reject(error);
        return;
      }


      PATH.Path.Exists(path).then(exists => {
        if (!exists) {
          reject(`Path does not exist: ${path}`);
          return;
        }

        let args = [path];
        if (maxDepth && maxDepth > 0)
          args.push('-maxdepth', maxDepth);
        args.push('-empty', '-type', 'f');

        EXECUTE.Local('find', args).then(output => {
          if (output.stderr) {
            reject(output.stderr);
            return;
          }

          let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path);
          resolve(paths);
        }).catch(reject);
      }).catch(reject);
    });
  }

  static EmptyDirs(path, maxDepth) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(path);
      if (error) {
        reject(error);
        return;
      }

      error = Error.MaxDepthError(maxDepth);
      if (error) {
        reject(error);
        return;
      }

      PATH.Path.Exists(path).then(exists => {
        if (!exists) {
          reject(`Path does not exist: ${path}`);
          return;
        }

        let args = [path];
        if (maxDepth && maxDepth > 0)
          args.push('-maxdepth', maxDepth);
        args.push('-empty', '-type', 'd');

        EXECUTE.Local('find', args).then(output => {
          if (output.stderr) {
            reject(output.stderr);
            return;
          }

          let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path);
          resolve(paths);
        }).catch(reject);
      }).catch(reject);
    });
  }
}

//------------------------------
// ERROR

class Error {
  static ArgsError(args) {
    let error = ERROR.ArrayError(args);
    if (error)
      return `args is ${error}`;

    for (let i = 0; i < args.length; ++i) {
      let currArg = args[i];

      let argIsValidString = ERROR.StringError(currArg) == null;
      let argIsValidNumber = !isNaN(currArg);

      if (!argIsValidString && !argIsValidNumber)
        return `Arg elements must be string or number type`;
    }

    return null;
  }

  static MaxDepthError(maxDepth) {
    let error = ERROR.IntegerError(maxDepth);
    if (error)
      return `MaxDepth is ${error}`;

    let min = 0;
    error = ERROR.BoundIntegerError(maxDepth, min, null);
    if (error)
      return `MaxDepth is ${maxDepth}`;

    return null;
  }

  static PatternError(pattern) {
    let error = ERROR.NullOrUndefined(pattern);
    if (error)
      return `Pattern is ${error}`;

    if (typeof pattern != 'string')
      return 'Pattern must be string type';

    if (pattern == '')
      return 'Pattern cannot be empty';

    return null;
  }

  static TextError(text) {
    let error = ERROR.NullOrUndefined(text);
    if (error)
      return `Text is ${error}`;

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