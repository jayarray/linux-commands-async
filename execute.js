var CHILD_PROCESS = require('child_process');

//---------------------------------------------
// SAVING DATA (to string)

class SavedData {
  constructor(thing) {
    this.value = '';
    thing.on('data', this.Callback_.bind(this));
  }

  Callback_(data) {
    this.value += data.toString();
  }
}

//---------------------------------------------
// EXECUTE
class Execute {
  static Local(cmd, args) {
    return new Promise((resolve, reject) => {
      let error = Error.StringError(cmd);
      if (error) {
        reject(`cmd is ${error}`);
        return;
      }

      error = Error.ArgsError(args);
      if (error) {
        reject(`args is ${error}`);
        return;
      }

      let childProcess = CHILD_PROCESS.spawn(cmd.trim(), args);
      let errors = new SavedData(childProcess.stderr);
      let outputs = new SavedData(childProcess.stdout);

      childProcess.on('close', exitCode => {
        resolve({
          stderr: errors.value,
          stdout: outputs.value,
          exitCode: exitCode,
        });
      });
    });
  }

  static Remote(user, host, cmd) {
    return new Promise((resolve, reject) => {
      let error = Error.StringError(user);
      if (error) {
        reject(`user is ${error}`);
        return;
      }

      error = Error.StringError(host);
      if (error) {
        reject(`host is ${error}`);
        return;
      }

      error = Error.StringError(cmd);
      if (error) {
        reject(`cmd is ${error}`);
        return;
      }

      let args = [`${user.trim()}@${host.trim()}`, `${cmd.trim()}`];
      let childProcess = CHILD_PROCESS.spawn('ssh', args);
      let errors = new SavedData(childProcess.stderr);
      let outputs = new SavedData(childProcess.stdout);

      childProcess.on('close', exitCode => {
        resolve({
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
    else if (o == null)
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
    return null;
  }
}

//----------------------------------
// EXPORTS

exports.Execute = Execute;
exports.Error = Error;