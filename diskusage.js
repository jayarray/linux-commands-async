let PATH = require('./path.js').Path;
let VALIDATE = require('./validate.js');

//------------------------------------
// DISK USAGE
class DiskUsage {
  static ListAllItems(dirPath, executor) {
    let dirPathError = VALIDATE.IsStringInput(dirPath);
    if (dirPathError)
      return Promise.reject(`Failed to list all disk usage items: Directory path is ${dirPathError}`);

    if (!executor)
      return Promise.reject(`Failed to list all disk usage items: Connection is ${executorError}`);

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

  static ListVisibleItems(dirPath) {
    return new Promise((resolve, reject) => {
      DiskUsage.ListAllItems(dirPath).then(items => {
        resolve(items.filter(item => !PATH.Path.Filename(item.path).name.startsWith('.')));
      }).catch(error => reject(`Failed to list visible disk usage items: ${error}`));
    });
  }

  static ListHiddenItems(dirPath) {
    return new Promise((resolve, reject) => {
      DiskUsage.ListAllItems(dirPath).then(items => {
        resolve(items.filter(item => PATH.Path.Filename(item.path).name.startsWith('.')));
      }).catch(error => reject(`Failed to list hidden disk usage items: ${error}`));
    });
  }

  static DirSize(dirPath, executor) {
    let dirPathError = VALIDATE.IsStringInput(dirPath);
    if (dirPathError)
      return Promise.reject(`Failed to get directory size: Directory path is ${dirPathError}`);

    let executorError = ERROR.ExecutorValidator(executor);
    if (executorError)
      return Promise.reject(`Failed to get directory size: Connection is ${executorError}`);

    return new Promise((resolve, reject) => {
      PATH.Path.IsDir(dirPath, executor).then(isDir => {
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
}

//--------------------------------
// EXPORTS

exports.DiskUsage = DiskUsage;