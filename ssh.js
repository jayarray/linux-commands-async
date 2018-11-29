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
// SSH (Base Class)

class SshBaseClass {
  constructor(user, host, password, stopSshServiceCmd, startSshServiceCmd, statusSshCmd) {
    this.user_ = user;
    this.host_ = host;
    this.password_ = password;
    this.stopSshServiceCmd_ = stopSshServiceCmd;
    this.startSshServiceCmd_ = startSshServiceCmd;
    this.statusSshCmd_ = statusSshCmd;

    this.userDir_ = `/home/${user}`;
    this.publicKeyFilepath_ = `/home/${user}/.ssh/id_rsa.pub`;
    this.authorizedKeysFilepath_ = `/home/${user}/.ssh/authorized_keys`;

    this.isLocal_ = null;
    this.executor_ = null;
  }

  WriteToFile_(filepath, text) {
    // Overriide
  }

  FileExists(filepath) {
    // Overwrite
  }

  PublicKeyFileExists() {
    // Overwrite
  }

  AuthorizedKeysFileExists() {
    // Override
  }

  GenerateSshKey(filepath, passphrase) {
    // Override
  }

  CopyPublicKeyTo(remoteSsh) {
    // Override
  }

  GetPublicKey() {
    // Override
  }

  GetAuthorizedKeys() {
    // Override
  }

  RemoveAuthorizedKey(user, host) {
    // Override
  }

  RestartSshService() {
    // Override
  }

  StatusOfSshService() {
    // Override
  }

  IsKeyStale(remoteSsh) {
    // Override
  }

  RequiresPasswordTo(remoteSsh) {
    // Override
  }

  SetupPasswordlessLoginWith(remoteSsh, overwriteExistingPubKey) {
    // Override
    // 
  }
}

//------------------------------
// SSH Local

class SshLocal extends SshBaseClass {
  constructor(user, host, password, stopSshServiceCmd, startSshServiceCmd, statusSshCmd) {
    super(user, host, password, stopSshServiceCmd, startSshServiceCmd, statusSshCmd);
    this.isLocal_ = true;
    this.executor_ = COMMAND.LOCAL;
  }

  /**
   * @override
   * @param {string} filepath 
   * @param {string} text 
   * @returns {Promise} Returns a Promise that resolves if successful.
   */
  WriteToFile_(filepath, text) {
    return new Promise((resolve, reject) => {
      FILE.Create(filepath, text, this.executor_).then(success => {
        resolve();
      }).catch(error => reject(error));
    });
  }

  /**
   * @override
   * @param {string} filepath 
   * @returns {Promise<boolean>} Returns a Promise that resolves if successful.
   */
  FileExists(filepath) {
    return new Promise((resolve, reject) => {
      PATH.Exists(filepath, this.executor_).then(bool => {
        resolve(bool);
      }).catch(error => reject(error));
    });
  }

  /**
   * @override
   * @returns {Promise<boolean>} Returns a Promise that resolves if successful.
   */
  PublicKeyFileExists() {
    return new Promise((resolve, reject) => {
      PATH.Exists(this.publicKeyFilepath_, this.executor_).then(bool => {
        resolve(bool);
      }).catch(error => reject(error));
    });
  }

  /**
   * @override
   * @returns {Promise<boolean>} Returns a Promise that resolves if successful.
   */
  AuthorizedKeysFileExists() {
    return new Promise((resolve, reject) => {
      PATH.Exists(this.publicKeyFilepath_, this.executor_).then(bool => {
        resolve(bool);
      }).catch(error => reject(error));
    });
  }

  /**
   * @override
   * Create a public and private on this workstation.
   * @param {string} filepath 
   * @param {string} passphrase 
   * @returns {Promise} Returns a Promise that resolve is successful.
   */
  GenerateSshKey(filepath, passphrase) {
    return new Promise((resolve, reject) => {
      let inputs = [];

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
   * @override
   * @param {SSH} remoteSsh 
   * @returns {Promise} Returns a Promise that resolve if successful.
   */
  CopyPublicKeyTo(remoteSsh) {
    let error = VALIDATE.IsInstance(remoteSsh);
    if (error)
      return Promise.reject(`Failed to copy SSH key: remote ssh is ${error}`);

    return new Promise((resolve, reject) => {
      this.executor_.Execute('ssh-copy-id', [`${remoteSsh.user_}@${remoteSsh.host_}`], [remoteSsh.password_]).then(output => {
        if (output.stderr) {
          reject(`Failed to copy SSH key: ${output.stderr.trim()}.`);
          return;
        }

        resolve();
      }).catch(error => reject(error));
    });
  }

  /**
   * @override
   * @returns {Promise<{prefix: string, key: string, user: string, host: string}>} Returns a Promise that resolves if successful.
   */
  GetPublicKey() {
    return new Promise((resolve, reject) => {
      FILE.Read(this.publicKeyFilepath_, this.executor_).then(text => {
        let parts = text.trim().split(' ');
        let prefix = parts[0];
        let key = parts[1];

        let otherParts = parts[2].split('@');
        let user = otherParts[0];
        let host = otherParts[1];

        let k = {
          prefix: prefix,
          key: key,
          user: user,
          host: host
        };

        resolve(k);
      }).catch(error => reject(`Failed to get public key: ${error}.`));
    });
  }

  /**
   * @override
   * @returns {Promise<Array<{prefix: string, key: string, user: string, host: string}>>} Returns a Promise that resolves if successful.
   */
  GetAuthorizedKeys() {
    return new Promise((resolve, reject) => {
      FILE.Read(this.authorizedKeysFilepath_, this.executor_).then(text => {
        let delimiter = 'ssh-rsa';
        let lines = text.trim().split(delimiter).filter(x => x && x != '' && x.trim() != '').map(x => x.trim());
        let authKeys = [];

        lines.forEach(l => {
          let parts = l.split(' ');
          let key = parts[0];

          let otherParts = parts[1].split('@');
          let user = otherParts[0];
          let host = otherParts[1];

          let k = {
            prefix: delimiter,
            key: key,
            user: user,
            host: host
          };

          authKeys.push(k);
        });

        resolve(authKeys);
      }).catch(error => reject(`Failed to get authorized keys: ${error}.`));
    });
  }

  /**
   * @override
   * Remove an authroized key. If the specified user and host are not listed in the authorized keys file, the file will remain unchanged.
   * @param {string} user 
   * @param {string} host 
   * @returns {Promise} Returns a Promise that resolves if successful.
   */
  RemoveAuthorizedKey(user, host) {
    return new Promise((resolve, reject) => {
      this.GetAuthorizedKeys().then(authKeys => {
        let unwantedKeys = authKeys.filter(x => `${x.user}@${x.host}` == `${user}@${host}`);
        if (!unwantedKeys || unwantedKeys.length == 0) {
          resolve();
          return;
        }

        let filteredKeys = authKeys.filter(x => `${x.user}@${x.host}` != `${user}@${host}`);

        let keyStrings = filteredKeys.map(x => {
          let str = `${x.prefix} ${x.key} ${x.user}`;
          if (x.host)
            str += `@${x.host}`;
          return str;
        });

        let text = keyStrings.join('\n');

        // Overwrite current auth keys file
        this.WriteToFile_(this.authorizedKeysFilepath_, text).then(success => {
          resolve();
        }).catch(error => reject(error));
      }).catch(error => reject(`Failed to remove key: ${error}`));
    });
  }

  /**
   * @override
   * @returns {Promise} Returns a Promise taht resolves if successful.
   */
  RestartSshService() {
    return new Promise((resolve, reject) => {
      // Stop SSH service
      this.executor_.Execute(this.stopSshServiceCmd_, [], [this.password_]).then(stopOutput => {
        if (stopOutput.stderr) {
          reject(`Failed to stop ssh service: ${stopOutput.stderr.trim()}.`);
          return;
        }

        // Start SSH service
        this.executor_.Execute(this.startSshServiceCmd_, [], [this.password_]).then(startOutput => {
          if (startOutput.stderr) {
            reject(`Failed to start ssh service: ${startOutput.stderr.trim()}.`);
            return;
          }

          resolve();
        }).catch(error => reject(`Failed to start service: ${error}.`));
      }).catch(error => reject(`Failed to stop service: ${error}.`));
    });
  }

  /**
   * @override
   * @returns {Promise<string>} Returns a Promise that resolves if successful.
   */
  StatusOfSshService() {
    return new Promise((resolve, reject) => {
      this.executor_.Execute(this.statusSshCmd_, [], [this.password_]).then(output => {
        resolve(output);
      }).catch(error => reject(`Failed to check status of ssh service: ${error}`));
    });
  }

  /**
   * @override
   * Check the state of the public key on the remote machine. State will be either: dne, match, or stale.
   * @param {SshRemote} remoteSsh 
   * @returns {Promise<string>} Returns a Promise that resolves if successful.
   */
  KeyStateIn(remoteSsh) {
    return new Promise((resolve, reject) => {
      this.GetPublicKey().then(pubKey => {
        remoteSsh.GetAuthorizedKeys().then(authKeys => {
          let correspondingKeys = authKeys.filter(x => `${x.user}@${x.host}` == `${pubKey.user}@${pubKey.host}`);
          if (!correspondingKeys || correspondingKeys.length == 0) {
            resolve('dne');
            return;
          }

          let remotePubKey = correspondingKeys[0];

          if (pubKey.key == remotePubKey.key) {
            resolve('match');
            return;
          }

          resolve('stale');
        }).catch(error => reject(`Failed to check key state: ${error}.`));
      }).catch(error => reject(`Failed to check key state: ${error}.`));
    });
  }

  /**
   * @override
   * @param {SshRemote} remoteSsh 
   * @returns {Promise<boolean>} Returns a Promise that resolves if successful.
   */
  RequiresPasswordTo(remoteSsh) {
    return new Promise((resolve, reject) => {
      let testOutput = 'Hello';
      let testCommand = `echo ${testOutput}`;
      this.executor_.Execute('ssh', [`${remoteSsh.user_}@${remoteSsh.host_}`, testCommand]).then(output => {
        if (output.stderr && output.stderr.includes('Permission denied')) {
          resolve(true);
          return;
        }

        resolve(false);
      }).catch(error => reject(`Failed to check if password is required: ${error}`));
    });
  }

  /**
   * @override
   * Set up passwordless login between two machines.
   * @param {SshRemote} remoteSsh 
   * @param {boolean} overwriteExistingPubKey
   * @returns {Promise} Returns a Promise that resolves if successful.
   */
  SetupPasswordlessLoginWith(remoteSsh, overwriteExistingPubKey) {
    return new Promise((resolve, reject) => {
      this.PublicKeyFileExists().then(pubKeyExists => {
        if (pubKeyExists) {
          if (overwriteExistingPubKey) {
            this.GenerateSshKey().then(keyGenSuccessful => {
              this.KeyStateIn(remoteSsh).then(keyState => {
                if (keyState == 'dne') {
                  this.CopyPublicKeyTo(remoteSsh).then(copySuccessful => {
                    remoteSsh.RestartSshService().then(restarted => {
                      this.RequiresPasswordTo(remoteSsh).then(requiresPassword => {
                        if (requiresPassword) {
                          reject(`Failed to set up passwordless login: password is still required for: ${remoteSsh.user_}@${remoteSsh.host_}.`);
                          return;
                        }

                        resolve();
                      }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                    }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                  }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                }
                else if (keyState == 'stale') {
                  remoteSsh.RemoveAuthorizedKey(this.user_, this.host_).then(keyRemoved => {
                    this.CopyPublicKeyTo(remoteSsh).then(copySuccessful => {
                      remoteSsh.RestartSshService().then(restarted => {
                        this.RequiresPasswordTo(remoteSsh).then(requiresPassword => {
                          if (requiresPassword) {
                            reject(`Failed to set up passwordless login: password is still required for: ${remoteSsh.user_}@${remoteSsh.host_}.`);
                            return;
                          }

                          resolve();
                        }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                      }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                    }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                  }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                }
                else if (keyState == 'match') {
                  resolve();
                  return;
                }
              }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
            }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
          }
          else {
            this.KeyStateIn(remoteSsh).then(keyState => {
              if (keyState == 'dne') {
                this.CopyPublicKeyTo(remoteSsh).then(copySuccessful => {
                  remoteSsh.RestartSshService().then(restarted => {
                    this.RequiresPasswordTo(remoteSsh).then(requiresPassword => {
                      if (requiresPassword) {
                        reject(`Failed to set up passwordless login: password is still required for: ${remoteSsh.user_}@${remoteSsh.host_}.`);
                        return;
                      }

                      resolve();
                    }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                  }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
              }
              else if (keyState == 'stale') {
                remoteSsh.RemoveAuthorizedKey(this.user_, this.host_).then(keyRemoved => {
                  this.CopyPublicKeyTo(remoteSsh).then(copySuccessful => {
                    remoteSsh.RestartSshService().then(restarted => {
                      this.RequiresPasswordTo(remoteSsh).then(requiresPassword => {
                        if (requiresPassword) {
                          reject(`Failed to set up passwordless login: password is still required for: ${remoteSsh.user_}@${remoteSsh.host_}.`);
                          return;
                        }

                        resolve();
                      }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                    }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                  }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
              }
              else if (keyState == 'match') {
                resolve();
                return;
              }
            }).catch(error => reject(`Failed to set up passwrodless login: ${error}.`));
          }
        }
        else {
          this.GenerateSshKey().then(keyGenSuccessful => {
            this.KeyStateIn(remoteSsh).then(keyState => {
              if (keyState == 'dne') {
                this.CopyPublicKeyTo(remoteSsh).then(copySuccessful => {
                  remoteSsh.RestartSshService().then(restarted => {
                    this.RequiresPasswordTo(remoteSsh).then(requiresPassword => {
                      if (requiresPassword) {
                        reject(`Failed to set up passwordless login: password is still required for: ${remoteSsh.user_}@${remoteSsh.host_}.`);
                        return;
                      }

                      resolve();
                    }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                  }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
              }
              else if (keyState == 'stale') {
                remoteSsh.RemoveAuthorizedKey(this.user_, this.host_).then(keyRemoved => {
                  this.CopyPublicKeyTo(remoteSsh).then(copySuccessful => {
                    remoteSsh.RestartSshService().then(restarted => {
                      this.RequiresPasswordTo(remoteSsh).then(requiresPassword => {
                        if (requiresPassword) {
                          reject(`Failed to set up passwordless login: password is still required for: ${remoteSsh.user_}@${remoteSsh.host_}.`);
                          return;
                        }

                        resolve();
                      }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                    }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                  }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
              }
              else if (keyState == 'match') {
                resolve();
                return;
              }
            }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
          }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
        }
      }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
    });
  }

  /**
   * @param {string} user 
   * @param {string} host 
   * @param {string} password 
   * @param {string} stopSshServiceCmd 
   * @param {string} startSshServiceCmd 
   * @param {string} statusSshCmd 
   * @returns {SshLocal} Returns an SshLocal object. If arguments are invalid, it returns null.
   */
  static Create(user, host, password, stopSshServiceCmd, startSshServiceCmd, statusSshCmd) {
    if (!user || !host || !password || !stopSshServiceCmd || !startSshServiceCmd || !statusSshCmd)
      return null;

    return new SshLocal(user, host, password, stopSshServiceCmd, startSshServiceCmd, statusSshCmd);
  }
}

//------------------------------------
// SSH Remote

class SshRemote extends SshBaseClass {
  constructor(user, host, password, stopSshServiceCmd, startSshServiceCmd, statusSshCmd) {
    super(user, host, password, stopSshServiceCmd, startSshServiceCmd, statusSshCmd);
    this.isLocal_ = false;
    this.executor_ = COMMAND.CreateRemoteCommand(user, host);
  }

  /**
   * @override
   * @param {string} filepath 
   * @param {string} text 
   * @returns {Promise} Returns a Promise that resolves if successful.
   */
  WriteToFile_(filepath, text) {
    return new Promise((resolve, reject) => {
      // Escape all double-quotes (if you don't, they will NOT be preserved!)
      text = text.split('"').join('\\"');

      this.executor_.Execute(`echo "${text}" > ${filepath}`, [], [this.password_]).then(output => {
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
  * @returns {Promise<string>} Returns a Promise that resolves and returns the filepath if successful.
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
   * @returns {Promise<string>} Returns a Promise that resolves if successful.
   */
  MakeScriptExecutable_(filepath) {
    return new Promise((resolve, reject) => {
      this.executor_.Execute('chmod', ['+x', filepath], [this.password_]).then(output => {
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
   * @returns {Promise<string>} Returns a Promise that resolves if successful.
   */
  RunScript_(filepath) {
    return new Promise((resolve, reject) => {
      this.executor_.Execute(filepath, [], [this.password_]).then(output => {
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
   * @returns {Promise<string>} Returns a Promise that resolves if successful.
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
   * @returns {Promise<string>} Returns a Promise that resolves and returns the output if successful.
   */
  ExecuteScript_(text) {
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
   * @param {string} path 
   * @returns {Promise<boolean>} Returns a Promise that resolves if successful.
   */
  FileExists_(path) {
    return new Promise((resolve, reject) => {
      let cmd = `if [ -e ${path} ]; then`;
      cmd += ` if [ -d ${path} ]; then echo "d";`;
      cmd += ` else`;
      cmd += ` if [ -f ${path} ]; then  echo "f";`;
      cmd += ` else echo "invalid";`;
      cmd += ` fi fi`;
      cmd += ` else echo "dne"; fi`;

      this.ExecuteScript_(cmd).then(output => {
        resolve(output == 'f' || output == 'd');
      }).catch(error => reject(`Failed to check if file exists: ${error}.`));
    });
  }

  /**
   * @override
   * @returns {Promise<boolean>} Returns a Promise that resolves if successful.
   */
  PublicKeyFileExists() {
    return new Promise((resolve, reject) => {
      this.FileExists_(this.publicKeyFilepath_).then(exists => {
        resolve(exists);
      }).catch(error => reject(`Failed to check if public key file exists: ${error}.`));
    });
  }

  /**
   * @override
   * @returns {Promise<boolean>} Returns a Promise that resolves if successful.
   */
  AuthorizedKeysFileExists() {
    return new Promise((resolve, reject) => {
      this.FileExists_(this.authorizedKeysFilepath_).then(exists => {
        resolve(exists);
      }).catch(error => reject(`Failed to check if public key file exists: ${error}.`));
    });
  }

  /**
   * @override
   * Create a public and private key on this workstation.
   * @param {string} filepath
   * @param {string} passphrase
   * @returns {Promise} Returns a Promise that resolves if successful.
   */
  GenerateSshKey(filepath, passphrase) {
    return new Promise((resolve, reject) => {
      let inputs = [this.password_];

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
   * @override
   * @param {SSH} remoteSsh 
   * @returns {Promise} Returns a Promise that resolve if successful.
   */
  CopyPublicKeyTo(remoteSsh) {
    let error = VALIDATE.IsInstance(remoteSsh);
    if (error)
      return Promise.reject(`Failed to copy SSH key: remote ssh is ${error}`);

    return new Promise((resolve, reject) => {
      this.executor_.Execute('ssh-copy-id', [`${remoteSsh.user_}@${remoteSsh.host_}`], [remoteSsh.password_]).then(output => {
        if (output.stderr) {
          reject(`Failed to copy SSH key: ${output.stderr.trim()}.`);
          return;
        }

        resolve();
      }).catch(error => reject(error));
    });
  }

  /**
  * @override
  * @returns {Promise<{prefix: string, key: string, user: string, host: string}>} Returns a Promise that resolves if successful.
  */
  GetPublicKey() {
    return new Promise((resolve, reject) => {
      this.ExecuteScript_(`cat ${this.publicKeyFilepath_}`).then(output => {
        let parts = output.trim().split(' ');
        let prefix = parts[0];
        let key = parts[1];

        let otherParts = parts[2].split('@');
        let user = otherParts[0];
        let host = otherParts[1];

        let k = {
          prefix: prefix,
          key: key,
          user: user,
          host: host
        };

        resolve(k);
      }).catch(error => reject(`Failed to get public key: ${error}.`));
    });
  }

  /**
  * @override
  * Get a list of authorized keys.
  * @returns {Promise<Array<{prefix: string, key: string, user: string, host: string}>>} Returns a Promise that resolves if successful.
  */
  GetAuthorizedKeys() {
    return new Promise((resolve, reject) => {
      this.ExecuteScript_(`cat ${this.authorizedKeysFilepath_}`).then(output => {
        let delimiter = 'ssh-rsa';
        let lines = output.trim().split(delimiter).filter(x => x && x != '' && x.trim() != '').map(x => x.trim());
        let authKeys = [];

        lines.forEach(l => {
          let parts = l.split(' ');
          let key = parts[0];

          let otherParts = parts[1].split('@');
          let user = otherParts[0];
          let host = otherParts[1];

          let k = {
            prefix: delimiter,
            key: key,
            user: user,
            host: host
          };

          authKeys.push(k);
        });

        resolve(authKeys);
      }).catch(error => reject(`Failed to get authorized keys: ${error}.`));
    });
  }

  /**
  * @override
  * Remove an authroized key. If the specified user and host are not listed in the authorized keys file, the file will remain unchanged.
  * @param {string} user 
  * @param {string} host 
  * @returns {Promise} Returns a Promise that resolves if successful. Otherwise, it returns an error. 
  */
  RemoveAuthorizedKey(user, host) {
    return new Promise((resolve, reject) => {
      this.GetAuthorizedKeys().then(authKeys => {
        let unwantedKeys = authKeys.filter(x => `${x.user}@${x.host}` == `${user}@${host}`);
        if (!unwantedKeys || unwantedKeys.length == 0) {
          resolve();
          return;
        }

        let filteredKeys = authKeys.filter(x => `${x.user}@${x.host}` != `${user}@${host}`);

        let keyStrings = filteredKeys.map(x => {
          let str = `${x.prefix} ${x.key} ${x.user}`;

          if (x.host)
            str += `@${x.host}`;

          return str;
        });

        // Escape all double-quotes (if you don't, they will NOT be preserved!)
        let text = keyStrings.join('\n');
        text = text.split('"').join('\\"');

        let cmd = `echo "${text}" > ${this.authorizedKeysFilepath_}`;

        this.ExecuteScript_(cmd).then(output => {
          resolve();
        }).catch(error => reject(`Failed to remove authorized key: ${error}.`));
      }).catch(error => reject(`Failed to remove authorized key: ${error}`));
    });
  }

  /**
   * @override
   * @returns {Promise} Returns a Promise that resolves if successful.
   */
  RestartSshService() {
    return new Promise((resolve, reject) => {
      this.ExecuteScript_(this.stopSshServiceCmd_).then(stopped => {
        this.ExecuteScript_(this.startSshServiceCmd_).then(started => {
          resolve();
        }).catch(error => reject(`Failed to restart ssh service: failed to start ssh service: ${error}.`));
      }).catch(error => reject(`Failed to restart ssh service: failed to stop ssh service: ${error}.`));
    });
  }

  /**
   * @override
   * @returns {Promise<string>} Returns a Promise that resolves if successful.
   */
  StatusOfSshService() {
    return new Promise((resolve, reject) => {
      this.ExecuteScript_(this.statusSshCmd_).then(output => {
        resolve(output);
      }).catch(error => reject(`Failed to check status of ssh service: ${error}`));
    });
  }

  /**
   * @override
   * Check the state of the public key on the remote machine. State will be either: dne, match, or stale.
   * @param {SshRemote} remoteSsh 
   * @returns {Promise<string>} Returns a Promise that resolves if successful.
   */
  KeyStateIn(remoteSsh) {
    return new Promise((resolve, reject) => {
      this.GetPublicKey().then(pubKey => {
        remoteSsh.GetAuthorizedKeys().then(authKeys => {
          let correspondingKeys = authKeys.filter(x => `${x.user}@${x.host}` == `${pubKey.user}@${pubKey.host}`);
          if (!correspondingKeys || correspondingKeys.length == 0) {
            resolve('dne');
            return;
          }

          let remotePubKey = correspondingKeys[0];

          if (pubKey.key == remotePubKey.key) {
            resolve('match');
            return;
          }

          resolve('stale');
        }).catch(error => reject(`Failed to check key state: ${error}.`));
      }).catch(error => reject(`Failed to check key state: ${error}.`));
    });
  }

  /**
   * @override
   * @param {SshRemote} remoteSsh 
   * @returns {Promise<boolean>} Returns a Promise that resolves if successful.
   */
  RequiresPasswordTo(remoteSsh) {
    return new Promise((resolve, reject) => {
      let testOutput = 'Hello';
      let testCommand = `echo ${testOutput}`;
      this.executor_.Execute('ssh', [`${remoteSsh.user_}@${remoteSsh.host_}`, testCommand]).then(output => {
        if (output.stderr && output.stderr.includes('Permission denied')) {
          resolve(true);
          return;
        }

        resolve(false);
      }).catch(error => reject(`Failed to check if password is required: ${error}`));
    });
  }

  /**
   * @override
   * Set up passwordless login between two machines.
   * @param {SshRemote} remoteSsh 
   * @param {boolean} overwriteExistingPubKey
   * @returns {Promise} Returns a Promise that resolves if successful.
   */
  SetupPasswordlessLoginWith(remoteSsh, overwriteExistingPubKey) {
    return new Promise((resolve, reject) => {
      this.PublicKeyFileExists().then(pubKeyExists => {
        if (pubKeyExists) {
          if (overwriteExistingPubKey) {
            this.GenerateSshKey().then(keyGenSuccessful => {
              this.KeyStateIn(remoteSsh).then(keyState => {
                if (keyState == 'dne') {
                  this.CopyPublicKeyTo(remoteSsh).then(copySuccessful => {
                    remoteSsh.RestartSshService().then(restarted => {
                      this.RequiresPasswordTo(remoteSsh).then(requiresPassword => {
                        if (requiresPassword) {
                          reject(`Failed to set up passwordless login: password is still required for: ${remoteSsh.user_}@${remoteSsh.host_}.`);
                          return;
                        }

                        resolve();
                      }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                    }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                  }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                }
                else if (keyState == 'stale') {
                  remoteSsh.RemoveAuthorizedKey(this.user_, this.host_).then(keyRemoved => {
                    this.CopyPublicKeyTo(remoteSsh).then(copySuccessful => {
                      remoteSsh.RestartSshService().then(restarted => {
                        this.RequiresPasswordTo(remoteSsh).then(requiresPassword => {
                          if (requiresPassword) {
                            reject(`Failed to set up passwordless login: password is still required for: ${remoteSsh.user_}@${remoteSsh.host_}.`);
                            return;
                          }

                          resolve();
                        }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                      }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                    }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                  }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                }
                else if (keyState == 'match') {
                  resolve();
                  return;
                }
              }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
            }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
          }
          else {
            this.KeyStateIn(remoteSsh).then(keyState => {
              if (keyState == 'dne') {
                this.CopyPublicKeyTo(remoteSsh).then(copySuccessful => {
                  remoteSsh.RestartSshService().then(restarted => {
                    this.RequiresPasswordTo(remoteSsh).then(requiresPassword => {
                      if (requiresPassword) {
                        reject(`Failed to set up passwordless login: password is still required for: ${remoteSsh.user_}@${remoteSsh.host_}.`);
                        return;
                      }

                      resolve();
                    }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                  }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
              }
              else if (keyState == 'stale') {
                remoteSsh.RemoveAuthorizedKey(this.user_, this.host_).then(keyRemoved => {
                  this.CopyPublicKeyTo(remoteSsh).then(copySuccessful => {
                    remoteSsh.RestartSshService().then(restarted => {
                      this.RequiresPasswordTo(remoteSsh).then(requiresPassword => {
                        if (requiresPassword) {
                          reject(`Failed to set up passwordless login: password is still required for: ${remoteSsh.user_}@${remoteSsh.host_}.`);
                          return;
                        }

                        resolve();
                      }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                    }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                  }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
              }
              else if (keyState == 'match') {
                resolve();
                return;
              }
            }).catch(error => reject(`Failed to set up passwrodless login: ${error}.`));
          }
        }
        else {
          this.GenerateSshKey().then(keyGenSuccessful => {
            this.KeyStateIn(remoteSsh).then(keyState => {
              if (keyState == 'dne') {
                this.CopyPublicKeyTo(remoteSsh).then(copySuccessful => {
                  remoteSsh.RestartSshService().then(restarted => {
                    this.RequiresPasswordTo(remoteSsh).then(requiresPassword => {
                      if (requiresPassword) {
                        reject(`Failed to set up passwordless login: password is still required for: ${remoteSsh.user_}@${remoteSsh.host_}.`);
                        return;
                      }

                      resolve();
                    }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                  }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
              }
              else if (keyState == 'stale') {
                remoteSsh.RemoveAuthorizedKey(this.user_, this.host_).then(keyRemoved => {
                  this.CopyPublicKeyTo(remoteSsh).then(copySuccessful => {
                    remoteSsh.RestartSshService().then(restarted => {
                      this.RequiresPasswordTo(remoteSsh).then(requiresPassword => {
                        if (requiresPassword) {
                          reject(`Failed to set up passwordless login: password is still required for: ${remoteSsh.user_}@${remoteSsh.host_}.`);
                          return;
                        }

                        resolve();
                      }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                    }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                  }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
                }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
              }
              else if (keyState == 'match') {
                resolve();
                return;
              }
            }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
          }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
        }
      }).catch(error => reject(`Failed to set up passwordless login: ${error}.`));
    });
  }

  /**
   * @param {string} user 
   * @param {string} host 
   * @param {string} password 
   * @param {string} stopSshServiceCmd 
   * @param {string} startSshServiceCmd 
   * @param {string} statusSshCmd 
   * @returns {SshRemote} Returns an SshRemote object. If arguments are invalid, it returns null.
   */
  static Create(user, host, password, stopSshServiceCmd, startSshServiceCmd, statusSshCmd) {
    if (!user || !host || !password || !stopSshServiceCmd || !startSshServiceCmd || !statusSshCmd)
      return null;

    return new SshRemote(user, host, password, stopSshServiceCmd, startSshServiceCmd, statusSshCmd);
  }
}

//-----------------------------
// EXPORTS

exports.SshLocal = SshLocal.Create;
exports.SshRemote = SshRemote.Create;