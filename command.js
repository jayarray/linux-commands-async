const CHILD_PROCESS = require('child_process');
const ERROR = require('./error.js');

//-----------------------------------
// OPTIONS

const OPTION_NAME_TYPE_PAIRS = [
  { name: 'cwd', types: ['string'] },
  { name: 'env', types: ['Object'] },
  { name: 'argv0', types: ['string'] },
  { name: 'stdio', types: ['Array', 'string'] },
  { name: 'detached', types: ['boolean'] },
  { name: 'uid', types: ['number'] },
  { name: 'gid', types: ['number'] },
  { name: 'shell', types: ['boolean', 'string'] },
  { name: 'windowsVerbatimArguments', types: ['boolean'] },
  { name: 'windowsHide', types: ['boolean'] }
];

function newOptionsObject() {
  let obj = {};
  OPTION_NAME_TYPE_PAIRS.forEach(pair => obj[pair.name] = null);
  return obj;
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
}

//-----------------------------------------
// LOCAL

class LocalCommand {
  /**
   * @param {Object} options 
   */
  constructor(options) {
    this.options_ = options;
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

      let optionsError = Error.OptionsValidator(this.options_);
      if (optionsError) {
        reject(`Failed to execute remote command: ${error}`);
        return;
      }

      let childProcess = null;
      if (options == null)
        childProcess = CHILD_PROCESS.spawn(cmd, args);
      else
        childProcess = CHILD_PROCESS.spawn(cmd, args, this.options_);

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

class RemoteCommand extends LocalCommand {
  /**
  * @param {string} user 
  * @param {string} host 
  * @param {Object} options 
  */
  constructor(user, host, options) {
    super(options);
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

      error = Error.OptionsValidator(this.options_);
      if (error) {
        reject(`Failed to execute remote command: ${error}`);
        return;
      }

      let sshArgs = [`${this.user_}@${this.host_}`];
      if (args)
        sshArgs.push(`${cmd} ${args.join(' ')}`);
      else
        sshArgs.push(cmd);

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

      /**
      * @param {Object} options 
      */
      Options(options) {
        this.options = options;
        return this;
      }

      Build() {
        if (ERROR.StringValidator(this.user) != null || ERROR.StringValidator(this.host) != null)
          return null;
        if (Error.OptionsValidator(options) != null)
          return null;
        return new RemoteCommand(this.user, this.host, this.options);
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

  static OptionsObject() {
    return newOptionsObject();
  }
}

//-----------------------------------
// ERROR

class Error {
  static OptionsValidator(options) {
    if (options === undefined)
      return `Options are undefined`;

    let hasAtLeastOneValidPair = false;
    let hasInvalidVariables = false;

    let variableNames = OPTION_NAME_TYPE_PAIRS.map(pair => pair.name);
    let optionsVariableNames = Object.keys(options);

    optionsVariableNames.forEach(name => {
      if (!variableNames.includes(name))
        return `Unknown option: ${name}`;
      else {
        let optionType = typeof options[name];

        let validTypes = OPTION_NAME_TYPE_PAIRS.filter(pair => pair.name == name)[0].types;
        if (!validTypes.includes(optionType))
          return `Option '${name}' is incorrect type. Is currently ${optionType} type; Should be ${validTypes.join('|')} type.`;
      }
    });

    return null;
  }
}

//-----------------------------------
// EXPORTS

exports.LocalCommand = LocalCommand;
exports.RemoteCommand = RemoteCommand;
exports.Command = Command;