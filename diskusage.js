let PATH = require('./path.js');
let VALIDATE = require('./validate.js');

//------------------------------------
// DISK USAGE

/**
 * List all files and directories (visible and hidden) with their respective sizes.
 * @param {string} dirPath Directory location.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise. If it resolves, it returns an array of objects with the following properties: size (int), path (string). Else, it rejects and returns an error.
 */
function ListAllItems(dirPath, executor) {
  let dirPathError = VALIDATE.IsStringInput(dirPath);
  if (dirPathError)
    return Promise.reject(`Failed to list all disk usage items: Directory path is ${dirPathError}`);

  if (!executor)
    return Promise.reject(`Failed to list all disk usage items: Executor is required`);

  return new Promise((resolve, reject) => {
    PATH.IsDir(dirPath, executor).then(isDir => {
      if (!isDir) {
        reject(`Failed to list all disk usage items: Path is not a directory: ${dirPath}`);
        return;
      }

      executor.Execute('du', ['-ha', '--block-size=1', '--max-depth=1', dirPath]).then(output => {
        if (output.stderr) {
          reject(`Failed to list all disk usage items: ${output.stderr}`);
          return;
        }

        let items = [];

        let lines = output.stdout.trim().split('\n').map(line => line.trim()).filter(line => line && line != '');
        lines.forEach(line => {
          let sizeStr = '';
          for (let i = 0; i < line.length; ++i) {
            let currChar = line.charAt(i);
            if (currChar.trim())
              sizeStr += currChar;
            else
              break;
          }

          let filepath = line.substring(sizeStr.length + 1);
          items.push({ size: parseInt(sizeStr), path: filepath });
        });
        resolve(items.filter(item => item.path != dirPath));
      }).catch(error => reject(`Failed to list all disk usage items: ${error}`));
    }).catch(error => reject(`Failed to list all disk usage items: ${error}`));
  });
}

/**
 * List all visible files and directories with their respective sizes.
 * @param {string} dirPath Directory location.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise. If it resolves, it returns an array of objects with the following properties: size (int), path (string). Else, it rejects and returns an error.
 */
function ListVisibleItems(dirPath, executor) {
  return new Promise((resolve, reject) => {
    ListAllItems(dirPath, executor).then(items => {
      resolve(items.filter(item => !PATH.Filename(item.path).startsWith('.')));
    }).catch(error => reject(`Failed to list visible disk usage items: ${error}`));
  });
}

/**
 * List all hidden files and directories with their respective sizes.
 * @param {string} dirPath Directory location.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise. If it resolves, it returns an array of objects with the following properties: size (int), path (string). Else, it rejects and returns an error.
 */
function ListHiddenItems(dirPath, executor) {
  return new Promise((resolve, reject) => {
    ListAllItems(dirPath, executor).then(items => {
      resolve(items.filter(item => PATH.Filename(item.path).startsWith('.')));
    }).catch(error => reject(`Failed to list hidden disk usage items: ${error}`));
  });
}

/**
 * Determine folder size.
 * @param {string} dirPath Directory location.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise. If it resolves, it returns an integer representing the size in bytes. Else, it rejects and returns an error.
 */
function DirSize(dirPath, executor) {
  let dirPathError = VALIDATE.IsStringInput(dirPath);
  if (dirPathError)
    return Promise.reject(`Failed to get directory size: Directory path is ${dirPathError}`);

  if (!executor)
    return Promise.reject(`Failed to get directory size: Executor is required`);

  return new Promise((resolve, reject) => {
    PATH.IsDir(dirPath, executor).then(isDir => {
      if (!isDir) {
        reject(`Failed to get directory size: Path is not a directory: ${dirPath}`);
        return;
      }

      executor.Execute('du', ['-sh', '--block-size=1', dirPath]).then(output => {
        if (output.stderr) {
          reject(`Failed to get directory size: ${output.stderr}`);
          return;
        }

        let outputStr = output.stdout.trim();

        let sizeStr = '';
        for (let i = 0; i < outputStr.length; ++i) {
          let currChar = outputStr.charAt(i);
          if (currChar.trim())
            sizeStr += currChar;
          else
            break;
        }
        resolve(parseInt(sizeStr));
      }).catch(error => reject(`Failed to get directory size: Directory path is ${error}`));
    }).catch(error => reject(`Failed to get directory size: Directory path is ${error}`));
  });
}

//--------------------------------
// EXPORTS

exports.ListAllItems = ListAllItems;
exports.ListVisibleItems = ListVisibleItems;
exports.ListHiddenItems = ListHiddenItems;
exports.DirSize = DirSize;