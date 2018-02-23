let PERMISSIONS = require('./permissions.js');
let ERROR = require('./error.js');
let PATH = require('./path.js').Path;
let COMMAND = require('./command.js').Command;
let LINUX_COMMANDS = require('./linuxcommands.js');

//-----------------------------------------
// HELPERS

function getNewPermStringBasedOnModifiedPermsObj(permsObj) {
  // u
  let ur = permsObj.u.r ? 'r' : '-';
  let uw = permsObj.u.w ? 'w' : '-';
  let ux = '';
  if (permsObj.u.x == true && permsObj.u.xchar == '-')
    ux = 'x';
  else if (permsObj.u.x == true && permsObj.u.xchar != '-')
    ux = permsObj.u.xchar;
  else
    ux = '-';

  // g
  let gr = permsObj.g.r ? 'r' : '-';
  let gw = permsObj.g.w ? 'w' : '-';
  let gx = '';
  if (permsObj.g.x == true && permsObj.g.xchar == '-')
    gx = 'x';
  else if (permsObj.g.x == true && permsObj.g.xchar != '-')
    gx = permsObj.g.xchar;
  else
    gx = '-';

  // o
  let or = permsObj.o.r ? 'r' : '-';
  let ow = permsObj.o.w ? 'w' : '-';
  let ox = '';
  if (permsObj.o.x == true && permsObj.o.xchar == '-')
    ox = 'x';
  else if (permsObj.o.x == true && permsObj.o.xchar != '-')
    ox = permsObj.o.xchar;
  else
    ox = '-';

  return `${ur}${uw}${ux}${gr}${gw}${gx}${or}${ow}${ox}`;
}


//-----------------------------------------
// CHMOD
class Chmod {
  static UsingPermString(permStr, paths, isRecursive, executor) {
    return new Promise((resolve, reject) => {
      let error = ERROR.StringValidator(permStr);
      if (error) {
        reject(`Failed to change permissions: Permissions string is ${error}`);
        return;
      }

      let pathsError = Error.PathsValidator(paths);
      if (pathsError) {
        reject(`Failed to change permissions: ${pathsError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to change permissions: Connection is ${executorError}`);
        return;
      }

      let permsObj = PERMISSIONS.Permissions.CreatePermissionsObjectUsingPermissionsString(permStr.trim());
      if (permsObj.error) {
        reject(`Failed to change permissions: ${permsObj.error}`);
        return;
      }

      let octalStr = permsObj.obj.octal.string;
      let cmd = LINUX_COMMANDS.ChmodUsingOctalString(paths, octalStr, isRecursive);

      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to change permissions: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => `Failed to change permissions: ${error}`);
    });
  }

  static UsingOctalString(octalStr, paths, isRecursive, executor) {
    return new Promise((resolve, reject) => {
      let error = ERROR.StringValidator(octalStr);
      if (error) {
        reject(`Failed to change permissions: octal string is ${error}`);
        return;
      }

      let pathsError = Error.PathsValidator(paths);
      if (pathsError) {
        reject(`Failed to change permissions: ${pathsError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to change permissions: Connection is ${executorError}`);
        return;
      }

      let octalStrError = PERMISSIONS.Error.OctalStringValidator(octalStr);
      if (octalStrError) {
        reject(`Failed to change permissions: ${octalStrError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.ChmodUsingOctalString(paths, octalStr, isRecursive);
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to change permissions: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => `Failed to change permissions: ${error}`);
    });
  }

  static RemovePermissions(classes, types, paths, isRecursive, executor) { // Example: classes = 'ugo',  types = 'rwx'
    return new Promise((resolve, reject) => {
      let error = Error.ClassesStringValidator(classes);
      if (error) {
        reject(`Failed to remove permissions: ${error}`);
        return;
      }

      error = Error.TypesStringValidator(types);
      if (error) {
        reject(`Failed to remove permissions: ${error}`);
        return;
      }

      let pathsError = Error.PathsValidator(paths);
      if (pathsError) {
        reject(`Failed to remove permissions: ${pathsError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to remove permissions: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.ChmodRemovePermissions(paths, classes, types, isRecursive);
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to remove permissions: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => `Failed to remove permissions: ${error}`);
    });
  }

  static AddPermissions(classes, types, paths, isRecursive, executor) {
    return new Promise((resolve, reject) => {
      let error = Error.ClassesStringValidator(classes);
      if (error) {
        reject(`Failed to add permissions: ${error}`);
        return;
      }

      error = Error.TypesStringValidator(types);
      if (error) {
        reject(`Failed to add permissions: ${error}`);
        return;
      }

      let pathsError = Error.PathsValidator(paths);
      if (pathsError) {
        reject(`Failed to add permissions: ${pathsError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to add permissions: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.ChmodAddPermissions(paths, classes, types, isRecursive);
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to add permissions: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => `Failed to add permissions: ${error}`);
    });
  }

  static SetPermissions(classes, types, paths, isRecursive, executor) {
    return new Promise((resolve, reject) => {
      let error = Error.ClassesStringValidator(classes);
      if (error) {
        reject(`Failed to set permissions: ${error}`);
        return;
      }

      error = Error.TypesStringValidator(types);
      if (error) {
        reject(`Failed to set permissions: ${error}`);
        return;
      }

      let pathsError = Error.PathsValidator(paths);
      if (pathsError) {
        reject(`Failed to set permissions: ${pathsError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to set permissions: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.ChmodSetPermissions(paths, classes, types, isRecursive);
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to set permissions: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => `Failed to set permissions: ${error}`);
    });
  }

  static Manual(args, executor) {
    return new Promise((resolve, reject) => {
      let error = Error.ArgsValidator(args);
      if (error) {
        reject(`Failed to execute chmod: ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to execute chmod: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.ChmodManual(args);
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to execute chmod: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => `Failed to execute chmod: ${error}`);
    });
  }

  static ValidClassChars() {
    return PERMISSIONS.Permissions.ValidClassChars();
  }

  static ValidTypeChars() {
    return ['r', 'w', 'x'];
  }
}

//------------------------------------
// ERROR

class Error {
  static ClassesStringValidator(string) {
    let error = ERROR.StringValidator(string);
    if (error)
      return `Classes string is ${error}`;

    let min = 1;
    let max = 3;

    // Check length
    if (string.length < min || string.length > max)
      return `Classes string must have ${min} to ${max} characters`;

    // Check for invalid chars
    for (let i = 0; i < string.length; ++i) {
      let currChar = string.charAt(i);
      if (!Chmod.ValidClassChars().includes(currChar))
        return `Classes string contains invalid characters`;
    }

    return null;
  }

  static TypesStringValidator(string) {
    let error = ERROR.StringValidator(string);
    if (error)
      return `Types string is ${error}`;

    let min = 1;
    let max = 3;

    // Check length
    if (string.length < min || string.length > max)
      return `Types string must have ${min} to ${max} characters`;

    // Check for invalid chars
    for (let i = 0; i < string.length; ++i) {
      let currChar = string.charAt(i);
      if (!Chmod.ValidTypeChars().includes(currChar))
        return `Types string contains invalid characters`;
    }

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
        return `All paths must be valid (non-empty, non-whitespace) strings`;
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

//------------------------------------
// EXPORTS

exports.Chmod = Chmod;