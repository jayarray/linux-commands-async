let PATH = require('path');
let VALIDATE = require('./validate.js');

//------------------------------
// ERROR

function ArgsValidator(args) {
  let error = VALIDATE.IsArray(args);
  if (error)
    return `args is ${error}`;

  for (let i = 0; i < args.length; ++i) {
    let currArg = args[i];

    let argIsValidString = VALIDATE.IsStringInput(currArg) == null;
    let argIsValidNumber = !isNaN(currArg);

    if (!argIsValidString && !argIsValidNumber)
      return `Arg elements must be string or number type`;
  }

  return null;
}

function MaxDepthValidator(maxDepth) {
  if (maxDepth == null)
    return null;

  let error = VALIDATE.IsInteger(maxDepth);
  if (error)
    return `MaxDepth is ${error} `;

  let min = 0;
  error = VALIDATE.IsIntegerInRange(maxDepth, min, null);
  if (error)
    return `MaxDepth is ${error} `;

  return null;
}

function PatternValidator(pattern) {
  let error = VALIDATE.IsInstance(pattern);
  if (error)
    return `Pattern is ${error} `;

  if (typeof pattern != 'string')
    return 'Pattern must be string type';

  if (pattern == '')
    return 'Pattern cannot be empty';

  return null;
}

function TextValidator(text) {
  let error = VALIDATE.IsInstance(text);
  if (error)
    return `Text is ${error} `;

  if (typeof text != 'string')
    return 'Text must be string type';

  if (text == '')
    return 'Text cannot be empty';

  return null;
}

//------------------------------------
// FIND

/**
 * List all files matching the given name pattern.
 * @param {string} path Directory location
 * @param {string} pattern
 * @param {Number} maxDepth Maximum number of levels to recurse
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise<Array<string>>} Returns a promise. If it resolves, it returns an array of filepaths. Else, it returns an error.
 */
function FilesByName(path, pattern, maxDepth, executor) {
  let error = VALIDATE.IsStringInput(path);
  if (error)
    return Promise.reject(`Failed to find files by name: path is ${error}`);

  error = PatternValidator(pattern);
  if (error)
    return Promise.reject(`Failed to find files by name: ${error}`);

  error = MaxDepthValidator(maxDepth);
  if (error)
    return Promise.reject(`Failed to find files by name: ${error}`);

  if (!executor)
    return Promise.reject(`Failed to find files by name: Executor is required`);

  return new Promise((resolve, reject) => {
    let args = [path];
    if (maxdepth)
      args.push('-maxdepth', maxDepth);
    args.push('-type', 'f', '-name', pattern);

    executor.Execute('find', args).then(output => {
      let deniedPaths = [];

      if (output.stderr) {
        if (output.stderr.includes('Permission denied')) {
          let lines = output.stderr.split('\n').filter(line => line && line.trim() != '' && line != path);

          for (let i = 0; i < lines.length; ++i) {
            let currLine = lines[i];
            let dPath = currLine.split(':')[1].trim();
            deniedPaths.push(dPath);
          }
        }
        else {
          reject(`Failed to find files by name: ${output.stderr}`);
          return;
        }
      }

      let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path && line != path);
      resolve({ paths: paths, denied: deniedPaths });
    }).catch(error => reject(`Failed to find files by name: ${error}`));
  });
}

/**
 * List all files containing the specified text in their content.
 * @param {string} path Directory location
 * @param {string} text
 * @param {Number} maxDepth Maximum number of levels to recurse
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise<Array<string>>} Returns a promise. If it resolves, it returns an array of filepaths. Else, it returns an error.
 */
function FilesByContent(path, text, maxDepth, executor) {
  let error = VALIDATE.IsStringInput(path);
  if (error)
    return Promise.reject(`Failed to find files by content: path is ${error}`);

  error = TextValidator(text);
  if (error)
    return Promise.reject(`Failed to find files by content: ${error}`);

  error = MaxDepthValidator(maxDepth);
  if (error)
    return Promise.reject(`Failed to find files by content: ${error}`);

  if (!executor)
    return Promise.reject(`Failed to find files by content: Executor is required`);

  return new Promise((resolve, reject) => {
    let cmdStr = `find ${path}`;
    if (maxdepth)
      cmdStr += ` -maxdepth ${maxdepth}`;
    cmdStr += ` -type f -exec grep -l "${text}" "{}" \\;`;

    executor.Execute(cmdStr, []).then(output => {
      let deniedPaths = [];

      if (output.stderr) {
        if (output.stderr.includes('Permission denied')) {
          let lines = output.stderr.split('\n').filter(line => line && line.trim() != '' && line != path);

          for (let i = 0; i < lines.length; ++i) {
            let currLine = lines[i];
            let dPath = currLine.split(':')[1].trim();
            deniedPaths.push(dPath);
          }
        }
        else {
          reject(`Failed to find files by content: ${output.stderr}`);
          return;
        }
      }

      let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path && line != path);
      resolve({ paths: paths, denied: deniedPaths });
    }).catch(error => reject(`Failed to find files by content: ${error}`));
  });
}

/**
 * List all files containing the specified text in their content.
 * @param {string} path Directory location
 * @param {string} user
 * @param {Number} maxDepth Maximum number of levels to recurse
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise<Array<string>>} Returns a promise. If it resolves, it returns an array of filepaths. Else, it returns an error.
 */
function FilesByUser(path, user, maxDepth, executor) {
  let error = VALIDATE.IsStringInput(path);
  if (error)
    return Promise.reject(`Failed to find files by user: path is ${error}`);

  error = VALIDATE.IsStringInput(user);
  if (error)
    return Promise.reject(`Failed to find files by user: user is ${error}`);

  error = MaxDepthValidator(maxDepth);
  if (error)
    return Promise.reject(`Failed to find files by user: ${error}`);

  if (!executor)
    return Promise.reject(`Failed to find files by user: Executor is required`);

  return new Promise((resolve, reject) => {
    let args = [path];
    if (maxdepth)
      args.push('-maxdepth', maxDepth);
    args.push('-type', 'f', '-user', user);

    executor.Execute('find', args).then(output => {
      let deniedPaths = [];

      if (output.stderr) {
        if (output.stderr.includes('Permission denied')) {
          let lines = output.stderr.split('\n').filter(line => line && line.trim() != '' && line != path);

          for (let i = 0; i < lines.length; ++i) {
            let currLine = lines[i];
            let dPath = currLine.split(':')[1].trim();
            deniedPaths.push(dPath);
          }
        }
        else {
          reject(`Failed to find files by user: ${output.stderr}`);
          return;
        }
      }

      let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path && line != path);
      resolve({ paths: paths, denied: deniedPaths });
    }).catch(error => reject(`Failed to find files by user: ${error}`));
  });
}

/**
 * List all directories matching the given name pattern.
 * @param {string} path Directory location
 * @param {string} pattern
 * @param {Number} maxDepth Maximum number of levels to recurse
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise<Array<string>>} Returns a promise. If it resolves, it returns an array of filepaths. Else, it returns an error.
 */
function DirsByName(path, pattern, maxDepth, executor) {
  let error = VALIDATE.IsStringInput(path);
  if (error)
    return Promise.reject(`Failed to find directories by name: path is ${error}`);

  error = PatternValidator(pattern);
  if (error)
    return Promise.reject(`Failed to find directories by name: ${error}`);

  error = MaxDepthValidator(maxDepth);
  if (error)
    return Promise.reject(`Failed to find directories by name: ${error}`);

  if (!executor)
    return Promise.reject(`Failed to find directories by name: Executor is required`);

  return new Promise((resolve, reject) => {
    let args = [path];
    if (maxdepth)
      args.push('-maxdepth', maxDepth);
    args.push('-type', 'd', '-name', pattern);

    executor.Execute('find', args).then(output => {
      let deniedPaths = [];

      if (output.stderr) {
        if (output.stderr.includes('Permission denied')) {
          let lines = output.stderr.split('\n').filter(line => line && line.trim() != '' && line != path);

          for (let i = 0; i < lines.length; ++i) {
            let currLine = lines[i];
            let dPath = currLine.split(':')[1].trim();
            deniedPaths.push(dPath);
          }
        }
        else {
          reject(`Failed to find directories by name: ${output.stderr}`);
          return;
        }
      }

      let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path && line != path);
      resolve({ paths: paths, denied: deniedPaths });
    }).catch(error => reject(`Failed to find directories by name: ${error}`));
  });
}

/**
 * List all empty files.
 * @param {string} path Directory location
 * @param {Number} maxDepth Maximum number of levels to recurse.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise<Array<string>>} Returns a promise. If it resolves, it returns an array of filepaths. Else, it returns an error.
 */
function EmptyFiles(path, maxDepth, executor) {
  let error = VALIDATE.IsStringInput(path);
  if (error)
    return Promise.reject(`Failed to find empty files: path is ${error}`);

  error = MaxDepthValidator(maxDepth);
  if (error)
    return Promise.reject(`Failed to find empty files: ${error}`);

  if (!executor)
    return Promise.reject(`Failed to find empty files: Executor is required`);

  return new Promise((resolve, reject) => {
    let args = [path];
    if (maxdepth)
      args.push('-maxdepth', maxDepth);
    args.push('-empty', '-type', 'f');

    executor.Execute('find', args).then(output => {
      let deniedPaths = [];

      if (output.stderr) {
        if (output.stderr.includes('Permission denied')) {
          let lines = output.stderr.split('\n').filter(line => line && line.trim() != '' && line != path);

          for (let i = 0; i < lines.length; ++i) {
            let currLine = lines[i];
            let dPath = currLine.split(':')[1].trim();
            deniedPaths.push(dPath);
          }
        }
        else {
          reject(`Failed to find empty files: ${output.stderr}`);
          return;
        }
      }

      let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path && line != path);
      resolve({ paths: paths, denied: deniedPaths });
    }).catch(error => reject(`Failed to find empty files: ${error}`));
  });
}

/**
 * List all empty directories.
 * @param {string} path Directory location
 * @param {Number} maxDepth Maximum number of levels to recurse.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise<Array<string>>} Returns a promise. If it resolves, it returns an array of filepaths. Else, it returns an error.
 */
function EmptyDirs(path, maxDepth, executor) {
  let error = VALIDATE.IsStringInput(path);
  if (error)
    return Promise.reject(`Failed to find empty directories: path is ${error}`);

  error = MaxDepthValidator(maxDepth);
  if (error)
    return Promise.reject(`Failed to find empty directories: ${error}`);

  if (!executor)
    return Promise.reject(`Failed to find empty directories: Executor is required`);

  return new Promise((resolve, reject) => {
    let args = [path];
    if (maxdepth)
      args.push('-maxdepth', maxDepth);
    args.push('-empty', '-type', 'd');

    executor.Execute('find', args).then(output => {
      let deniedPaths = [];

      if (output.stderr) {
        if (output.stderr.includes('Permission denied')) {
          let lines = output.stderr.split('\n').filter(line => line && line.trim() != '' && line != path);

          for (let i = 0; i < lines.length; ++i) {
            let currLine = lines[i];
            let dPath = currLine.split(':')[1].trim();
            deniedPaths.push(dPath);
          }
        }
        else {
          reject(`Failed to find empty directories: ${output.stderr}`);
          return;
        }
      }

      let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path && line != path);
      resolve({ paths: paths, denied: deniedPaths });
    }).catch(error => reject(`Failed to find empty directories: ${error}`));
  });
}

/**
 * List files given the specified arguments.
 * @param {Array<string|Number>} args List of args used in 'find' command.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise<Array<string>>} Returns a promise. If it resolves, it returns an array of filepaths. Else, it returns an error.
 */
function Manual(args, executor) {
  let error = ArgsValidator(args);
  if (error)
    return Promise.reject(`Failed to execute find command: ${error}`);

  if (!executor)
    return Promise.reject(`Failed to execute find command: Connection is ${executorError}`);

  return new Promise((resolve, reject) => {
    executor.Execute('find', args).then(output => {
      let deniedPaths = [];

      if (output.stderr) {
        if (output.stderr.includes('Permission denied')) {
          let lines = output.stderr.split('\n').filter(line => line && line.trim() != '' && line != path);

          for (let i = 0; i < lines.length; ++i) {
            let currLine = lines[i];
            let dPath = currLine.split(':')[1].trim();
            deniedPaths.push(dPath);
          }
        }
        else {
          reject(`Failed to execute find command: ${output.stderr}`);
          return;
        }
      }

      let paths = output.stdout.split('\n').filter(line => line && line.trim() != '' && line != path && line != path);
      resolve({ paths: paths, denied: deniedPaths });
    }).catch(error => reject(`Failed to execute find command: ${error}`));
  });
}

//------------------------------
// EXPORTS

exports.FilesByName = FilesByName;
exports.FilesByUser = FilesByUser;
exports.FilesByContent = FilesByContent;
exports.DirsByName = DirsByName;
exports.EmptyFiles = EmptyFiles;
exports.EmptyDirs = EmptyDirs;
exports.Manual = Manual;