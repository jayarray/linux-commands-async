const VALIDATE = require('./validate.js');

//----------------------------------------
// PING

function IsReachable(host, executor) {
  let hostError = VALIDATE.IsStringInput(host);
  if (hostError)
    return Promise.reject(`Failed to ping host: host is ${hostError}`);

  if (!executor)
    return Promise.reject(`Failed to ping host: Executor is required`);

  return new Promise((resolve, reject) => {
    executor.Execute('ping', ['-c', 1, host]).then(output => {
      if (output.stderr) {
        resolve(false);
        return;
      }
      resolve(true);
    }).catch(error => `Failed to ping host: ${error}`);
  });
}

//--------------------------------
// EXPORTS

exports.IsReachable = IsReachable;