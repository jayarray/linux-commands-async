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

class CommandLocal {
  constructor() {
  }

  /**
   * @param {string} cmd 
   * @param {Array<string|number>} args 
   */
  Execute(cmd, args) {
    return new Promise((resolve, reject) => {
      let error = ERROR.StringValidator(cmd);
      if (error) {
        reject(`Failed to execute command: command is ${error}`);
        return;
      }

      error = ERROR.ArrayValidator(args);
      if (error) {
        reject(`Failed to execute command: arguments are ${error}`);
        return;
      }

      let childProcess = CHILD_PROCESS.spawn(cmd, args);
      let stderr = new SavedData(childProcess.stderr);
      let stdout = new SavedData(childProcess.stdout);

      childProcess.on('close', exitCode => {
        resolve({
          stderr: stderr.value_,
          stdout: stdout.value_,
          exitCode: exitCode,
        });
      });
    });
  }
}

//-----------------------------------------
// REMOTE

class CommandRemote extends CommandLocal {
  /**
  * @param {string} user 
  * @param {string} host 
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
      let error = ERROR.StringValidator(cmd);
      if (error) {
        reject(`Failed to execute remote command: command is ${error}`);
        return;
      }

      error = ERROR.ArrayValidator(args);
      if (error) {
        reject(`Failed to execute remote command: arguments are ${error}`);
        return;
      }

      error = ERROR.StringValidator(this.user_);
      if (error) {
        reject(`Failed to execute remote command: user is ${error}`);
        return;
      }

      error = ERROR.StringValidator(this.host_);
      if (error) {
        reject(`Failed to execute remote command: host is ${error}`);
        return;
      }

      let sshArgs = [`${this.user_}@${this.host_}`];
      if (args)
        sshArgs.push(`${cmd} ${args.join(' ')}`);
      else
        sshArgs.push(cmd);

      CommandLocal.prototype.Execute('ssh', sshArgs).then(output => {
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
      user(user) {
        this.user = user;
        return this;
      }

      /**
      * @param {string} host 
      */
      host(host) {
        this.host = host;
        return this;
      }

      build() {
        if (ERROR.StringValidator(this.user) != null || ERROR.StringValidator(this.host) != null)
          return null;
        return new CommandRemote(this.user, this.host);
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
  * @param {CommandLocal|CommandRemote} executor 
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
      if (executorClassName != 'CommandLocal' && executorClassName != 'CommandRemote') {
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
// EXPORTS

exports.CommandLocal = CommandLocal;
exports.CommandRemote = CommandRemote;
exports.Command = Command;