let PATH = require('./path.js');
let ERROR = require('./error.js').Error;
let REMOVE = require('./remove.js').Remove;
let CHMOD = require('./chmod.js').Chmod;
let FS = require('fs-extra');

//---------------------------------------------------
// FILE
class File {
  static Remove(path) {
    return REMOVE.File(path);
  }

  static Create(path, text) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(path);
      if (error) {
        reject(error);
        return;
      }

      error = ERROR.StringError(text);
      if (error) {
        reject(`Text is ${error}`);
        return;
      }

      FS.writeFile(path, text, (err) => {
        if (err) {
          reject(`Failed to write file: ${err}`);
          return;
        }
        resolve(true)
      });
    });
  }

  static MakeExecutable(path) {
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

        PATH.Path.IsFile(path).then(isFile => {
          if (!isFile) {
            reject(`Path is not a file: ${path}`);
            return;
          }

          CHMOD.AddPermissions('ugo', 'x', path).then(success => {
            resolve(true);
          }).catch(reject);
        }).catch(reject);
      }).catch(reject);
    });
  }

  static Read(path) {
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

        PATH.Path.IsFile(path).then(isFile => {
          if (!isFile) {
            reject(`Path is not a file: ${path}`);
            return;
          }

          FS.readFile(path, (err, data) => {
            if (err) {
              reject(`Failed to read file: ${err}`);
              return;
            }
            resolve(data.toString());
          });
        }).catch(reject);
      }).catch(reject);
    });
  }

  static ReadLines(path) {
    return new Promise((resolve, reject) => {
      File.Read(path).then(data => {
        resolve(data.split('\n'));
      }).catch(reject);
    });
  }
}

//--------------------------------
// TEST

let p = '/home/isa/nodejs-packages/filesystem-async/delete_this_test_file.txt';

File.MakeExecutable(p).then(success => {
  console.log(`SUCCESS: ${success}`);
}).catch(error => {
  console.log(`ERROR: ${error}`);
});

//-------------------------------
// EXPORTS

exports.File = File;