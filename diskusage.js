let PATH = require('./path.js');
let ERROR = require('./error.js');
let COMMAND = require('./command.js').Command;
let LINUX_COMMANDS = require('./linuxcommands.js');

//------------------------------------
// DISK USAGE
class DiskUsage {
  static ListAllItems(dirPath, executor) {
    return new Promise((resolve, reject) => {
      let dirPathError = PATH.Error.PathValidator(dirPath);
      if (dirPathError) {
        reject(`Failed to list all disk usage items: Directory path is ${dirPathError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to list all disk usage items: Connection is ${executorError}`);
        return;
      }

      PATH.Path.IsDir(dirPath, executor).then(isDir => {
        if (!isDir) {
          reject(`Failed to list all disk usage items: Path is not a directory: ${dirPath}`);
          return;
        }

        let cmd = LINUX_COMMANDS.DiskUsageListAllContents(dirPath);
        COMMAND.Execute(cmd, [], executor).then(output => {
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
      }).catch(error => `Failed to list visible disk usage items: ${error}`);
    });
  }

  static ListHiddenItems(dirPath) {
    return new Promise((resolve, reject) => {
      DiskUsage.ListAllItems(dirPath).then(items => {
        resolve(items.filter(item => PATH.Path.Filename(item.path).name.startsWith('.')));
      }).catch(error => `Failed to list hidden disk usage items: ${error}`);
    });
  }

  static DirSize(dirPath, executor) {
    return new Promise((resolve, reject) => {
      let dirPathError = PATH.Error.PathValidator(dirPath);
      if (dirPathError) {
        reject(`Failed to get directory size: Directory path is ${dirPathError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to get directory size: Connection is ${executorError}`);
        return;
      }

      PATH.Path.IsDir(dirPath, executor).then(isDir => {
        if (!isDir) {
          reject(`Failed to get directory size: Path is not a directory: ${dirPath}`);
          return;
        }

        let cmd = LINUX_COMMANDS.DiskUsageDirSize(dirPath);
        COMMAND.Execute(cmd, [], executor).then(output => {
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
        }).catch(reject);
      }).catch(reject);
    });
  }
}

//--------------------------------
// EXPORTS

exports.DiskUsage = DiskUsage;