let PATH = require('./path.js');
let EXECUTE = require('./execute.js').Execute;
let ERROR = require('./error.js').Error;
let FS = require('fs-extra');

//---------------------------------------------
// List (ls)
class List {
  static AllFilenames(path) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(path);
      if (error) {
        reject(error);
        return;
      }

      PATH.Path.Exists(path).then(exists => {
        if (!exists) {
          reject(`Path does not exist: ${path}`);
          return;
        }

        FS.readdir(path, (err, files) => {
          if (err) {
            reject(`Failed to read filenames: ${err}`);
            return;
          }
          resolve(filenames);
        });
      }).catch(reject);
    });
  }

  static VisibleFilenames(path) {
    return new Promise((resolve, reject) => {
      List.AllFilenames(path).then(filenames => {
        resolve(filenames.filter(x => !x.startsWith('.')));
      }).catch(reject);
    });
  }

  static HiddenFilenames(path) {
    return new Promise((resolve, reject) => {
      List.AllFilenames(path).then(filenames => {
        resolve(filenames.filter(x => x.startsWith('.')));
      }).catch(reject);
    });
  }

  static FileInfo(filepath) {
    return new Promise((resolve, reject) => {
      PATH.Path.IsFile(filepath).then(isFile => {
        if (!isFile) {
          reject(`Path is not a file: ${filepath}`);
          return;
        }

        let args = ['-l', filepath];
        EXECUTE.Local('ls', args).then(output => {
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
        }).catch(reject);
      }).catch(reject);
    });
  }

  static DirInfo(dirPath) {
    return new Promise((resolve, reject) => {
      PATH.Path.IsDir(dirPath).then(isDir => {
        if (!isDir) {
          reject(`Path is not a directory: ${dirPath}`);
          return;
        }

        let args = ['-ld', dirPath];
        EXECUTE.Local('ls', args).then(output => {
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
        }).catch(reject);
      }).catch(reject);
    });
  }

  static Info(path) {
    return new Promise((resolve, reject) => {
      List.FileInfo(path).then(fileInfo => {
        resolve(fileInfo);
      }).catch((ferr) => {
        List.DirInfo(path).then(dirInfo => {
          resolve(dirInfo);
        }).catch((derr) => {
          let errArr = [];
          if (ferr.error)
            errArr.push(ferr.error);
          if (ferr.error)
            errArr.push(derr.error);
          reject(`Failed to get info: ${errArr.join('; ')}`);
        });
      });
    });
  }

  static AllInfos(dirPath) {
    return new Promise((resolve, reject) => {
      PATH.Path.IsDir(dirPath).then(isDir => {
        if (!isDir) {
          reject(`Path is not a directory: ${dirPath}`);
          return;
        }

        let args = ['-la', dirPath];
        EXECUTE.Local('ls', args).then(output => {
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
        }).catch(reject);
      }).catch(reject);
    });
  }

  static VisibleInfos(dirPath) {
    return new Promise((resolve, reject) => {
      List.AllInfos(dirPath).then(infos => {
        resolve(infos.filter(item => !item.name.startsWith('.')));
      }).catch(reject);
    });
  }

  static HiddenInfos(dirPath) {
    return new Promise((resolve, reject) => {
      List.AllInfos(dirPath).then(infos => {
        resolve(infos.filter(item => item.name.startsWith('.')));
      }).catch(reject);
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
    let error = ERROR.StringError(s);
    if (error)
      return `Ls string is ${error}`;
    return null;
  }
}

//-------------------------------
// EXPORTS

exports.List = List;