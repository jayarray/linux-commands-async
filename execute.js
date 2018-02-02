var CHILD_PROCESS = require('child_process');

//---------------------------------------------
// SAVING DATA (to string)

class SavedData {
  constructor(thing) {
    this.value = '';
    thing.on('data', this.callback_.bind(this));
  }

  callback_(data) {
    this.value += data.toString();
  }
}

//---------------------------------------------
// EXECUTE

class Execute {
  static local(cmd, args) {
    return new Promise((resolve, reject) => {
      let error = Error.StringError(cmd);
      if (error) {
        reject({
          error: `cmd is ${error}`,
          stderr: null,
          stdout: null,
          exitCode: null,
        });
        return;
      }

      error = Error.ArgsError(args);
      if (error) {
        reject({
          error: `args is ${error}`,
          stderr: null,
          stdout: null,
          exitCode: null,
        });
        return;
      }

      let childProcess = CHILD_PROCESS.spawn(cmd.trim(), args);
      let errors = new SavedData(childProcess.stderr);
      let outputs = new SavedData(childProcess.stdout);

      childProcess.on('close', exitCode => {
        resolve({
          error: null,
          stderr: errors.value,
          stdout: outputs.value,
          exitCode: exitCode,
        });
      });
    });
  }

  static remote(user, host, cmd) {
    return new Promise((resolve, reject) => {
      let error = Error.StringError(user);
      if (error) {
        reject({
          error: `user is ${error}`,
          stderr: null,
          stdout: null,
          exitCode: null,
        });
        return;
      }

      error = Error.StringError(host);
      if (error) {
        reject({
          error: `host is ${error}`,
          stderr: null,
          stdout: null,
          exitCode: null,
        });
        return;
      }

      error = Error.StringError(cmd);
      if (error) {
        reject({
          error: `cmd is ${error}`,
          stderr: null,
          stdout: null,
          exitCode: null,
        });
        return;
      }

      let args = [`${user.trim()}@${host.trim()}`, `${cmd.trim()}`];
      let childProcess = CHILD_PROCESS.spawn('ssh', args);
      let errors = new SavedData(childProcess.stderr);
      let outputs = new SavedData(childProcess.stdout);

      childProcess.on('close', exitCode => {
        resolve({
          error: null,
          stderr: errors.value,
          stdout: outputs.value,
          exitCode: exitCode,
        });
      });
    });
  }
}

//---------------------------------------
// ERROR

class Error {
  static NullOrUndefined(o) {
    if (o === undefined)
      return 'undefined';
    else if (0 == null)
      return 'null';
    else
      return null;
  }

  static StringError(s) {
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

  static ArgsError(args) {
    let error = Error.NullOrUndefined(args);
    if (error)
      return error;

    if (!Array.isArray(args))
      return 'not an array';
  }
}

//----------------------------------
// EXPORTS

exports.Execute = Execute;
exports.Error = Error;



/*
NOTES:

1) Test if spawn(cmd, args) works when args = (null | undefined | [])
*/