let PATH = require('path');
let FS = require('fs-extra');

//-----------------------------------
// PATH
class Path {
  static Exists(path) {
    return new Promise((resolve, reject) => {
      let error = Error.PathError(path);
      if (error) {
        reject(`Path is ${error}`);
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
      Path.Exists(path).then(results => {
        if (results.error) {
          reject(results.error);
          return;
        }

        if (!results.exists) {
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
      Path.Exists(path).then(results => {
        if (results.error) {
          reject(results.error);
          return;
        }

        if (!results.exists) {
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
      return { name: null, error: `Path is ${error}` };
    return { name: PATH.basename(path), error: null };
  }

  static Extension(path) {
    let error = Error.PathError(path);
    if (error)
      return { extension: null, error: `Path is ${error}` };
    return { extension: PATH.extname(path), error: null };
  }

  static ParentDirName(path) {
    let error = Error.PathError(path);
    if (error)
      return { name: null, error: `Path is ${error}` };
    return { name: PATH.dirname(path).split(PATH.sep).pop(), error: null };
  }

  static ParentDir(path) {
    let error = Error.PathError(path);
    if (error)
      return { dir: null, error: `Path is ${error}` };
    return { dir: PATH.dirname(path), error: null }; // Full path to parent dir
  }

  static Escape(path) {
    let error = Error.NullOrUndefined(path);
    if (error)
      return { string: null, error: `Path is ${error}` };
    return { string: escape(path), error: null };
  }

  static ContainsWhitespace(path) {
    let error = Error.NullOrUndefined(path);
    if (error)
      return { hasWhitespace: null, error: `Path is ${error}` };
    return { hasWhitespace: path.includes(' '), error: null };
  }
}

//---------------------------------
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

  static PathError(p) {
    let error = Error.NullOrUndefined(p);
    if (error)
      return error;

    if (typeof p != 'string')
      return 'not a string';
    else if (p == '')
      return 'empty';
    else if (p.trim() == '')
      return 'whitespace'
    else
      return null;
  }
}

//------------------------------------
// EXPORTS

exports.Path = Path;
exports.Error = Error;