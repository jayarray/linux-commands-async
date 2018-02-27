let VALIDATE = require('./validate.js');

//-----------------------------------------------
// CHOWN
class Chown {
  static ChangeOwner(paths, newOwnerId, isRecursive, executor) { // newOwner can be string or integer
    let pathsError = Error.PathsValidator(paths);
    if (pathsError)
      return Promise.reject(`Failed to change owner: ${pathsError}`);

    let idError = Error.newIdValidator(newOwnerId);
    if (idError)
      return Promise.reject(`Failed to change owner: new owner id ${idError}`);

    if (!executor)
      return Promise.reject(`Failed to change owner: Executor is required`);

    return new Promise((resolve, reject) => {
      let args = [];
      if (isRecursive)
        args.push('-R');
      args.push(newOwnerId);
      args = args.concat(paths);

      executor.Execute('chown', args).then(output => {
        if (output.stderr) {
          reject(`Failed to change owner: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => reject(`Failed to change owner: ${error}`));
    });
  }

  static ChangeGroup(paths, newGroupId, isRecursive, executor) { // newOwner can be string or integer
    let pathsError = Error.PathsValidator(paths);
    if (pathsError)
      return Promise.reject(`Failed to change group: ${pathsError}`);

    if (!executor)
      return Promise.reject(`Failed to change group: Executor is required`);

    let idError = Error.newIdValidator(newGroupId);
    if (idError)
      return Promise.reject(`Failed to change group: new group id ${idError}`);

    return new Promise((resolve, reject) => {
      let args = [];
      if (isRecursive)
        args.push('-R');
      args.push(`:${newGroupId}`);
      args = args.concat(paths);

      executor.Execute('chown', args).then(output => {
        if (output.stderr) {
          reject(`Failed to change group: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => reject(`Failed to change group: ${error}`));
    });
  }

  static ChangeOwnerAndGroup(paths, newOwnerId, newGroupId, isRecursive, executor) { // newOwner can be string or integer
    let pathsError = Error.PathsValidator(paths);
    if (pathsError)
      return Promise.reject(`Failed to change group: ${pathsError}`);

    if (!executor)
      return Promise.reject(`Failed to change owner and group: Executor is required`);

    let idError = Error.newIdValidator(newOwnerId);
    if (idError)
      return Promise.reject(`Failed to change owner and group: new owner id ${idError}`);

    idError = Error.newIdValidator(newGroupId);
    if (idError)
      return Promise.reject(`Failed to change owner and group: new group id ${idError}`);

    return new Promise((resolve, reject) => {
      let args = [];
      if (isRecursive)
        args.push('-R');
      args.push(`${newOwnerId}:${newGroupId}`);
      args = args.concat(paths);

      executor.Execute('chown', args).then(output => {
        if (output.stderr) {
          reject(`Failed to change owner and group: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => reject(`Failed to change owner and group: ${error}`));
    });
  }

  static Manual(args, executor) { // newOwner can be string or integer
    let argsError = Error.ArgsValidator(args);
    if (argsError)
      return Promise.reject(`Failed to execute chown: ${argsError}`);

    if (!executor)
      return Promise.reject(`Failed to execute chown: Executor is required`);

    return new Promise((resolve, reject) => {
      executor.Execute('chown', args).then(output => {
        if (output.stderr) {
          reject(`Failed to execute chown: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => reject(`Failed to execute chown: ${error}`));
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
