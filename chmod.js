let PERMISSIONS = require('./permissions.js');
let VALIDATE = require('./validate.js');

//-----------------------------------------
// CHMOD

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
      resolve(true);
    }).catch(error => reject(`Failed to change permissions: ${error}`));
  });
}

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
      resolve(true);
    }).catch(error => reject(`Failed to change permissions: ${error}`));
  });
}

function RemovePermissions(classes, types, paths, isRecursive, executor) { // Example: classes = 'ugo',  types = 'rwx'
  let classesError = ClassesStringValidator(classes);
  if (classesError)
    return Promise.reject(`Failed to remove permissions: ${classesError}`);

  let typesError = TypesStringValidator(types);
  if (typesError)
    return Promise.reject(`Failed to remove permissions: ${typesError}`);

  let pathsError = PathsValidator(paths);
  if (pathsError)
    return Promise.reject(`Failed to remove permissions: ${pathsError}`);

  if (!executor)
    return Promise.reject(`Failed to remove permissions: Executor is required`);

  return new Promise((resolve, reject) => {
    let args = [];
    if (isRecursive)
      args.push('-R');
    args.push(`${classes}-${types}`);
    args = args.concat(paths);

    executor.Execute('chmod', args).then(output => {
      if (output.stderr) {
        reject(`Failed to remove permissions: ${output.stderr}`);
        return;
      }
      resolve(true);
    }).catch(error => reject(`Failed to remove permissions: ${error}`));
  });
}

function AddPermissions(classes, types, paths, isRecursive, executor) {
  let classesError = ClassesStringValidator(classes);
  if (classesError)
    return Promise.reject(`Failed to add permissions: ${classesError}`);

  let typesError = TypesStringValidator(types);
  if (typesError)
    return Promise.reject(`Failed to add permissions: ${typesError}`);

  let pathsError = PathsValidator(paths);
  if (pathsError)
    return Promise.reject(`Failed to add permissions: ${pathsError}`);

  if (!executor)
    return Promise.reject(`Failed to add permissions: Executor is required`);

  return new Promise((resolve, reject) => {
    let args = [];
    if (isRecursive)
      args.push('-R');
    args.push(`${classes}+${types}`);
    args = args.concat(paths);

    executor.Execute('chmod', args).then(output => {
      if (output.stderr) {
        reject(`Failed to add permissions: ${output.stderr}`);
        return;
      }
      resolve(true);
    }).catch(error => reject(`Failed to add permissions: ${error}`));
  });
}

function SetPermissions(classes, types, paths, isRecursive, executor) {
  let classesError = ClassesStringValidator(classes);
  if (classesError)
    return Promise.reject(`Failed to add permissions: ${classesError}`);

  let typesError = TypesStringValidator(types);
  if (typesError)
    return Promise.reject(`Failed to add permissions: ${typesError}`);

  let pathsError = PathsValidator(paths);
  if (pathsError)
    return Promise.reject(`Failed to add permissions: ${pathsError}`);

  if (!executor)
    return Promise.reject(`Failed to add permissions: Executor is required`);

  return new Promise((resolve, reject) => {
    let args = [];
    if (isRecursive)
      args.push('-R');

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
    args = args.concat(paths);

    executor.Execute('chmod', args).then(output => {
      if (output.stderr) {
        reject(`Failed to set permissions: ${output.stderr}`);
        return;
      }
      resolve(true);
    }).catch(error => reject(`Failed to set permissions: ${error}`));
  });
}

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
      resolve(true);
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

//------------------------------------
// EXPORTS

exports.UsingPermString = UsingPermString;
exports.UsingOctalString = UsingOctalString;
exports.RemovePermissions = RemovePermissions;
exports.AddPermissions = AddPermissions;
exports.SetPermissions = SetPermissions;
exports.Manual = Manual;