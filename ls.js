let PATH = require('./path.js');

//---------------------------------------------
// LIST (ls)

class List {
  static all_files(path) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(path);
      if (error) {
        reject({ files: null, error: `PATH_ERROR: ${error}` });
        return;
      }

      let pTrimmed = path.trim();
      Path.exists(pTrimmed).then(results => {
        if (results.error) {
          reject({ files: null, error: `PATH_ERROR: ${results.error}` });
          return;
        }

        if (!results.exists) {
          reject({ files: null, error: `PATH_ERROR: Path does not exist: ${pTrimmed}` });
          return;
        }

        FS.readdir(pTrimmed, (err, files) => {
          if (err) {
            reject({ files: null, error: `FS_READDIR_ERROR: ${err}` });
            return;
          }
          resolve({ files: files, error: null });
        });
      }).catch(fatalFail);
    });
  }

  static visible_files(path) {
    return new Promise((resolve, reject) => {
      List.all_files(path).then(results => {
        if (results.error) {
          reject({ files: null, error: results.error });
          return;
        }
        resolve({ files: results.files.filter(x => !x.startsWith('.')), error: null });
      }).catch(fatalFail);
    });
  }

  static hidden_files(path) {
    return new Promise((resolve, reject) => {
      List.all_files(path).then(results => {
        if (results.error) {
          reject({ files: null, error: results.error });
          return;
        }
        resolve({ files: results.files.filterfilter(x => x.startsWith('.')), error: null });
      }).catch(fatalFail);
    });
  }

  static item(path) {
    return new Promise((resolve, reject) => {
      List.file_item(path).then(results => {
        resolve({ item: results.item, error: null });
      }).catch((ferr) => {
        List.dir_item(path).then(values => {
          resolve({ item: values.item, error: null });
        }).catch((derr) => {
          let errArr = [];
          if (ferr.error)
            errArr.push(ferr.error);
          if (ferr.error)
            errArr.push(derr.error);
          reject({ type: null, error: `ITEM_ERROR: ${errArr.join('; ')}` });
        });
      });
    });
  }

  static file_item(filepath) {
    return new Promise((resolve, reject) => {
      Path.is_file(dirPath).then(results => {
        if (results.error) {
          reject({ item: null, error: results.error });
          return;
        }

        let fTrimmed = filepath.trim();
        if (!results.isFile) {
          reject({ item: null, error: `PATH_ERROR: Path is not a file: ${fTrimmed}` });
          return;
        }

        let args = ['-l', fTrimmed];
        Execute.local('ls', args).then(output => {
          if (output.error) {
            reject({ item: null, error: `LS_FILE_ERROR: ${output.error}` });
            return;
          }

          if (output.stderr) {
            reject({ item: null, error: `LS_FILE_ERROR: ${output.stderr}` });
            return;
          }

          let i = List.parse_ls_string(output.stdout.trim());
          if (i.error) {
            reject({ item: null, error: i.error });
            return;
          }

          resolve({ item: i.item, error: null });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }

  static dir_item(dirPath) {
    return new Promise((resolve, reject) => {
      Path.is_dir(dirPath).then(results => {
        if (results.error) {
          reject({ item: null, error: results.error });
          return;
        }

        let dTrimmed = dirPath.trim();
        if (!results.isDir) {
          reject({ item: null, error: `PATH_ERROR: Path is not a directory: ${dTrimmed}` });
          return;
        }

        let args = ['-ld', dTrimmed];
        Execute.local('ls', args).then(output => {
          if (output.error) {
            reject({ item: null, error: `LS_DIR_ERROR: ${output.error}` });
            return;
          }

          if (output.stderr) {
            reject({ item: null, error: `LS_DIR_ERROR: ${output.stderr}` });
            return;
          }

          let i = List.parse_ls_string(output.stdout.trim());
          if (i.error) {
            reject({ item: null, error: i.error });
            return;
          }

          resolve({ item: i.item, error: null });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }

  static all_items(dirPath) {
    return new Promise((resolve, reject) => {
      Path.is_dir(dirPath).then(results => {
        if (results.error) {
          reject({ items: null, error: results.error });
          return;
        }

        let dTrimmed = dirPath.trim();
        if (!results.isDir) {
          reject({ items: null, error: `PATH_ERROR: Path is not a directory: ${dTrimmed}` });
          return;
        }

        let args = ['-la', dTrimmed];
        Execute.local('ls', args).then(output => {
          if (output.error) {
            reject({ items: null, error: `LS_LA_ERROR: ${output.error}` });
            return;
          }

          if (output.stderr) {
            reject({ items: null, error: `LS_LA_ERROR: ${output.stderr}` });
            return;
          }

          let lines = output.stdout.trim().split('\n').map(line => line.trim());
          if (lines.length < 2) {
            resolve({ items: [], error: null });
            return;
          }

          let items = [];
          lines.slice(1).forEach(line => {
            let i = List.parse_ls_string(line.trim());
            items.push(i.item);
          });
          resolve({ items: items, error: null });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }

  static visible_items(dirPath) {
    return new Promise((resolve, reject) => {
      List.all_items(dirPath).then(results => {
        if (results.error) {
          resolve({ items: null, error: results.error });
          return;
        }
        resolve({ items: results.items.filter(item => !item.name.startsWith('.')), error: null });
      }).catch(fatalFail);
    });
  }

  static hidden_items(dirPath) {
    return new Promise((resolve, reject) => {
      List.all_items(dirPath).then(results => {
        if (results.error) {
          resolve({ items: null, error: results.error });
          return;
        }
        resolve({ items: results.items.filter(item => item.name.startsWith('.')), error: null });
      }).catch(fatalFail);
    });
  }

  static parse_ls_string(string) {
    let invalidType = invalid_type(string);
    if (invalidType)
      return { item: null, error: `LS_STR_ERROR: Item string is ${invalidType}` };

    let outputStr = output.stdout.trim();

    // PERMS
    let permStr = '';
    let startIndex = 0;
    let endIndex = 0;

    let indexes = { start: 0, end: null };
    for (let i = indexes.start; i < outputStr.length; ++i) {
      let currChar = outputStr.charAt(i);
      if (currChar.trim())
        indexes.end = i;
      else {
        indexes.end += 1;
        permStr = outputStr.substring(indexes.start, indexes.end);

        currChar = outputStr.charAt(indexes.end);
        while (!currChar.trim()) {
          indexes.end += 1;
          currChar = outputStr.charAt(indexes.end);
        }

        indexes.start = indexes.end + 1;
        break;
      }
    }

    // HARD LINKS
    let hLinksStr = '';
    for (let i = indexes.start; i < outputStr.length; ++i) {
      let currChar = outputStr.charAt(i);
      if (currChar.trim())
        indexes.end = i;
      else {
        indexes.end += 1;
        hLinksStr = outputStr.substring(indexes.start, indexes.end);

        currChar = outputStr.charAt(indexes.end);
        while (!currChar.trim()) {
          indexes.end += 1;
          currChar = outputStr.charAt(indexes.end);
        }

        indexes.start = indexes.end + 1;
        break;
      }
    }

    // OWNER
    let ownerStr = '';
    for (let i = indexes.start; i < outputStr.length; ++i) {
      let currChar = outputStr.charAt(i);
      if (currChar.trim())
        indexes.end = i;
      else {
        indexes.end += 1;
        ownerStr = outputStr.substring(indexes.start, indexes.end);

        currChar = outputStr.charAt(indexes.end);
        while (!currChar.trim()) {
          indexes.end += 1;
          currChar = outputStr.charAt(indexes.end);
        }

        indexes.start = indexes.end + 1;
        break;
      }
    }

    // GROUP
    let groupStr = '';
    for (let i = indexes.start; i < outputStr.length; ++i) {
      let currChar = outputStr.charAt(i);
      if (currChar.trim())
        indexes.end = i;
      else {
        indexes.end += 1;
        groupStr = outputStr.substring(indexes.start, indexes.end);

        currChar = outputStr.charAt(indexes.end);
        while (!currChar.trim()) {
          indexes.end += 1;
          currChar = outputStr.charAt(indexes.end);
        }

        indexes.start = indexes.end + 1;
        break;
      }
    }

    // SIZE
    let sizeStr = '';
    for (let i = indexes.start; i < outputStr.length; ++i) {
      let currChar = outputStr.charAt(i);
      if (currChar.trim())
        indexes.end = i;
      else {
        indexes.end += 1;
        sizeStr = outputStr.substring(indexes.start, indexes.end);

        currChar = outputStr.charAt(indexes.end);
        while (!currChar.trim()) {
          indexes.end += 1;
          currChar = outputStr.charAt(indexes.end);
        }

        indexes.start = indexes.end + 1;
        break;
      }
    }

    // MODIFIED TIME

    // Month
    let monthStr = '';
    for (let i = indexes.start; i < outputStr.length; ++i) {
      let currChar = outputStr.charAt(i);
      if (currChar.trim())
        indexes.end = i;
      else {
        indexes.end += 1;
        monthStr = outputStr.substring(indexes.start, indexes.end);

        currChar = outputStr.charAt(indexes.end);
        while (!currChar.trim()) {
          indexes.end += 1;
          currChar = outputStr.charAt(indexes.end);
        }

        indexes.start = indexes.end + 1;
        break;
      }
    }

    // Day
    let dayStr = '';
    for (let i = indexes.start; i < outputStr.length; ++i) {
      let currChar = outputStr.charAt(i);
      if (currChar.trim())
        indexes.end = i;
      else {
        indexes.end += 1;
        dayStr = outputStr.substring(indexes.start, indexes.end);

        currChar = outputStr.charAt(indexes.end);
        while (!currChar.trim()) {
          indexes.end += 1;
          currChar = outputStr.charAt(indexes.end);
        }

        indexes.start = indexes.end + 1;
        break;
      }
    }

    // Stamp
    let stampStr = '';
    for (let i = indexes.start; i < outputStr.length; ++i) {
      let currChar = outputStr.charAt(i);
      if (currChar.trim())
        indexes.end = i;
      else {
        indexes.end += 1;
        stampStr = outputStr.substring(indexes.start, indexes.end);

        currChar = outputStr.charAt(indexes.end);
        while (!currChar.trim()) {
          indexes.end += 1;
          currChar = outputStr.charAt(indexes.end);
        }

        indexes.start = indexes.end + 1;
        break;
      }
    }

    let modStr = `${monthStr} ${dayStr} ${stampStr}`;

    // FILENAME
    let nameStr = outputStr.substring(indexes.start);

    // ITEM
    let item = {
      permstr: permStr.substring(1),
      hardlinks: parseInt(hLinksStr),
      owner: ownerStr,
      group: groupStr,
      size: parseInt(sizeStr),
      modtime: modStr,
      name: nameStr,
      filetype: permStr.charAt(0)
    };
    return { item: item, error: null };
  }
}