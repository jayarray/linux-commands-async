let ERROR = require('./error.js');
let LINUX_COMMANDS = require('./linuxcommands.js');
let COMMAND = require('./command.js').Command;

//-----------------------------------------------
// CHOWN
class Chown {
  static ChangeOwner(paths, newOwnerId, isRecursive, executor) { // newOwner can be string or integer
    return new Promise((resolve, reject) => {
      let pathsError = Error.PathsValidator(paths);
      if (pathsError) {
        reject(`Failed to change owner: ${pathsError}`);
        return;
      }

      let idError = Error.newIdValidator(newOwnerId);
      if (idError) {
        reject(`Failed to change owner: new owner id ${idError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to change owner: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.ChownChangeOwner(paths, newOwnerId, isRecursive);
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to change owner: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => `Failed to change owner: ${error}`);
    });
  }

  static ChangeGroup(paths, newGroupId, isRecursive, executor) { // newOwner can be string or integer
    return new Promise((resolve, reject) => {
      let pathsError = Error.PathsValidator(paths);
      if (pathsError) {
        reject(`Failed to change group: ${pathsError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to change group: Connection is ${executorError}`);
        return;
      }

      let idError = Error.newIdValidator(newGroupId);
      if (idError) {
        reject(`Failed to change group: new group id ${idError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.ChownChangeGroup(paths, newGroupId, isRecursive);
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to change group: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => `Failed to change group: ${error}`);
    });
  }

  static ChangeOwnerAndGroup(paths, newOwnerId, newGroupId, isRecursive, executor) { // newOwner can be string or integer
    return new Promise((resolve, reject) => {
      let pathsError = Error.PathsValidator(paths);
      if (pathsError) {
        reject(`Failed to change group: ${pathsError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to change owner and group: Connection is ${executorError}`);
        return;
      }

      let idError = Error.newIdValidator(newOwnerId);
      if (idError) {
        reject(`Failed to change owner and group: new owner id ${idError}`);
        return;
      }

      idError = Error.newIdValidator(newGroupId);
      if (idError) {
        reject(`Failed to change owner and group: new group id ${idError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.ChownChangeOwnerAndGroup(paths, newOwnerId, newGroupId, isRecursive);
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to change owner and group: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => `Failed to change owner and group: ${error}`);
    });
  }

  static Manual(args, executor) { // newOwner can be string or integer
    return new Promise((resolve, reject) => {
      let argsError = Error.ArgsValidator(args);
      if (argsError) {
        reject(`Failed to execute chown: ${argsError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to execute chown: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.ChownManual(args);
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to execute chown: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => `Failed to execute chown: ${error}`);
    });
  }
}

//-----------------------------------
// ERROR

class Error {
  static newIdValidator(id) {
    let error = ERROR.NullOrUndefined(id);
    if (error)
      return `is ${error}`;

    if (typeof id != 'string' && !Number.isInteger(id))
      return `must be a string or integer`;

    return null;
  }

  static PathsValidator(paths) {
    let error = ERROR.ArrayValidator(paths);
    if (error)
      return `Paths are ${error}`;

    for (let i = 0; i < paths.length; ++i) {
      let currPath = paths[i];
      let pathIsValid = ERROR.StringValidator(currPath) == null;

      if (!pathIsValid)
        return `All paths must be string type`;
    }

    return null;
  }

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

exports.Chown = Chown;
