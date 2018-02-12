let PATH = require('path');
let FS = require('fs-extra');
let ERROR = require('./error.js').Error;

//-----------------------------------
// PATH
class Path {
  static Exists(path) {
    return new Promise((resolve, reject) => {
      let error = Error.PathError(path);
      if (error) {
        reject(error);
        return;
      }

      FS.access(path, FS.F_OK, (err) => {
        if (err)
          resolve(false);
        else
          resolve(true);
      });
    });
  }

  static IsFile(path) {
    return new Promise((resolve, reject) => {
      Path.Exists(path).then(exists => {
        if (!exists) {
          reject(`Path does not exist: ${path}`);
          return;
        }

        FS.lstat(path, (err, stats) => {
          if (err)
            reject(err);
          else
            resolve(stats.isFile() && !stats.isDirectory());
        });
      }).catch(reject);
    });
  }

  static IsDir(path) {
    return new Promise((resolve, reject) => {
      Path.Exists(path).then(exists => {
        if (!exists) {
          reject(`Path does not exist: ${path}`);
          return;
        }

        FS.lstat(path, (err, stats) => {
          if (err)
            reject(err);
          else
            resolve(stats.isDirectory());
        });
      }).catch(reject);
    });
  }

  static Filename(path) {
    let error = Error.PathError(path);
    if (error)
      return { name: null, error: error };
    return { name: PATH.basename(path), error: null };
  }

  static Extension(path) {
    let error = Error.PathError(path);
    if (error)
      return { extension: null, error: error };
    return { extension: PATH.extname(path), error: null };
  }

  static ParentDirName(path) {
    let error = Error.PathError(path);
    if (error)
      return { name: null, error: error };
    return { name: PATH.dirname(path).split(PATH.sep).pop(), error: null };
  }

  static ParentDir(path) {
    let error = Error.PathError(path);
    if (error)
      return { dir: null, error: error };
    return { dir: PATH.dirname(path), error: null }; // Full path to parent dir
  }

  static Escape(path) {
    let error = ERROR.NullOrUndefined(path);
    if (error)
      return { string: null, error: `Path is ${error}` };
    return { string: escape(path), error: null };
  }

  static ContainsWhitespace(path) {
    let error = ERROR.NullOrUndefined(path);
    if (error)
      return { hasWhitespace: null, error: `Path is ${error}` };
    return { hasWhitespace: path.includes(' '), error: null };
  }
}

//---------------------------------
// ERROR

class Error {
  static PathError(p) {
    let error = ERROR.StringError(p);
    if (error)
      return `Path is ${error}`;
    return null;
  }
}

//------------------------------------
// EXPORTS

exports.Path = Path;
exports.Error = Error;