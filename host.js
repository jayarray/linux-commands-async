let VALIDATE = require('./validate.js');

//---------------------------------------

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