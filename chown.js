let VALIDATE = require('./validate.js');

//-----------------------------------------------
// CHOWN

/**
 * Change user ownership.
 * @param {Array<string>} paths A list of paths that will change user ownership.
 * @param {string|Number} newOwnerId Username or user ID number.
 * @param {boolean} isRecursive Assign as true if ownership is to be applied recursively, otherwise assign as false.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise that will resolve if successful, otherwise it rejects and returns an error.
 */
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

/**
 * Change group ownership.
 * @param {Array<string>} paths A list of paths that will change group ownership.
 * @param {string|Number} newGroupId Group name or group ID number.
 * @param {boolean} isRecursive Assign as true if ownership is to be applied recursively, otherwise assign as false.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise that will resolve if successful, otherwise it rejects and returns an error.
 */
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

/**
 * Change user and group ownership simultaneously.
 * @param {Array<string>} paths A list of paths that will change user and group ownership.
 * @param {string|Number} newOwnerId Username or user ID number.
 * @param {string|Number} newGroupId Group name or group ID number.
 * @param {boolean} isRecursive Assign as true if ownership is to be applied recursively, otherwise assign as false.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise that will resolve if successful, otherwise it rejects and returns an error.
 */
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

/**
 * Change user and group ownership simultaneously.
 * @param {Array<string|Number>} args A list of args used in 'chown' command.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise that will resolve if successful, otherwise it rejects and returns an error.
 */
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
  let error = VALIDATE.IsInstance(id);
  if (error)
    return `is ${error}`;

  if (typeof id != 'string' && !Number.isInteger(id))
    return `must be a string or integer`;

  return null;
}

function PathsValidator(paths) {
  let error = VALIDATE.IsArray(paths);
  if (error)
    return `Paths are ${error}`;

  for (let i = 0; i < paths.length; ++i) {
    let currPath = paths[i];
    let pathIsValid = VALIDATE.IsStringInput(currPath) == null;

    if (!pathIsValid)
      return `All paths must be string type`;
  }

  return null;
}

function ArgsValidator(args) {
  let error = VALIDATE.IsArray(args);
  if (error)
    return `arguments are ${error}`;

  for (let i = 0; i < args.length; ++i) {
    let currArg = args[i];
    let argIsValidString = VALIDATE.IsStringInput(currArg) == null;
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
