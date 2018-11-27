let VALIDATE = require('./validate.js');
let USER_INFO = require('./userinfo.js');
let FILE = require('./file.js');
let PATH = require('./path.js'); // project module
let path = require('path');
let COMMAND = require('./command.js');

//----------------------------
// GUID

/**
 * Create a GUID number.
 * @returns {string} Returns an alphanumeric GUID string.
 */
function GuiNumber() {
  let defaultLength = 32;
  let guid = '';

  for (let i = 0; i < defaultLength; ++i)
    guid += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);

  return guid;
}

/**
 * Create a filename with GUID as name.
 * @param {string} format Output format (i.e. png, jpeg, tiff, exr, etc) 
 * @returns {string} Returns a string that looks like this: "GUID.FORMAT"
 */
function GuiFilename(format) {
  return `${GuiNumber()}.${format}`;
}

//----------------------------
// SSH

class SSH {
  constructor(user, host, password) {
    this.user_ = user;
    this.host_ = host;
    this.password_ = password;
    this.isLocal_ = !host && !password;
    this.executor_ = this.isLocal_ ? COMMAND.LOCAL : COMMAND.CreateRemoteCommand(user, host);

    this.userDir_ = `/home/${user}`;
    this.publicKeyFilepath_ = `/home/${user}/.ssh/id_rsa.pub`;
    this.authorizedKeysFilepath_ = `/home/${user}/.ssh/authorized_keys`;
  }

  /**
   * Write to file.
   * @param {string} filepath 
   * @param {string} text 
   * @returns {Promise} Returns a Promise taht resolves if successful. Otherwise, it returns an error.
   */
  WriteToFile_(filepath, text) {
    return new Promise((resolve, reject) => {
      let inputs = this.isLocal_ ? null : [this.password_];

      // Escape all double-quotes (if you don't, they will NOT be preserved!)
      text = text.split('"').join('\\"');

      this.executor_.Execute(`echo "${text}" > ${filepath}`, [], inputs).then(output => {
        if (output.stderr) {
          reject(`Failed to create file: ${output.stderr}`);
          return;
        }
        resolve();
      }).catch(error => reject(`Failed to create file: ${error}`));
    });
  }

  /**
   * @param {string} text
   * @returns {Promise<string>} Returns a Promise that resolves and returns the filepath if successful. Otherwise, it returns an error.
   */
  CreateScript_(text) {
    return new Promise((resolve, reject) => {
      let filepath = path.join(this.userDir_, GuiFilename('sh'));

      this.WriteToFile_(filepath, text).then(success => {
        resolve(filepath);
      }).catch(error => reject(`Failed to create script: ${error}.`));
    });
  }

  /**
   * @param {string} filepath 
   * @returns {Promise<string>} Returns a Promise that resolves if successful. Otherwise, it returns an error.
   */
  MakeScriptExecutable_(filepath) {
    return new Promise((resolve, reject) => {
      let inputs = this.isLocal_ ? null : [this.password_];

      this.executor_.Execute('chmod', ['+x', filepath], inputs).then(output => {
        if (output.stderr) {
          reject(`Failed to make script executable: ${output.stderr.trim()}`);
          return;
        }

        resolve();
      }).catch(error => reject(`Failed to make script executable: ${error}.`));
    });
  }

  /**
   * @param {string} filepath 
   * @returns {Promise<string>} Returns a Promise that resolves if successful. Otherwise, it returns an error.
   */
  RunScript_(filepath) {
    return new Promise((resolve, reject) => {
      let inputs = this.isLocal_ ? null : [this.password_];

      this.executor_.Execute(filepath, [], inputs).then(output => {
        if (output.stderr) {
          reject(`Failed to run script: ${output.stderr.trim()}`);
          return;
        }

        let outputStr = output.stdout.trim();

        resolve(outputStr);
      }).catch(error => reject(`Failed to run script: ${error}.`));
    });
  }

  /**
   * @param {string} filepath 
   * @returns {Promise<string>} Returns a Promise that resolves if successful. Otherwise, it returns an error.
   */
  DeleteScript_(filepath) {
    return new Promise((resolve, reject) => {
      let inputs = this.isLocal_ ? null : [this.password_];

      this.executor_.Execute('rm', ['-f', filepath], inputs).then(output => {
        if (output.stderr) {
          reject(`Failed to delete script: ${output.stderr.trim()}`);
          return;
        }

        resolve();
      }).catch(error => reject(`Failed to delete script: ${error}.`));
    });
  }

  /**
   * @param {string} text 
   * @returns {Promise<string>} Returns a Promise that resolves if successful. Otherwise, it returns an error.
   */
  ExecuteScript(text) {
    return new Promise((resolve, reject) => {
      this.CreateScript_(text).then(filepath => {
        this.MakeScriptExecutable_(filepath).then(execDone => {
          this.RunScript_(filepath).then(output => {
            this.DeleteScript_(filepath).then(deleteDone => {
              resolve(output);
            }).catch(error => reject(`Failed to execute script: ${error}.`));
          }).catch(error => reject(`Failed to execute script: ${error}.`));
        }).catch(error => reject(`Failed to execute script: ${error}.`));
      }).catch(error => reject(`Failed to execute script: ${error}.`));
    });
  }

  /**
   * Check if a file exists.
   * @param {string} path 
   * @returns {Promise<boolean>} Returns a Promise that resolves if successful. Otherwise, it returns an error.
   */
  FileExists_(path) {
    return new Promise((resolve, reject) => {
      let cmd = `if [ -e ${path} ]; then`; // can you do !exists and return dne to avoid nested ifs?
      cmd += ` if [ -d ${path} ]; then echo "d";`;
      cmd += ` else`;
      cmd += ` if [ -f ${path} ]; then  echo "f";`;
      cmd += ` else echo "invalid";`;
      cmd += ` fi fi`;
      cmd += ` else echo "dne"; fi`;

      this.ExecuteScript(cmd).then(output => {
        resolve(output == 'f' || output == 'd');
      }).catch(error => reject(`Failed to check if file exists: ${error}.`));
    });
  }

  /**
   * Check if public key file exists.
   * @returns {Promise<boolean>} Returns a Promise that resolves if successful. Otherwise, it returns an error.
   */
  PublicKeyFileExists() {
    return new Promise((resolve, reject) => {
      this.FileExists_(this.publicKeyFilepath_).then(exists => {
        resolve(exists);
      }).catch(error => reject(`Failed to check if public key file exists: ${error}.`));
    });
  }

  /**
   * Check if authorized keys file exists.
   * @returns {Promise<boolean>} Returns a Promise that resolves if successful. Otherwise, it returns an error.
   */
  AuthorizedKeysFileExists() {
    return new Promise((resolve, reject) => {
      this.FileExists_(this.authorizedKeysFilepath_).then(exists => {
        resolve(exists);
      }).catch(error => reject(`Failed to check if public key file exists: ${error}.`));
    });
  }

  /**
   * Create a public and private key on a workstation.
   * @param {string} filepath
   * @param {string} passphrase
   * @returns {Promise} Returns a Promise that resolves if successful. Otherwise, it returns an error.
   */
  GenerateSshKey(filepath, passphrase) {
    return new Promise((resolve, reject) => {
      let inputs = this.isLocal_ ? [] : [this.password_];

      if (filepath) {
        inputs.push(filepath);

        this.FileExists_(filepath).then(filepathExists => {
          if (filepathExists)
            inputs.push('y'); // Overwrite option (or nothing will happen)

          if (passphrase)
            inputs.push(passphrase);
          else
            inputs.push('');

          this.executor_.Execute('ssh-keygen', ['-t', 'rsa'], inputs).then(output => {
            if (output.stderr && !output.stdout.includes('Your public key has been saved in')) {
              reject(`Failed to generate SSH key: ${output.stderr.trim()}.`);
              return;
            }

            resolve();
          }).catch(error => reject(error));
        }).catch(error => reject(`Failed to generate SSH key: ${error}`));
      }
      else {
        inputs.push('');

        this.FileExists_(this.publicKeyFilepath_).then(filepathExists => {
          if (filepathExists)
            inputs.push('y'); // Overwrite option

          if (passphrase)
            inputs.push(passphrase);
          else
            inputs.push('');

          this.executor_.Execute('ssh-keygen', ['-t', 'rsa'], inputs).then(output => {
            if (output.stderr && !output.stdout.includes('Your public key has been saved in')) {
              reject(`Failed to generate SSH key: ${output.stderr.trim()}.`);
              return;
            }

            resolve();
          }).catch(error => reject(error));
        }).catch(error => reject(`Failed to generate SSH key: ${error}`));
      }
    });
  }

  /**
  * Copy the public key to remote host.
  * @param {string} user 
  * @param {string} remoteHost 
  * @param {string} remotePassword
  * @returns {Promise} Returns a Promise that resolves if successful. Otherwise, it returns an error.
  */
  CopyPublicKey(user, remoteHost, remotePassword) {
    let error = VALIDATE.IsStringInput(user);
    if (error)
      return Promise.reject(`Failed to copy SSH key: user is ${error}`);

    error = VALIDATE.IsStringInput(remoteHost);
    if (error)
      return Promise.reject(`Failed to copy SSH key: remote host is ${error}`);

    return new Promise((resolve, reject) => {
      this.executor_.Execute('ssh-copy-id', [`${user}@${remoteHost}`], [remotePassword]).then(output => {
        if (output.stderr) {
          reject(`Failed to copy SSH key: ${output.stderr.trim()}.`);
          return;
        }

        resolve();
      }).catch(error => reject(error));
    });
  }

  /**
  * Get public key.
  * @returns {Promise<{prefix: string, publicKey: string, user: string, host: string}>} Returns a Promise that resolves if successful. Otherwise, it returns an error.
  */
  GetPublicKey() {
    return new Promise((resolve, reject) => {
      this.ExecuteScript(`cat ${this.publicKeyFilepath_}`).then(output => {
        let parts = output.trim().split(' ');
        let prefix = parts[0];
        let publicKey = parts[1];

        let otherParts = parts[2].split('@');
        let user = otherParts[0];
        let host = otherParts[1];

        let k = {
          prefix: prefix,
          publicKey: publicKey,
          user: user,
          host: host
        };

        resolve(k);
      }).catch(error => reject(`Failed to get public key: ${error}.`));
    });
  }


  /**
   * Get a list of authorized keys.
   * @returns {Promise<Array<{prefix: string, publicKey: string, user: string, remoteHost: string}>>} Returns a Promise that resolves if successful. Otherwise, it returns an error.
   */
  GetAuthorizedKeys() {
    return new Promise((resolve, reject) => {
      this.ExecuteScript(`cat ${this.authorizedKeysFilepath_}`).then(output => {
        let delimiter = 'ssh-rsa';
        let lines = output.trim().split(delimiter).filter(x => x && x != '' && x.trim() != '').map(x => x.trim());
        let authKeys = [];

        lines.forEach(l => {
          let parts = l.split(' ');
          let publicKey = parts[0];

          let otherParts = parts[1].split('@');
          let user = otherParts[0];
          let remoteHost = otherParts[1];

          let k = {
            prefix: delimiter,
            publicKey: publicKey,
            user: user,
            remoteHost: remoteHost
          };

          authKeys.push(k);
        });

        resolve(authKeys);
      }).catch(error => reject(`Failed to get public key: ${error}.`));
    });
  }

  /**
  * Remove an authroized key. If the specified user and host are not listed in the authorized keys file, the file will remain unchanged.
  * @param {string} user 
  * @param {string} host 
  * @returns {Promise} Returns a Promise that resolves if successful. Otherwise, it returns an error. 
  */
  RemoveAuthorizedKey(user, host) {
    return new Promise((resolve, reject) => {
      this.GetAuthorizedKeys().then(authKeys => {
        let unwantedKeys = authKeys.filter(x => `${x.user}@${x.remoteHost}` == `${user}@${host}`);
        if (!unwantedKeys || unwantedKeys.length == 0) {
          resolve();
          return;
        }

        let filteredKeys = authKeys.filter(x => `${x.user}@${x.remoteHost}` != `${user}@${host}`);

        let keyStrings = filteredKeys.map(x => {
          let str = `${x.prefix} ${x.publicKey} ${x.user}`;

          if (x.remoteHost)
            str += `@${x.remoteHost}`;

          return str;
        });

        // Escape all double-quotes (if you don't, they will NOT be preserved!)
        let text = keyStrings.join('\n');
        text = text.split('"').join('\\"');

        let cmd = `echo "${text}" > ${this.authorizedKeysFilepath_}`;

        this.ExecuteScript(cmd).then(output => {
          resolve();
        }).catch(error => reject(`Failed to remove authorized key: ${error}.`));
      }).catch(error => reject(`Failed to remove key: ${error}`));
    });
  }

  /**
   * Create a SSH object.
   * @param {string} user 
   * @param {string} host 
   * @param {string} password 
   * @returns {SSH} Returns an SSH object. If arguments are invalid, it returns null.
   */
  static Create(user, host, password) {
    if (!user)
      return null;

    return new SSH(user, host, password);
  }
}

//----------------------------

/**
 * Check if public keys are stale.
 * @param {object} localSsh The local SSH object responsible for getting the public key.
 * @param {object} remoteSsh The remote SSH object responsible for getting the authorized keys.
 * @returns {Promise<boolean>} Returns a Promise that resolves if successful. Otherwise, it returns an error.
 */
function AreKeysStale(localSsh, remoteSsh) {
  let error = VALIDATE.IsInstance(localSsh);
  if (error)
    return Promise.reject(`Failed to check if keys are stale: local SSH object is ${error}.`);

  error = VALIDATE.IsInstance(remoteSsh);
  if (error)
    return Promise.reject(`Failed to check if keys are stale: remote SSH object is ${error}.`);

  return new Promise((resolve, reject) => {
    // Get "local" public key
    localSsh.GetPublicKey().then(pubKey => {

      // Get "remote" auth keys
      remoteSsh.GetAuthorizedKeys().then(authKeys => {

        // Check if local pub key and remote auth key match
        let remoteKeys = authKeys.filter(x => `${x.user}@${x.remoteHost}` == `${user}@${host}`);
        if (!remoteKeys || remoteKeys.length == 0) {
          resolve(true);
          return;
        }

        let authKey = remoteKeys[0];
        let theyMatch = pubKey.publicKey == authKey.publicKey;

        resolve(theyMatch);
      }).catch(error => reject(`Failed to check if keys are stale: ${error}`));
    }).catch(error => reject(`Failed to check if keys are stale: ${error}`));
  });
}

/**
 * Check if local machine requires password to log into remote machine.
 * @param {SSH} localSsh 
 * @param {SSH} remoteSsh 
 * @returns {Promise<boolean>} Returns a Promise that resolves if successful. Otherwise, it returns an error.
 */
function RequiresPassword(localSsh, remoteSsh) {
  let error = VALIDATE.IsInstance(localSsh);
  if (error)
    return Promise.reject(`Failed to check if keys are stale: local SSH object is ${error}.`);

  error = VALIDATE.IsInstance(remoteSsh);
  if (error)
    return Promise.reject(`Failed to check if keys are stale: remote SSH object is ${error}.`);

  return new Promise((resolve, reject) => {
    let testOutput = 'Hello';
    let testCommand = `echo ${testOutput}`;
    localSsh.executor_.Execute('ssh', [`${remoteSsh.user_}@${remoteSsh.host_}`, testCommand]).then(output => {
      if (output.stderr && output.stderr.includes('Permission denied')) {
        resolve(true);
        return;
      }

      resolve(false);
    }).catch(error => reject(`Failed to check if password is required: ${error}`));
  });
}

/**
 * Set up passwordless login for local machine onto remote machine.
 * @param {string} localSsh 
 * @param {string} remoteSsh  
 * @returns {Promise} Returns a Promise that resolves if successful. Otherwise, it returns an error.
 */
function SetupPasswordlessLogin(localSsh, remoteSsh) {
  return new Promise((resolve, reject) => {
    localSsh.GenerateSshKey().then(keyGenSuccessful => {
      localSsh.CopyPublicKey(remoteSsh.user_, remoteSsh.host_, remoteSsh.password_).then(copySuccessful => {
        RequiresPassword(localSsh, remoteSsh).then(requiresPassword => {
          if (!requiresPassword) {
            reject(`Failed to set up passwordless login: password is still required for: ${user}@${remoteHost}.`);
            return;
          }

          resolve();
        }).catch(error => reject(error));
      }).catch(error => reject(error));
    }).catch(error => reject(error));
  });
}

//-----------------------------
// EXPORTS

exports.Create = SSH.Create;
exports.AreKeysStale = AreKeysStale;
exports.RequiresPassword = RequiresPassword;
exports.SetupPasswordlessLogin = SetupPasswordlessLogin;