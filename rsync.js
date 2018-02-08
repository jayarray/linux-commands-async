let PATH = require('./path.js');
let EXECUTE = require('./execute.js').Execute;

//------------------------------------------------
// RSYNC

class Rsync {
  static Rsync(user, host, src, dest) {
    return new Promise((resolve, reject) => {
      let error = Error.StringError(user);
      if (error) {
        reject(`user is ${error}`);
        return;
      }

      error = Error.StringError(host);
      if (error) {
        reject(`host is ${error}`);
        return;
      }

      error = PATH.Error.PathError(src);
      if (error) {
        reject(`src is ${error}`);
        return;
      }

      error = PATH.Error.PathError(dest);
      if (error) {
        reject(`dest is ${error}`);
        return;
      }

      PATH.Path.Exists(src).then(exists => {
        if (!exists) {
          reject(`Source error: Path does not exist: ${src}`);
          return;
        }

        let args = ['-a', src, `${user.trim()}@${host.trim()}:${dest}`];
        EXECUTE.Local('rsync', args).then(output => {
          if (output.stderr) {
            reject(`Rsync failed: Exit code (${output.exitCode}): ${output.stderr}`);
            return;
          }
          resolve(output.stdout);
        }).catch(reject);
      }).catch(reject);;
    });
  }

  static Update(user, host, src, dest) { // Update dest if src was updated
    return new Promise((resolve, reject) => {
      let error = Error.StringError(user);
      if (error) {
        reject(`user is ${error}`);
        return;
      }

      error = Error.StringError(host);
      if (error) {
        reject(`host is ${error}`);
        return;
      }

      error = PATH.Error.PathError(src);
      if (error) {
        reject(`src is ${error}`);
        return;
      }

      error = PATH.Error.PathError(dest);
      if (error) {
        reject(`dest is ${error}`);
        return;
      }

      PATH.Path.Exists(src).then(exists => {
        if (!exists) {
          reject(`Source error: Path does not exist: ${src}`);
          return;
        }

        let args = ['-a', '--update', src, `${user.trim()}@${host.trim()}:${dest}`];
        EXECUTE.local('rsync', args).then(output => {
          if (output.stderr) {
            reject(`Rsync failed: Exit code (${output.exitCode}): ${output.stderr}`);
            return;
          }
          resolve(output.stdout);
        }).catch(reject);
      }).catch(reject);
    });
  }

  static Match(user, host, src, dest) { // Copy files and then delete those NOT in src (Match dest to src)
    return new Promise((resolve, reject) => {
      let error = Error.StringError(user);
      if (error) {
        reject(`user is ${error}`);
        return;
      }

      error = Error.StringError(host);
      if (error) {
        reject(`host is ${error}`);
        return;
      }

      error = PATH.Error.PathError(src);
      if (error) {
        reject(`src is ${error}`);
        return;
      }

      error = PATH.Error.PathError(dest);
      if (error) {
        reject(`dest is ${error}`);
        return;
      }

      PATH.Path.Exists(src).then(exists => {
        if (!exists) {
          reject(`Source error: Path does not exist: ${src}`);
          return;
        }

        let args = ['-a', '--delete-after', sTrimmed, `${user.trim()}@${host.trim()}:${dest.trim()}`];
        EXECUTE.Local('rsync', args).then(output => {
          if (output.stderr) {
            reject(`Rsync failed: Exit code (${output.exitCode}): ${output.stderr}`);
            return;
          }
          resolve(output.stdout);
        }).catch(reject);
      }).catch(reject);
    });
  }

  static Manual(user, host, src, dest, flags, options) {  // flags: [chars], options: [strings]
    return new Promise((resolve, reject) => {
      let error = Error.StringError(user);
      if (error) {
        reject(`user is ${error}`);
        return;
      }

      error = Error.StringError(host);
      if (error) {
        reject(`host is ${error}`);
        return;
      }

      error = PATH.Error.PathError(src);
      if (error) {
        reject(`src is ${error}`);
        return;
      }

      error = PATH.Error.PathError(dest);
      if (error) {
        reject(`dest is ${error}`);
        return;
      }

      error = Error.FlagsError(flags);
      if (error) {
        reject(error);
        return;
      }

      error = Error.OptionsError(options);
      if (error) {
        reject(error);
        return;
      }

      PATH.Path.Exists(src).then(exists => {
        if (!exists) {
          reject(`Source error: Path does not exist: ${src}`);
          return;
        }

        let flagStr = `-${flags.join('')}`; // Ex.: -av
        let optionStr = options.join(' ');  // Ex.: --ignore times, --size-only, --exclude <pattern>

        let args = [flagStr, optionStr, src, `${user.trim()}@${host.trim()}:${dest}`];
        EXECUTE.Local('rsync', args).then(output => {
          if (output.stderr) {
            reject(`Rsync failed: Exit code (${output.exitCode}): ${output.stderr}`);
            return;
          }
          resolve(output.stdout);
        }).catch(reject);
      }).catch(reject);
    });
  }

  static DryRun(user, host, src, dest, flags, options) { // Will execute without making changes (for testing command)
    return new Promise((resolve, reject) => {
      let error = Error.StringError(user);
      if (error) {
        reject(`user is ${error}`);
        return;
      }

      error = Error.StringError(host);
      if (error) {
        reject(`host is ${error}`);
        return;
      }

      error = PATH.Error.PathError(src);
      if (error) {
        reject(`src is ${error}`);
        return;
      }

      error = PATH.Error.PathError(dest);
      if (error) {
        reject(`dest is ${error}`);
        return;
      }

      error = Error.FlagsError(flags);
      if (error) {
        reject(error);
        return;
      }

      error = Error.OptionsError(options);
      if (error) {
        reject(error);
        return;
      }

      PATH.Path.Exists(src).then(results => {
        if (!exists) {
          reject(`Source error: Path does not exist: ${src}`);
          return;
        }

        let flagStr = `-${flags.join('')}`; // Ex.: -av
        let optionStr = options.join(' ');  // Ex.: --ignore times, --size-only, --exclude <pattern>

        let args = [flagStr, '--dry-run', optionStr, sTrimmed, `${user}@${host}:${dest}`];
        EXECUTE.Local('rsync', args).then(output => {
          if (output.stderr) {
            reject(`Rsync failed: Exit code (${output.exitCode}): ${output.stderr}`);
            return;
          }
          resolve(output.stdout);
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }
}

//-----------------------------------
// ERROR

class Error {
  static NullOrUndefined(o) {
    if (o === undefined)
      return 'undefined';
    else if (o == null)
      return 'null';
    else
      return null;
  }

  static StringError(s) {
    let error = Error.NullOrUndefined(s);
    if (error)
      return error;

    if (typeof s != 'string')
      return 'not a string';
    else if (s == '')
      return 'empty';
    else if (s.trim() == '')
      return 'whitespace'
    else
      return null;
  }

  static FlagsError(flags) {
    let error = Error.NullOrUndefined(options);
    if (error)
      return `Flags is ${error}`;

    if (!Array.isArray(flags))
      return 'Flags is not an array';

    // Make sure all flags are valid
    for (let i = 0; i < flags; ++i) {
      let currFlag = flags[i];

      let strError = Error.StringError(currFlag);
      if (strError)
        return `Flags contains an element that is ${strError}`;
      else if (currFlag.length != 1)
        return 'Flags can only contain single character strings';
    }
    return null;
  }

  static OptionsError(options) {
    let error = Error.NullOrUndefined(options);
    if (error)
      return `Options is ${error}`;

    if (!Array.isArray(options))
      return 'Options is not an array';

    // Make sure all options are valid
    for (let i = 0; i < options; ++i) {
      let currOption = options[i];

      let strError = Error.StringError(currOption);
      if (strError)
        return `Options contains an element that is ${strError}`;
      else if (!currOption.startsWith('--'))
        return `Options must start with '--'`;
      else if (currOption.length < 3)  // --*
        return `Options must start with '--' followed by 1 or more characters`;
    }
    return null;
  }
}

//-----------------------------------
// EXPORTS

exports.Rsync = Rsync;
exports.Error = Error;