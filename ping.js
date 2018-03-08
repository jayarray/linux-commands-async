const VALIDATE = require('./validate.js');

//----------------------------------------
// PING

/**
 * Check if host is reachable.
 * @param {string} host Host name
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise<boolean>} Returns a promise. If it resolves, it returns a boolean value. Else, it rejects and returns an error.
 */
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