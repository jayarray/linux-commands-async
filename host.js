let VALIDATE = require('./validate.js');

//---------------------------------------

/**
 * Get info about current host.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise<{hostname: string, ipaddress: string}>} Returns a promise. If it resolves, it returns an object. Else, it returns an error.
 */
function Info(executor) {
  if (!executor) {
    return Promise.reject(`Failed to get host info: Executor is required`);
  }

  return new Promise((resolve, reject) => {
    let cmdList = ['hostname', 'hostname -i'];

    executor.Execute(cmdList.join('\n'), []).then(output => {
      if (output.stderr) {
        reject(`Failed to get host info: ${output.stderr}`);
        return;
      }

      let lines = output.stdout.trim().split()
        .filter(line => line && line != '' && line.trim() != '')
        .map(line => line.trim());

      resolve({
        hostname: lines[0],
        ipaddress: lines[1]
      });
    }).catch(error => `Failed to get host info: ${error}`);
  });
}

//-------------------------------
// EXPORTS

exports.Info = Info;