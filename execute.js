var CHILD_PROCESS = require('child_process');
let ERROR = require('./error.js').Error;

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
      let error = ERROR.StringError(cmd);
      if (error) {
        reject(`cmd is ${error}`);
        return;
      }

      error = ERROR.ArrayError(args);
      if (error) {
        reject(`args is ${error}`);
        return;
      }

      let childProcess = CHILD_PROCESS.spawn(cmd, args);
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
      let error = ERROR.StringError(user);
      if (error) {
        reject(`user is ${error}`);
        return;
      }

      error = ERROR.StringError(host);
      if (error) {
        reject(`host is ${error}`);
        return;
      }

      error = ERROR.StringError(cmd);
      if (error) {
        reject(`cmd is ${error}`);
        return;
      }

      let args = [`${user}@${host}`, `${cmd}`];
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

//----------------------------------
// EXPORTS

exports.Execute = Execute;