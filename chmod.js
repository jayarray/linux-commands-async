let PERMISSIONS = require('./permissions.js');
let VALIDATE = require('./validate.js');

//------------------------------------
// ERROR

function ClassesStringValidator(string) {
  let error = VALIDATE.IsStringInput(string);
  if (error)
    return `Classes string is ${error} `;

  let min = 1;
  let max = 3;

  // Check length
  if (string.length < min || string.length > max)
    return `Classes string must have ${min} to ${max} characters`;

  // Check for invalid chars
  for (let i = 0; i < string.length; ++i) {
    let currChar = string.charAt(i);
    if (!ValidClassChars().includes(currChar))
      return `Classes string contains invalid characters`;
  }

  return null;
}

function TypesStringValidator(string) {
  let error = VALIDATE.IsStringInput(string);
  if (error)
    return `Types string is ${error} `;

  let min = 1;
  let max = 3;

  // Check length
  if (string.length < min || string.length > max)
    return `Types string must have ${min} to ${max} characters`;

  // Check for invalid chars
  for (let i = 0; i < string.length; ++i) {
    let currChar = string.charAt(i);
    if (!ValidTypeChars().includes(currChar))
      return `Types string contains invalid characters`;
  }

  return null;
}

function PathsValidator(paths) {
  let error = VALIDATE.IsArray(paths);
  if (error)
    return `Paths are ${error} `;

  for (let i = 0; i < paths.length; ++i) {
    let currPath = paths[i];
    let pathIsValid = VALIDATE.IsStringInput(currPath) == null;

    if (!pathIsValid)
      return `All paths must be valid(non - empty, non - whitespace) strings`;
  }

  return null;
}

function ArgsValidator(args) {
  let error = VALIDATE.IsArray(args);
  if (error)
    return `arguments are ${error} `;

  for (let i = 0; i < args.length; ++i) {
    let currArg = args[i];
    let argIsValidString = VALIDATE.IsStringInput(currArg) == null;
    let argIsValidNumber = !isNaN(currArg);

    if (!argIsValidString && !argIsValidNumber)
      return `arg elements must be string or number type`;
  }

  return null;
}

//-----------------------------------------
// CHMOD

/**
 * Change permissions to match the permissions string representation.
 * @param {string} permStr Permissions string.
 * @param {Array<string>} paths A list of paths that will have their permissions changed.
 * @param {boolean} isRecursive Assign as true if changes are to be applied recursively, otherwise assign as false.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise that will resolve if successful, otherwise it returns an error.
 */
function UsingPermString(permStr, paths, isRecursive, executor) {
  let permStrError = VALIDATE.IsStringInput(permStr);
  if (permStrError)
    return Promise.reject(`Failed to change permissions: Permissions string is ${permStrError}`);

  let pathsError = PathsValidator(paths);
  if (pathsError)
    return Promise.reject(`Failed to change permissions: ${pathsError}`);

  if (!executor)
    return Promise.reject(`Failed to change permissions: Executor is required`);

  let permsObj = PERMISSIONS.CreatePermissionsObjectUsingPermissionsString(permStr.trim());
  if (permsObj.error)
    return Promise.reject(`Failed to change permissions: ${permsObj.error}`);

  return new Promise((resolve, reject) => {
    let octalStr = permsObj.obj.octal.string;

    let args = [];
    if (isRecursive)
      args.push('-R');
    args.push(octalStr);
    args = args.concat(paths);

    executor.Execute('chmod', args).then(output => {
      if (output.stderr) {
        reject(`Failed to change permissions: ${output.stderr}`);
        return;
      }
      resolve();
    }).catch(error => reject(`Failed to change permissions: ${error}`));
  });
}

/**
 * Change permissions to match the octal string representation.
 * @param {string} octalStr Octal string.
 * @param {Array<string>} paths A list of paths that will have their permissions changed.
 * @param {boolean} isRecursive Assign as true if changes are to be applied recursively, otherwise assign as false.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise that will resolve if successful, otherwise it returns an error.
 */
function UsingOctalString(octalStr, paths, isRecursive, executor) {
  let octalStrError = VALIDATE.IsStringInput(octalStr);
  if (octalStrError)
    return Promise.reject(`Failed to change permissions: octal string is ${octalStrError}`);

  let pathsError = PathsValidator(paths);
  if (pathsError)
    return Promise.reject(`Failed to change permissions: ${pathsError}`);

  if (!executor)
    return Promise.reject(`Failed to change permissions: Executor is required`);

  let permsObj = PERMISSIONS.CreatePermissionsObjectUsingOctalString(octalStr.trim());
  if (permsObj.error)
    return Promise.reject(`Failed to change permissions: ${permsObj.error}`);

  return new Promise((resolve, reject) => {
    let args = [];
    if (isRecursive)
      args.push('-R');
    args.push(octalStr);
    args = args.concat(paths);

    executor.Execute('chmod', args).then(output => {
      if (output.stderr) {
        reject(`Failed to change permissions: ${output.stderr}`);
        return;
      }
      resolve();
    }).catch(error => reject(`Failed to change permissions: ${error}`));
  });
}

function ChangePermissions_(op, classes, types, paths, isRecursive, executor) { // op = (+ | - | =)
  let ops = ['+', '-', '='];
  if (!ops.includes(op)) {
    return Promise.reject(`Failed to change permissions: Operation is invalid. Must be '+', '-', or '='`);
  }

  let classesError = ClassesStringValidator(classes);
  if (classesError)
    return Promise.reject(`Failed to change permissions: ${classesError}`);

  let typesError = TypesStringValidator(types);
  if (typesError)
    return Promise.reject(`Failed to change permissions: ${typesError}`);

  let pathsError = PathsValidator(paths);
  if (pathsError)
    return Promise.reject(`Failed to change permissions: ${pathsError}`);

  if (!executor)
    return Promise.reject(`Failed to change permissions: Executor is required`);

  return new Promise((resolve, reject) => {
    let args = [];
    if (isRecursive)
      args.push('-R');

    if (op == '-')
      args.push(`${classes}-${types}`);
    else if (op == '+')
      args.push(`${classes}+${types}`);
    else if (op == '=') {
      let classChars = ['u', 'g', 'o'];
      let classCharsSet = new Set(classChars);
      let classesStringSet = new Set(classes.split(''));

      let missingClassChars = Array.from(new Set(classChars.filter(x => !classesStringSet.has(x))));
      if (missingClassChars.length == 0)
        args.push(`a=${types}`);
      else {
        let typeChars = ['r', 'w', 'x'];
        args.push(`${classes}=${types},${missingClassChars.join('')}-${typeChars.join('')}`);
      }
    }
    args = args.concat(paths);

    executor.Execute('chmod', args).then(output => {
      if (output.stderr) {
        reject(`Failed to change permissions: ${output.stderr}`);
        return;
      }
      resolve();
    }).catch(error => reject(`Failed to change permissions: ${error}`));
  });
}

/**
 * Remove permissions from the specified classes and types.
 * @param {string} classes A string containing any of the 3 classes: 'u' (user/owner), 'g' (group), 'o' (other).
 * @param {string} types A string containing any of the 3 types: 'r' (read), 'w' (write), 'x' (execute).
 * @param {Array<string>} paths A list of paths that will have their permissions changed.
 * @param {boolean} isRecursive Assign as true if changes are to be applied recursively, otherwise assign as false.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise that will resolve if successful, otherwise it returns an error.
 */
function RemovePermissions(classes, types, paths, isRecursive, executor) { // Example: classes = 'ugo',  types = 'rwx'
  return ChangePermissions_('-', classes, types, paths, isRecursive, executor);
}

/**
 * Add permissions to the specified classes and types.
 * @param {string} classes A string containing any of the 3 classes: 'u' (user/owner), 'g' (group), 'o' (other).
 * @param {string} types A string containing any of the 3 types: 'r' (read), 'w' (write), 'x' (execute).
 * @param {Array<string>} paths A list of paths that will have their permissions changed.
 * @param {boolean} isRecursive Assign as true if changes are to be applied recursively, otherwise assign as false.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise that will resolve if successful, otherwise it returns an error.
 */
function AddPermissions(classes, types, paths, isRecursive, executor) {
  return ChangePermissions_('+', classes, types, paths, isRecursive, executor);
}

/**
 * Set permissions for the specified classes and types. (Any unspecified classes and types will have their permissions removed).
 * @param {string} classes A string containing any of the 3 classes: 'u' (user/owner), 'g' (group), 'o' (other).
 * @param {string} types A string containing any of the 3 types: 'r' (read), 'w' (write), 'x' (execute).
 * @param {Array<string>} paths A list of paths that will have their permissions changed.
 * @param {boolean} isRecursive Assign as true if changes are to be applied recursively, otherwise assign as false.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise that will resolve if successful, otherwise it returns an error.
 */
function SetPermissions(classes, types, paths, isRecursive, executor) {
  return ChangePermissions_('=', classes, types, paths, isRecursive, executor);
}

/**
 * Change ownership.
 * @param {Array<string|Number>} args A list of args used in 'chmod' command.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise that will resolve if successful, otherwise it returns an error.
 */
function Manual(args, executor) {
  let argsError = ArgsValidator(args);
  if (argsError)
    return Promise.reject(`Failed to execute chmod: ${argsError}`);

  if (!executor)
    return Promise.reject(`Failed to execute chmod: Executor is required`);

  return new Promise((resolve, reject) => {
    executor.Execute('chmod', args).then(output => {
      if (output.stderr) {
        reject(`Failed to execute chmod: ${output.stderr} `);
        return;
      }
      resolve();
    }).catch(error => reject(`Failed to execute chmod: ${error} `));
  });
}

function ValidClassChars() {
  return ['u', 'g', 'o'];
}

function ValidTypeChars() {
  return ['r', 'w', 'x'];
}

//------------------------------------
// EXPORTS

exports.UsingPermString = UsingPermString;
exports.UsingOctalString = UsingOctalString;
exports.RemovePermissions = RemovePermissions;
exports.AddPermissions = AddPermissions;
exports.SetPermissions = SetPermissions;
exports.Manual = Manual;