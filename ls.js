let PATH = require('./path.js');
let EXECUTE = require('./execute.js').Execute;
let FS = require('fs-extra')
//---------------------------------------------
// Ls
class Ls {
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
          resolve(files);
        });
      }).catch(reject);
    });
  }

  static VisibleFilenames(path) {
    return new Promise((resolve, reject) => {
      Ls.AllFilenames(path).then(files => {
        resolve(files.filter(x => !x.startsWith('.')));
      }).catch(reject);
    });
  }

  static HiddenFilenames(path) {
    return new Promise((resolve, reject) => {
      Ls.AllFilenames(path).then(files => {
        resolve(files.filter(x => x.startsWith('.')));
      }).catch(reject);
    });
  }

  static Info(path) {
    return new Promise((resolve, reject) => {
      Ls.FileInfo(path).then(fileInfo => {
        resolve(fileInfo);
      }).catch((ferr) => {
        Ls.DirInfo(path).then(dirInfo => {
          resolve(dirInfo);
        }).catch((derr) => {
          let errArr = [];
          if (ferr.error)
            errArr.push(ferr.error);
          if (ferr.error)
            errArr.push(derr.error);
          reject({ type: null, error: `Failed to get info: ${errArr.join('; ')}` });
        });
      });
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

          let results = Ls.ParseLsString(output.stdout.trim());
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

          let results = Ls.ParseLsString(output.stdout.trim());
          if (results.error) {
            reject(results.error);
            return;
          }
          resolve(results.info);
        }).catch(reject);
      }).catch(reject);
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
            let results = Ls.ParseLsString(line.trim()); // CONT HERE
            infos.push(results.info);
          });
          resolve(infos);
        }).catch(reject);
      }).catch(reject);
    });
  }

  static VisibleInfos(dirPath) {
    return new Promise((resolve, reject) => {
      Ls.AllInfos(dirPath).then(infos => {
        resolve(infos.filter(item => !item.name.startsWith('.')));
      }).catch(reject);
    });
  }

  static HiddenInfos(dirPath) {
    return new Promise((resolve, reject) => {
      Ls.AllInfos(dirPath).then(infos => {
        resolve(infos.filter(item => item.name.startsWith('.')));
      }).catch(reject);
    });
  }

  static ParseLsString(string) {
    let error = Error.LsStringError(string);
    if (error)
      return ({ info: null, error: `Failed to parse ls string: ${error}` });

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
}

//----------------------------------------
// ERROR

class Error {
  static NullOrUndefined(o) {
    if (o === undefined)
      return 'undefined';
    else if (o == null)
      return 'null';
    else
      return null;
  }

  static LsStringError(s) {
    // Check if undefined
    let error = Error.NullOrUndefined(s);
    if (error)
      return `Ls string is ${error}`;

    // Check if string and non-empty
    if (typeof s != 'string')
      return 'Ls string is not a string';
    else if (s == '')
      return 'Ls string is empty';
    else if (s.trim() == '')
      return 'Ls string is whitespace';
    else if (!Error.LsStringIsFormattedCorrectly(s))
      return `Ls string is not formatted correctly`
    else
      return null;
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

    let expectedCount = 5;
    let actualCount = 0;

    let startIndex = 0;
    let endIndex = 0;
    let spaceDelimitedStrings = 5;

    // Check permissions string
    for (let i = 0; i < spaceDelimitedStrings; ++i) {
      for (let j = startIndex; j < s.length; ++j) {
        let currChar = s.charAt(j);
        if (currChar.trim())
          endIndex = j;
        else {
          endIndex += 1;
          currChar = s.charAt(endIndex);
          while (!currChar.trim()) {
            endIndex += 1;
            currChar = s.charAt(endIndex);
          }

          startIndex = endIndex;
          break;
        }
      }
      actualCount += 1;
    }

    if (actualCount < expectedCount)
      return false;

    // Check date string
    expectedCount = 3;
    actualCount = 0;

    for (let i = 0; i < expectedCount; ++i) {
      for (let j = startIndex; j < s.length; ++j) {
        let currChar = s.charAt(j);
        if (currChar.trim())
          endIndex = j;
        else {
          endIndex += 1;
          currChar = s.charAt(endIndex);
          while (!currChar.trim()) {
            endIndex += 1;
            currChar = s.charAt(endIndex);
          }

          startIndex = endIndex;
          break;
        }
      }
      actualCount += 1;
    }

    if (actualCount != expectedCount)
      return false

    // Check filepath
    let substr = s.substring(startIndex);
    if (!s.substring(startIndex))
      return false
    return true;
  }
}

//-------------------------------
// EXPORTS

exports.Ls = Ls;
exports.Error = Error;