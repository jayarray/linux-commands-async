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

    if (stringError || numberError)
      return `arguments must be string or number type`;
  }
  return null;
}

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

  get value() {
    return this.value_;
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
          exitCode: exitCode
        });
      });
    });
  }
}

const LOCAL = new LocalCommand();

//-----------------------------------------
// REMOTE

class RemoteCommand extends LocalCommand {
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