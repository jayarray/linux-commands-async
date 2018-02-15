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

class Command {
  constructor() {
  }

  /**
   * @param {string} cmd 
   * @param {Array<string>} args 
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

class CommandRemote extends Command {
  /**
  * @param {string} user 
  * @param {string} host 
  */
  constructor(user, host) {
    super();
    this.user_ = user;
    this.host_ = host;
  }

  /** @override */
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

      let sshArgs = [`${this.user_}@${this.host_}`];
      if (args)
        sshArgs.push(`${cmd} ${args.join(' ')}`);
      else
        sshArgs.push(cmd);

      Command.prototype.Execute('ssh', sshArgs).then(output => {
        resolve(output);
      }).catch(reject);
    });
  }
}

//----------------------------------------------
// TEST

let user = 'pi';
let host = 'teagirl';

let cmd = 'ls';
let args = [];

let CMD = new CommandRemote(user, host);
CMD.Execute(cmd, args).then(output => {
  console.log(`OUTPUT: ${JSON.stringify(output)}`);
}).catch(error => {
  console.log(`ERROR: ${error}`);
});