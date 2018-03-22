const CHILD_PROCESS = require('child_process');
const VALIDATE = require('./validate.js');

//-----------------------------------
// HELPERS

function argsValidator(args) {
  let argsError = VALIDATE.IsArray(args);
  if (argsError)
    return `arguments are ${argsError}`;

  for (let i = 0; i < args.length; ++i) {
    let currArg = args[i];

    let stringError = VALIDATE.IsStringInput(currArg);
    let numberError = VALIDATE.IsNumber(currArg);

    if (stringError && numberError)
      return `arguments must be string or number type`;
  }
  return null;
}

//---------------------------------------------
// SAVING DATA (to string)

class SavedData {
  constructor(stream) {
    this.value_ = '';
    stream.on('data', this.Callback_.bind(this));
  }

  Callback_(data) {
    this.value_ += data.toString();
  }

  get value() {
    return this.value_;
  }
}

//-----------------------------------------
// LOCAL

class Command {
  constructor() {
  }

  /**
   * Executes a system command locally.
   * @param {string} cmd Command name or command string.
   * @param {Array<string|number>} args List of args associated with command name. (Assign as empty array if no args are needed).
   * @returns {Promise<{stderr: string, stdout: string, exitCode: number}>} Returns a promise. If it resolves, it returns an object. Else, it returns an error.
   */
  Execute(cmd, args) {
    let cmdError = VALIDATE.IsStringInput(cmd);
    if (cmdError)
      return Promise.reject(`Failed to execute command: command is ${cmdError}`);

    let argsError = argsValidator(args);
    if (argsError)
      return Promise.reject(`Failed to execute command: ${argsError}`);

    return new Promise((resolve) => {
      let childProcess = null;

      if (args.length > 0)
        childProcess = childProcess = CHILD_PROCESS.spawn(cmd, args);
      else
        childProcess = CHILD_PROCESS.exec(cmd);

      let stderr = new SavedData(childProcess.stderr);
      let stdout = new SavedData(childProcess.stdout);

      childProcess.on('close', exitCode => {
        resolve({
          stderr: stderr.value,
          stdout: stdout.value,
          pid: childProcess.pid,
          exitCode: exitCode
        });
      });
    });
  }
}

const LOCAL = new Command();

//-----------------------------------------
// REMOTE

class RemoteCommand extends Command {
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
   * @override
   * Executes a system command remotely.
   * @param {string} cmd Command name or command string.
   * @param {Array<string|number>} args List of args associated with command name. (Assign as empty array if no args are needed).
   * @returns {Promise<{stderr: string, stdout: string, exitCode: number}>} Returns a promise. If it resolves, it returns an object. Else, it rejects and returns an error.
   */
  Execute(cmd, args) {
    let cmdError = VALIDATE.IsStringInput(cmd);
    if (cmdError)
      return Promise.reject(`Failed to execute command: command is ${cmdError}`);

    let argsError = argsValidator(args);
    if (argsError)
      return Promise.reject(`Failed to execute command: ${argsError}`);

    let sshArgs = [`${this.user_}@${this.host_}`];

    if (args.length > 0)
      sshArgs.push(`${cmd} ${args.join(' ')}`);
    else
      sshArgs.push(cmd);

    return LOCAL.Execute('ssh', sshArgs);
  }

  /**
   * Creates a Command object that executes commands remotely.
   * @param {string} user Username
   * @param {string} host Remote host name
   * @returns {Promise<Command>} Returns a promise. If it resolves, it returns a Command object. Else, it returns an error.
   */
  static Create(user, host) {
    let userError = VALIDATE.IsStringInput(user);
    if (userError)
      return Promise.reject(userError);

    let hostError = VALIDATE.IsStringInput(host);
    if (hostError)
      return Promise.reject(hostError);

    return Promise.resolve(new RemoteCommand(user, host));
  }
}

//-----------------------------------
// EXPORTS

exports.LOCAL = LOCAL;
exports.CreateRemoteCommand = RemoteCommand.Create;