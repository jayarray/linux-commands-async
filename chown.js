let VALIDATE = require('./validate.js');

//-----------------------------------------------
// CHOWN

function ChangeOwner(paths, newOwnerId, isRecursive, executor) { // newOwner can be string or integer
  let pathsError = PathsValidator(paths);
  if (pathsError)
    return Promise.reject(`Failed to change owner: ${pathsError}`);

  let idError = NewIdValidator(newOwnerId);
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

function ChangeGroup(paths, newGroupId, isRecursive, executor) { // newOwner can be string or integer
  let pathsError = PathsValidator(paths);
  if (pathsError)
    return Promise.reject(`Failed to change group: ${pathsError}`);

  if (!executor)
    return Promise.reject(`Failed to change group: Executor is required`);

  let idError = NewIdValidator(newGroupId);
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

function ChangeOwnerAndGroup(paths, newOwnerId, newGroupId, isRecursive, executor) { // newOwner can be string or integer
  let pathsError = PathsValidator(paths);
  if (pathsError)
    return Promise.reject(`Failed to change group: ${pathsError}`);

  if (!executor)
    return Promise.reject(`Failed to change owner and group: Executor is required`);

  let idError = NewIdValidator(newOwnerId);
  if (idError)
    return Promise.reject(`Failed to change owner and group: new owner id ${idError}`);

  idError = NewIdValidator(newGroupId);
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

function Manual(args, executor) { // newOwner can be string or integer
  let argsError = ArgsValidator(args);
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

//-----------------------------------
// ERROR

function NewIdValidator(id) {
  let error = ERROR.NullOrUndefined(id);
  if (error)
    return `is ${error}`;

  if (typeof id != 'string' && !Number.isInteger(id))
    return `must be a string or integer`;

  return null;
}

function PathsValidator(paths) {
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

function ArgsValidator(args) {
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

//-----------------------------------
// EXPORTS

exports.ChangeOwner = ChangeOwner;
exports.ChangeGroup = ChangeGroup;
exports.ChangeOwnerAndGroup = ChangeOwnerAndGroup;
exports.Manual = Manual;
