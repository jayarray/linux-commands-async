let PATH = require('./path.js');
let COMMAND = require('./command.js').Command;
let ERROR = require('./error.js');
let LINUX_COMMANDS = require('./linuxcommands.js');

//------------------------------------------------
// RSYNC

class Rsync {
  static Rsync(user, host, src, dest, executor) {
    return new Promise((resolve, reject) => {
      let error = ERROR.StringValidator(user);
      if (error) {
        reject(`Failed to execute rsync: user is ${error}`);
        return;
      }

      error = ERROR.StringValidator(host);
      if (error) {
        reject(`Failed to execute rsync: host is ${error}`);
        return;
      }

      error = PATH.Error.PathValidator(src);
      if (error) {
        reject(`Failed to execute rsync: source is ${error}`);
        return;
      }

      error = PATH.Error.PathValidator(dest);
      if (error) {
        reject(`Failed to execute rsync: destination is ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to execute rsync: Connection is ${executorError}`);
        return;
      }

      PATH.Path.Exists(src, executor).then(exists => {
        if (!exists) {
          reject(`Failed to execute rsync: source does not exist: ${src}`);
          return;
        }

        let cmd = LINUX_COMMANDS.RsyncStandard(user, host, src, dest);
        COMMAND.Execute(cmd, [], executor).then(output => {
          if (output.stderr) {
            reject(`Failed to execute rsync: ${output.stderr}`);
            return;
          }
          resolve(output.stdout);
        }).catch(error => `Failed to execute rsync: ${error}`);
      }).catch(error => `Failed to execute rsync: ${error}`);
    });
  }

  static Update(user, host, src, dest, executor) { // Update dest if src was updated
    return new Promise((resolve, reject) => {
      let error = ERROR.StringValidator(user);
      if (error) {
        reject(`Failed to execute rsync: user is ${error}`);
        return;
      }

      error = ERROR.StringValidator(host);
      if (error) {
        reject(`Failed to execute rsync: host is ${error}`);
        return;
      }

      error = PATH.Error.PathValidator(src);
      if (error) {
        reject(`Failed to execute rsync: source is ${error}`);
        return;
      }

      error = PATH.Error.PathValidator(dest);
      if (error) {
        reject(`Failed to execute rsync: destination is ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to execute rsync: Connection is ${executorError}`);
        return;
      }

      PATH.Path.Exists(src, executor).then(exists => {
        if (!exists) {
          reject(`Failed to execute rsync: source does not exist: ${src}`);
          return;
        }

        let cmd = LINUX_COMMANDS.RsyncUpdate(user, host, src, dest);
        COMMAND.Execute(cmd, [], executor).then(output => {
          if (output.stderr) {
            reject(`Failed to execute rsync: ${output.stderr}`);
            return;
          }
          resolve(output.stdout);
        }).catch(error => `Failed to execute rsync: ${error}`);
      }).catch(error => `Failed to execute rsync: ${error}`);
    });
  }

  static Match(user, host, src, dest, executor) { // Copy files and then delete those NOT in src (Match dest to src)
    return new Promise((resolve, reject) => {
      let error = ERROR.StringValidator(user);
      if (error) {
        reject(`Failed to execute rsync: user is ${error}`);
        return;
      }

      error = ERROR.StringValidator(host);
      if (error) {
        reject(`Failed to execute rsync: host is ${error}`);
        return;
      }

      error = PATH.Error.PathValidator(src);
      if (error) {
        reject(`Failed to execute rsync: source is ${error}`);
        return;
      }

      error = PATH.Error.PathValidator(dest);
      if (error) {
        reject(`Failed to execute rsync: destination is ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to execute rsync: Connection is ${executorError}`);
        return;
      }

      PATH.Path.Exists(src, executor).then(exists => {
        if (!exists) {
          reject(`Failed to execute rsync: source does not exist: ${src}`);
          return;
        }

        let cmd = LINUX_COMMANDS.RsyncMatch(user, host, src, dest);
        COMMAND.Execute(cmd, [], executor).then(output => {
          if (output.stderr) {
            reject(`Failed to execute rsync: ${output.stderr}`);
            return;
          }
          resolve(output.stdout);
        }).catch(error => `Failed to execute rsync: ${error}`);
      }).catch(error => `Failed to execute rsync: ${error}`);
    });
  }

  static Manual(args, executor) {  // args = [string | number]
    return new Promise((resolve, reject) => {
      let error = Error.ArgsValidator(args);
      if (error) {
        reject(`Failed to execute rsync: ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to execute rsync: Connection is ${executorError}`);
        return;
      }

      PATH.Path.Exists(src, executor).then(exists => {
        if (!exists) {
          reject(`Failed to execute rsync: source does not exist: ${src}`);
          return;
        }

        let cmd = LINUX_COMMANDS.RsyncManual(args);
        COMMAND.Execute(cmd, [], executor).then(output => {
          if (output.stderr) {
            reject(`Failed to execute rsync: ${output.stderr}`);
            return;
          }
          resolve(output.stdout);
        }).catch(error => `Failed to execute rsync: ${error}`);
      }).catch(rejerror => `Failed to execute rsync: ${error}`);
    });
  }

  static DryRun(args, executor) { // Will execute without making changes (for testing command)
    return new Promise((resolve, reject) => {
      let error = Error.ArgsValidator(args);
      if (error) {
        reject(`Failed to execute rsync: ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to execute rsync: Connection is ${executorError}`);
        return;
      }

      PATH.Path.Exists(src, executor).then(results => {
        if (!exists) {
          reject(`Failed to execute rsync: source does not exist: ${src}`);
          return;
        }

        let cmd = LINUX_COMMANDS.RsyncDryRun(args);
        COMMAND.Execute(cmd, [], executor).then(output => {
          if (output.stderr) {
            reject(`Failed to execute rsync: ${output.stderr}`);
            return;
          }
          resolve(output.stdout);
        }).catch(error => `Failed to execute rsync: ${error}`);
      }).catch(error => `Failed to execute rsync: ${error}`);
    });
  }
}

//-----------------------------------
// ERROR

class Error {
  static ArgsValidator(args) {
    let error = ERROR.ArrayValidator(args);
    if (error)
      return `arguments are ${error}`;

    for (let i = 0; i < args.length; ++i) {
      let currArg = args[i];
      let argIsValidString = ERROR.StringValidator(currArg) == null;
      let argIsValidNumber = !isNaN(currArg);

      if (!argIsValidString && !argIsValidNumber)
        return `arg elements must be string or number type`;
    }

    return null;
  }
}

//-----------------------------------
// EXPORTS

exports.Rsync = Rsync;