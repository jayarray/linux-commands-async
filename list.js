let PATH = require('./path.js');
let COMMAND = require('./command.js').Command;
let ERROR = require('./error.js');
let LINUX_COMMAND = require('./linuxcommands.js');

//---------------------------------------------
// List (ls)
class List {
  static AllFilenames(dirPath, executor) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathValidator(dirPath);
      if (error) {
        reject(`Failed to list all filenames: ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to list all filenames: Connection is ${executorError}`);
        return;
      }

      PATH.Path.IsDir(dirPath, executor).then(isDir => {
        if (!isDir) {
          reject(`Failed to list all filenames: Path is not a directory: ${dirPath}`);
          return;
        }

        let cmd = LINUX_COMMAND.ListAllFilenames(dirPath);
        COMMAND.Execute(cmd, [], executor).then(output => {
          if (output.stderr) {
            reject(`Failed to list all filenames: ${output.stderr}`);
            return;
          }
          resolve(output.stdout.split('\n'));
        }).catch(error => `Failed to list all filenames: ${error}`);
      }).catch(error => `Failed to list all filenames: ${error}`);
    });
  }

  static VisibleFilenames(dirPath, executor) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathValidator(dirPath);
      if (error) {
        reject(`Failed to list visible filenames: ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to list visible filenames: Connection is ${executorError}`);
        return;
      }

      List.AllFilenames(dirPath, executor).then(filenames => {
        resolve(filenames.filter(x => !x.startsWith('.')));
      }).catch(error => `Failed to list visible filenames: ${error}`);
    });
  }

  static HiddenFilenames(dirPath, executor) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathValidator(dirPath);
      if (error) {
        reject(`Failed to list hidden filenames: ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to list hidden filenames: Connection is ${executorError}`);
        return;
      }

      List.AllFilenames(dirPath, executor).then(filenames => {
        resolve(filenames.filter(x => x.startsWith('.')));
      }).catch(error => `Failed to list hidden filenames: ${error}`);
    });
  }

  static FileInfo(filepath, executor) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathValidator(filepath);
      if (error) {
        reject(`Failed to get file info: ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to get file info: Connection is ${executorError}`);
        return;
      }

      PATH.Path.IsFile(filepath, executor).then(isFile => {
        if (!isFile) {
          reject(`Failed to get file info: Path is not a file: ${filepath}`);
          return;
        }

        let cmd = LINUX_COMMAND.ListFileLongListing(filepath);
        COMMAND.Execute(cmd, [], executor).then(output => {
          if (output.stderr) {
            reject(`Failed to get file info: ${output.stderr}`);
            return;
          }

          let results = List.ParseLsString(output.stdout.trim());
          if (results.error) {
            reject(results.error);
            return;
          }
          resolve(results.info);
        }).catch(error => `Failed to get file info: ${error}`);
      }).catch(error => `Failed to get file info: ${error}`);
    });
  }

  static DirInfo(dirPath, executor) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathValidator(dirPath);
      if (error) {
        reject(`Failed to get directory info: ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to get directory info: Connection is ${executorError}`);
        return;
      }

      PATH.Path.IsDir(dirPath, executor).then(isDir => {
        if (!isDir) {
          reject(`Failed to get directory info: Path is not a directory: ${dirPath}`);
          return;
        }

        let cmd = LINUX_COMMAND.ListDirLongListing(dirPath);
        COMMAND.Execute(cmd, [], executor).then(output => {
          if (output.stderr) {
            reject(`Failed to get directory info: ${output.stderr}`);
            return;
          }

          let results = List.ParseLsString(output.stdout.trim());
          if (results.error) {
            reject(results.error);
            return;
          }
          resolve(results.info);
        }).catch(error => `Failed to get directory info: ${error}`);
      }).catch(error => `Failed to get directory info: ${error}`);
    });
  }

  static Info(path, executor) {
    return new Promise((resolve, reject) => {
      List.FileInfo(path, executor).then(fileInfo => {
        resolve(fileInfo);
      }).catch((ferr) => {
        List.DirInfo(path, executor).then(dirInfo => {
          resolve(dirInfo);
        }).catch((derr) => {
          let errArr = [];
          if (ferr)
            errArr.push(ferr);
          if (ferr)
            errArr.push(derr);

          // Dedup
          errArr = Array.from(new Set(errArr));
          reject(`Failed to get info: ${errArr.join('; ')}`);
        });
      });
    });
  }

  static AllInfos(dirPath, executor) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathValidator(dirPath);
      if (error) {
        reject(`Failed to get all infos: ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to get all infos: Connection is ${executorError}`);
        return;
      }

      PATH.Path.IsDir(dirPath, executor).then(isDir => {
        if (!isDir) {
          reject(`Failed to get all infos: Path is not a directory: ${dirPath}`);
          return;
        }

        let cmd = LINUX_COMMAND.ListAllLongListings(dirPath);
        COMMAND.Execute(cmd, [], executor).then(output => {
          if (output.stderr) {
            reject(`Failed to get all infos: ${output.stderr}`);
            return;
          }

          let lines = output.stdout.trim().split('\n').slice(1).map(line => line.trim());
          if (lines.length < 2) {
            resolve([]);
            return;
          }

          let infos = [];
          lines.forEach(line => {
            let results = List.ParseLsString(line.trim());
            infos.push(results.info);
          });
          resolve(infos);
        }).catch(error => `Failed to get all infos: ${error}`);
      }).catch(error => `Failed to get all infos: ${error}`);
    });
  }

  static VisibleInfos(dirPath, executor) {
    return new Promise((resolve, reject) => {
      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to get all visible infos: Connection is ${executorError}`);
        return;
      }

      List.AllInfos(dirPath, executor).then(infos => {
        resolve(infos.filter(item => !item.name.startsWith('.')));
      }).catch(error => `Failed to get visible infos: ${error}`);
    });
  }

  static HiddenInfos(dirPath, executor) {
    return new Promise((resolve, reject) => {
      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to get hidden infos: Connection is ${executorError}`);
        return;
      }

      List.AllInfos(dirPath, executor).then(infos => {
        resolve(infos.filter(item => item.name.startsWith('.')));
      }).catch(error => `Failed to get all hidden infos: ${error}`);
    });
  }

  static ParseLsString(string) {
    let error = Error.LsStringError(string);
    if (error)
      return ({ info: null, error: `Failed to parse ls string: ${error}` });

    if (!List.LsStringIsFormattedCorrectly(string))
      return ({ info: null, error: `Ls string is not formatted correctly. Format is: <permString> <hardlinks> <user> <group> <size> <month> <day> <'HH:MM'|year> <filename>` });

    // PERMS
    let permStr = '';
    let startIndex = 0;
    let endIndex = 0;

    for (let i = startIndex; i < string.length; ++i) {
      let currChar = string.charAt(i);
      if (currChar.trim())
        endIndex = i;
      else {
        endIndex += 1;
        permStr = string.substring(startIndex, endIndex);

        currChar = string.charAt(endIndex);
        while (!currChar.trim()) {
          endIndex += 1;
          currChar = string.charAt(endIndex);
        }

        startIndex = endIndex;
        break;
      }
    }

    // HARD LINKS
    let hLinksStr = '';
    for (let i = startIndex; i < string.length; ++i) {
      let currChar = string.charAt(i);
      if (currChar.trim())
        endIndex = i;
      else {
        endIndex += 1;
        hLinksStr = string.substring(startIndex, endIndex);

        currChar = string.charAt(endIndex);
        while (!currChar.trim()) {
          endIndex += 1;
          currChar = string.charAt(endIndex);
        }

        startIndex = endIndex;
        break;
      }
    }

    // OWNER
    let ownerStr = '';
    for (let i = startIndex; i < string.length; ++i) {
      let currChar = string.charAt(i);
      if (currChar.trim())
        endIndex = i;
      else {
        endIndex += 1;
        ownerStr = string.substring(startIndex, endIndex);

        currChar = string.charAt(endIndex);
        while (!currChar.trim()) {
          endIndex += 1;
          currChar = string.charAt(endIndex);
        }

        startIndex = endIndex;
        break;
      }
    }

    // GROUP
    let groupStr = '';
    for (let i = startIndex; i < string.length; ++i) {
      let currChar = string.charAt(i);
      if (currChar.trim())
        endIndex = i;
      else {
        endIndex += 1;
        groupStr = string.substring(startIndex, endIndex);

        currChar = string.charAt(endIndex);
        while (!currChar.trim()) {
          endIndex += 1;
          currChar = string.charAt(endIndex);
        }

        startIndex = endIndex;
        break;
      }
    }

    // SIZE
    let sizeStr = '';
    for (let i = startIndex; i < string.length; ++i) {
      let currChar = string.charAt(i);
      if (currChar.trim())
        endIndex = i;
      else {
        endIndex += 1;
        sizeStr = string.substring(startIndex, endIndex);

        currChar = string.charAt(endIndex);
        while (!currChar.trim()) {
          endIndex += 1;
          currChar = string.charAt(endIndex);
        }

        startIndex = endIndex;
        break;
      }
    }

    // MODIFIED TIME

    // Month
    let monthStr = '';
    for (let i = startIndex; i < string.length; ++i) {
      let currChar = string.charAt(i);
      if (currChar.trim())
        endIndex = i;
      else {
        endIndex += 1;
        monthStr = string.substring(startIndex, endIndex);

        currChar = string.charAt(endIndex);
        while (!currChar.trim()) {
          endIndex += 1;
          currChar = string.charAt(endIndex);
        }

        startIndex = endIndex;
        break;
      }
    }

    // Day
    let dayStr = '';
    for (let i = startIndex; i < string.length; ++i) {
      let currChar = string.charAt(i);
      if (currChar.trim())
        endIndex = i;
      else {
        endIndex += 1;
        dayStr = string.substring(startIndex, endIndex);

        currChar = string.charAt(endIndex);
        while (!currChar.trim()) {
          endIndex += 1;
          currChar = string.charAt(endIndex);
        }

        startIndex = endIndex;
        break;
      }
    }

    // Stamp
    let stampStr = '';
    for (let i = startIndex; i < string.length; ++i) {
      let currChar = string.charAt(i);
      if (currChar.trim())
        endIndex = i;
      else {
        endIndex += 1;
        stampStr = string.substring(startIndex, endIndex);

        currChar = string.charAt(endIndex);
        while (!currChar.trim()) {
          endIndex += 1;
          currChar = string.charAt(endIndex);
        }

        startIndex = endIndex;
        break;
      }
    }

    let modStr = `${monthStr} ${dayStr} ${stampStr}`;

    // FILENAME
    let nameStr = string.substring(startIndex);

    // ITEM
    let info = {
      permstr: permStr.substring(1),
      hardlinks: parseInt(hLinksStr),
      owner: ownerStr,
      group: groupStr,
      size: parseInt(sizeStr),
      modtime: modStr,
      name: nameStr,
      filetype: permStr.charAt(0)
    };
    return { info: info, error: null };
  }

  static LsStringIsFormattedCorrectly(s) {
    /* Check if it has 7 parts: 
         1) permissions string
         2) hard links count
         3) owner
         4) group
         5) size
         6) date
         7) filename 
    */

    let expectedTotal = 7;
    let parts = [];

    let expectedCount = 5;
    let actualCount = 0;

    let startIndex = 0;
    let endIndex = 0;
    let spaceDelimitedStrings = 5;

    // Check permissions string, hard links, user, group, and size
    for (let i = 0; i < spaceDelimitedStrings; ++i) {
      for (let j = startIndex; j < s.length; ++j) {
        let currChar = s.charAt(j);
        if (currChar.trim())
          endIndex = j;
        else {
          endIndex += 1;
          parts.push(s.substring(startIndex, endIndex));

          currChar = s.charAt(endIndex);
          while (!currChar.trim()) {
            endIndex += 1;
            currChar = s.charAt(endIndex);
          }

          startIndex = endIndex;
          break;
        }
      }
    }

    if (parts.length < expectedCount)
      return false;

    // Check date string
    let dateParts = [];

    for (let i = 0; i < expectedCount; ++i) {
      for (let j = startIndex; j < s.length; ++j) {
        let currChar = s.charAt(j);
        if (currChar.trim())
          endIndex = j;
        else {
          endIndex += 1;
          dateParts.push(s.substring(startIndex, endIndex));
          currChar = s.charAt(endIndex);
          while (!currChar.trim()) {
            endIndex += 1;
            currChar = s.charAt(endIndex);
          }

          startIndex = endIndex;
          break;
        }
      }
    }

    if (dateParts.length != 3)
      return false

    parts.push(dateParts.join(' '));

    // Check filepath
    let substr = s.substring(startIndex);
    if (!s.substring(startIndex))
      return false

    parts.push(s.substring(startIndex));
    return parts.length == expectedTotal;
  }
}

//----------------------------------------
// ERROR

class Error {
  static LsStringError(s) {
    // Check if undefined
    let error = ERROR.StringValidator(s);
    if (error)
      return `Ls string is ${error}`;
    return null;
  }
}

//-------------------------------
// EXPORTS

exports.List = List;