let PATH = require('./path.js').Path;
let ERROR = require('./error.js');
let ADMIN = require('./admin.js').Admin;
let USERINFO = require('./userinfo.js').UserInfo;
let LINUX_COMMANDS = require('./linuxcommands.js');
let COMMAND = require('./command.js').Command;

//-----------------------------------------------
// CHOWN
class Chown {
  static ChangeOwner(path, newOwnerId, isRecursive, executor) { // newOwner can be string or integer
    return new Promise((resolve, reject) => {
      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to change owner: Connection is ${executorError}`);
        return;
      }

      let idError = Error.newIdValidator(newOwnerId);
      if (idError) {
        reject(`Failed to change owner: new owner id ${idError}`);
        return;
      }

      PATH.Exists(path, executor).then(exists => {
        if (!exists) {
          reject(`Failed to change owner: path does not exist: ${path}`);
          return;
        }

        let cmd = LINUX_COMMANDS.ChownChangeOwner(path, newOwnerId, isRecursive);
        COMMAND.Execute(cmd, [], executor).then(output => {
          if (output.stderr) {
            reject(`Failed to change owner: ${output.stderr}`);
            return;
          }
          resolve(true);
        }).catch(error => `Failed to change owner: ${error}`);
      }).catch(error => `Failed to change owner: ${error}`);
    });
  }

  static ChangeGroup(path, newGroupId, isRecursive, executor) { // newOwner can be string or integer
    return new Promise((resolve, reject) => {
      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to change group: Connection is ${executorError}`);
        return;
      }

      let idError = Error.newIdValidator(newGroupId);
      if (idError) {
        reject(`Failed to change group: new group id ${idError}`);
        return;
      }

      PATH.Exists(path, executor).then(exists => {
        if (!exists) {
          reject(`Failed to change group: path does not exist: ${path}`);
          return;
        }

        let cmd = LINUX_COMMANDS.ChownChangeGroup(path, newGroupId, isRecursive);
        COMMAND.Execute(cmd, [], executor).then(output => {
          if (output.stderr) {
            reject(`Failed to change group: ${output.stderr}`);
            return;
          }
          resolve(true);
        }).catch(error => `Failed to change group: ${error}`);
      }).catch(error => `Failed to change group: ${error}`);
    });
  }

  static ChangeOwnerAndGroup(path, newOwnerId, newGroupId, isRecursive, executor) { // newOwner can be string or integer
    return new Promise((resolve, reject) => {
      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to change owner and group: Connection is ${executorError}`);
        return;
      }

      let idError = Error.newIdValidator(newOwnerId);
      if (idError) {
        reject(`Failed to change owner and group: new owner id ${idError}`);
        return;
      }

      idError = Error.newIdValidator(newGroupId);
      if (idError) {
        reject(`Failed to change owner and group: new group id ${idError}`);
        return;
      }

      PATH.Exists(path, executor).then(exists => {
        if (!exists) {
          reject(`Failed to change owner and group: path does not exist: ${path}`);
          return;
        }

        let cmd = LINUX_COMMANDS.ChownChangeOwnerAndGroup(path, newOwnerId, newGroupId, isRecursive);
        COMMAND.Execute(cmd, [], executor).then(output => {
          if (output.stderr) {
            reject(`Failed to change owner and group: ${output.stderr}`);
            return;
          }
          resolve(true);
        }).catch(error => `Failed to change owner and group: ${error}`);
      }).catch(error => `Failed to change owner and group: ${error}`);
    });
  }
}

//-----------------------------------
// ERROR

class Error {
  static newIdValidator(id) {
    let error = ERROR.NullOrUndefined(id);
    if (error)
      return `is ${error}`;

    if (typeof id != 'string' && !Number.isInteger(id))
      return `must be a string or integer`;

    return null;
  }
}

//-----------------------------------
// EXPORTS

exports.Chown = Chown;
