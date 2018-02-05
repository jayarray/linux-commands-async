
let FS = require('fs-extra');

//-----------------------------------
// PATH

class Path {
  static Exists(path) {
    return new Promise((resolve, reject) => {
      let error = Error.PathError(path);
      if (error) {
        reject({ exists: null, error: `Path is ${error}` });
        return;
      }

      FS.access(path, FS.F_OK, (err) => {
        if (err)
          resolve({ exists: false, error: null });
        else
          resolve({ exists: true, error: null });
      });
    });
  }

  static IsFile(path) {
    return new Promise((resolve, reject) => {
      Path.Exists(path).then(results => {
        if (results.error) {
          reject({ isFile: null, error: results.error });
          return;
        }

        if (!results.exists) {
          reject({ isFile: null, error: `Path does not exist: ${path}` });
          return;
        }

        FS.lstat(path, (err, stats) => {
          if (err)
            reject({ isFile: null, error: err });
          else
            resolve({ isFile: stats.isFile() && !stats.isDirectory(), error: null });
        });
      }).catch(fatalFail);
    });
  }

  static IsDir(path) {
    return new Promise((resolve, reject) => {
      Path.Exists(path).then(results => {
        if (results.error) {
          reject({ isDir: null, error: results.error });
          return;
        }

        if (!results.exists) {
          reject({ isDir: null, error: `Path does not exist: ${path}` });
          return;
        }

        FS.lstat(path, (err, stats) => {
          if (err)
            reject({ isDir: null, error: err });
          else
            resolve({ isDir: stats.isDirectory(), error: null });
        });
      }).catch(fatalFail);
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

  static PathError(s) {
    let error = Error.NullOrUndefined(s);
    if (error)
      return error;

    if (typeof s != 'string')
      return 'not a string';
    else if (s == '')
      return 'empty';
    else if (s.trim() == '')
      return 'whitespace'
    else
      return null;
  }
}