let PATH = require('path');
let VALIDATE = require('./validate.js');

//------------------------------------
// FIND
class Find {
  static FilesByName(path, pattern, maxDepth, executor) {
    let error = VALIDATE.IsStringInput(path);
    if (error)
      return Promise.reject(`Failed to find files by name: path is ${error}`);

    error = Error.PatternValidator(pattern);
    if (error)
      return Promise.reject(`Failed to find files by name: ${error}`);

    error = Error.MaxDepthValidator(maxDepth);
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

  static FilesByContent(path, text, maxDepth, executor) {
    let error = VALIDATE.IsStringInput(path);
    if (error)
      return Promise.reject(`Failed to find files by content: path is ${error}`);

    error = Error.TextValidator(text);
    if (error)
      return Promise.reject(`Failed to find files by content: ${error}`);

    error = Error.MaxDepthValidator(maxDepth);
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

  static FilesByUser(path, user, maxDepth, executor) {
    let error = VALIDATE.IsStringInput(path);
    if (error)
      return Promise.reject(`Failed to find files by user: path is ${error}`);

    error = VALIDATE.IsStringInput(user);
    if (error)
      return Promise.reject(`Failed to find files by user: user is ${error}`);

    error = Error.MaxDepthValidator(maxDepth);
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

  static DirsByName(path, pattern, maxDepth, executor) {
    let error = VALIDATE.IsStringInput(path);
    if (error)
      return Promise.reject(`Failed to find directories by name: path is ${error}`);

    error = Error.PatternValidator(pattern);
    if (error)
      return Promise.reject(`Failed to find directories by name: ${error}`);

    error = Error.MaxDepthValidator(maxDepth);
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

  static EmptyFiles(path, maxDepth, executor) {
    let error = VALIDATE.IsStringInput(path);
    if (error)
      return Promise.reject(`Failed to find empty files: path is ${error}`);

    error = Error.MaxDepthValidator(maxDepth);
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

  static EmptyDirs(path, maxDepth, executor) {
    let error = VALIDATE.IsStringInput(path);
    if (error)
      return Promise.reject(`Failed to find empty directories: path is ${error}`);

    error = Error.MaxDepthValidator(maxDepth);
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

  static Manual(args, executor) {
    let error = Error.ArgsValidator(args);
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
}

//------------------------------
// ERROR

class Error {
  static ArgsValidator(args) {
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

  static MaxDepthValidator(maxDepth) {
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

  static PatternValidator(pattern) {
    let error = VALIDATE.IsInstance(pattern);
    if (error)
      return `Pattern is ${error} `;

    if (typeof pattern != 'string')
      return 'Pattern must be string type';

    if (pattern == '')
      return 'Pattern cannot be empty';

    return null;
  }

  static TextValidator(text) {
    let error = VALIDATE.IsInstance(text);
    if (error)
      return `Text is ${error} `;

    if (typeof text != 'string')
      return 'Text must be string type';

    if (text == '')
      return 'Text cannot be empty';

    return null;
  }
}

//------------------------------
// EXPORTS

exports.Find = Find;