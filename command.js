const CHILD_PROCESS = require('child_process');
const ERROR = require('./error.js');

//---------------------------------------------
// SAVING DATA (to string)

class SavedData { // Nits: make |value| private and add a get() method for encapsulation
  constructor(stream) {
    this.value_ = '';
    stream.on('data', this.Callback_.bind(this));
  }

  Callback_(data) {
    this.value_ += data.toString();
  }
}

//-----------------------------------------
// LOCAL

class LocalCommand {
  constructor() {
  }

  /**
   * @param {string} cmd 
   * @param {Array<string|number>} args 
   */
  Execute(cmd, args) {
    return new Promise((resolve, reject) => {
      let cmdError = ERROR.StringValidator(cmd);
      if (cmdError) {
        reject(`Failed to execute command: command is ${cmdError}`);
        return;
      }

      let argsError = argsValidator(args);
      if (argsError) {
        reject(`Failed to execute command: ${argsError}`);
        return;
      }

      let childProcess = null;

      if (args.length > 0)
        childProcess = childProcess = CHILD_PROCESS.spawn(cmd, args);
      else
        childProcess = CHILD_PROCESS.exec(cmd);

      let stderr = new SavedData(childProcess.stderr);
      let stdout = new SavedData(childProcess.stdout);

      childProcess.on('close', exitCode => {
        resolve({
          stderr: stderr.value_,
          stdout: stdout.value_,
          exitCode: exitCode
        });
      });
    });
  }
}

//-----------------------------------------
// REMOTE

class RemoteCommand extends LocalCommand {
  /**
  * @param {string} user 
  * @param {string} host 
  * @param {Object} options 
  */
  constructor(user, host) {
    super();
    this.user_ = user;
    this.host_ = host;
  }

  /**
  * @param {string} cmd 
  * @param {Array<string|number>} args 
  */
  Execute(cmd, args) {
    return new Promise((resolve, reject) => {
      let userError = ERROR.StringValidator(this.user_);
      if (userError) {
        reject(`Failed to execute remote command: user is ${userError}`);
        return;
      }

      let hostError = ERROR.StringValidator(this.host_);
      if (hostError) {
        reject(`Failed to execute remote command: host is ${hostError}`);
        return;
      }

      let cmdError = ERROR.StringValidator(cmd);
      let cmdIsOk = cmdError == null;

      let argsError = argsValidator(args);
      let argsAreOk = argsError == null;
      let argsAreOmitted = args !== undefined && args == null;

      let sshArgs = [`${this.user_}@${this.host_}`];

      if (cmdIsOk) {
        if (argsAreOmitted)
          sshArgs.push(cmd);
        else {
          if (argsAreOk)
            sshArgs.push(`${cmd} ${args.join(' ')}`);
          else {
            reject(`Failed to execute remote command: ${argsError}`);
            return;
          }
        }
      }
      else {
        reject(`Failed to execute remote command: command is ${cmdError}`);
        return;
      }

      LocalCommand.prototype.Execute('ssh', sshArgs).then(output => {
        resolve(output);
      }).catch(reject);
    });
  }

  static get Builder() {
    class Builder {
      constructor() {
      }

      /**
      * @param {string} user 
      */
      User(user) {
        this.user = user;
        return this;
      }

      /**
      * @param {string} host 
      */
      Host(host) {
        this.host = host;
        return this;
      }

      Build() {
        if (ERROR.StringValidator(this.user) != null || ERROR.StringValidator(this.host) != null) // User or Host are invalid
          return null;
        return new RemoteCommand(this.user, this.host);
      }
    }
    return Builder;
  }
}

//-----------------------------------
// COMMAND
class Command {
  constructor() {
  }

  /**
  * @param {LocalCommand|RemoteCommand} executor 
  * @param {string} cmd 
  * @param {Array<string|number>} args 
  */
  Execute(executor, cmd, args) {
    return new Promise((resolve, reject) => {
      let error = ERROR.NullOrUndefined(executor);
      if (error) {
        reject(`Failed to execute command: executor is ${error}`);
        return;
      }

      let executorClassName = executor.constructor.name;
      if (executorClassName != 'LocalCommand' && executorClassName != 'RemoteCommand') {
        reject(`Failed to execute command: executor is not valid`);
        return;
      }

      executor.Execute(cmd, args).then(output => {
        resolve(output);
      }).catch(reject);
    });
  }
}

//-----------------------------------
// HELPERS

function argsValidator(args) {
  let argsError = ERROR.ArrayValidator(args);
  if (argsError)
    return `arguments are ${argsError}`;

  for (let i = 0; i < args.length; ++i) {
    let currArg = args[i];

    let stringError = ERROR.StringValidator(currArg);
    let numberError = ERROR.NumberValidator(currArg);

    if (stringError != null && numberError != null)
      return `arguments must be string or number type`;
  }
  return null;
}

//----------------------------------
// TEST

let user = 'pi';
let host = 'teagirl';

let cmd = 'ls';
let args = ['-l'];

let bashCmd = `if [ -e /home/pi ]; then echo 1; else echo 0; fi;`;

let localCmd = new LocalCommand();
let remoteCmd = new RemoteCommand(user, host);

remoteCmd.Execute(cmd, []).then(output => {
  console.log(`OUTPUT: ${JSON.stringify(output)}`);
}).catch(error => {
  console.log(`ERROR: ${error}`);
});

//-----------------------------------
// EXPORTS

exports.LocalCommand = LocalCommand;
exports.RemoteCommand = RemoteCommand;
exports.Command = Command;