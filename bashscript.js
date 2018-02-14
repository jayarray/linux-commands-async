let FILE = require('./file.js').File;
let REMOVE = require('./remove.js').Remove;
let EXECUTE = require('./execute.js').Execute;

//----------------------------------------
// BASH SCRIPT

class BashScript {
  static Create(path, content) {
    return new Promise((resolve, reject) => {
      FILE.Create(path, `#!/bin/bash\n${content}`).then(success => {
        FILE.MakeExecutable(path).then(success => {
          resolve(true);
        }).catch(reject);
      }).catch(reject);
    });
  }

  static Execute(path, content) {
    return new Promise((resolve, reject) => {
      BashScript.Create(path, content).then(success => {
        EXECUTE.Local(path, []).then(output => {
          resolve(output.stdout);
          REMOVE.File(path).then(success => {
          }).catch(reject);
        }).catch(reject);
      }).catch(reject);
    });
  }
}

//-----------------------------
// EXPORTS

exports.BashScript = BashScript;