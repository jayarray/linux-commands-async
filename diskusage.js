let PATH = require('./path.js');
let EXECUTE = require('./execute.js').Execute;

//------------------------------------
// DISK USAGE
class DiskUsage {
  static ListAllItems(dirPath) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(dirPath);
      if (error) {
        reject(error);
        return;
      }

      PATH.Path.IsDir(dirPath).then(isDir => {
        if (!isDir) {
          reject(`Path is not a directory: ${dirPath}`);
          return;
        }

        let args = ['-ha', '--block-size=1', '--max-depth=1', dirPath];
        EXECUTE.Local('du', args).then(output => {
          if (output.stderr) {
            reject(`Failed to get disk usage info: ${output.stderr}`);
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
        }).catch(reject);
      });
    });
  }

  static ListVisibleItems(dirPath) {
    return new Promise((resolve, reject) => {
      DiskUsage.ListAllItems(dirPath).then(items => {
        resolve(items.filter(item => !PATH.Path.Filename(item.path).name.startsWith('.')));
      }).catch(reject);
    });
  }

  static ListHiddenItems(dirPath) {
    return new Promise((resolve, reject) => {
      DiskUsage.ListAllItems(dirPath).then(items => {
        resolve(items.filter(item => PATH.Path.Filename(item.path).name.startsWith('.')));
      }).catch(reject);
    });
  }

  static DirSize(path) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(path);
      if (error) {
        reject(error);
        return;
      }

      PATH.Path.IsDir(path).then(isDir => {
        if (!isDir) {
          reject(`Path is not a directory: ${path}`);
          return;
        }

        let args = ['-sh', '--block-size=1', path];
        EXECUTE.Local('du', args).then(output => {
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