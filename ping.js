const VALIDATE = require('./validate.js');

//----------------------------------------
// PING

class Ping {
  static IsReachable(host, executor) {
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

  static ReachableDict(hosts, executor) { // For pinging multiple hosts
    let hostsError = VALIDATE.IsArray(hosts);
    if (hostsError)
      return Promise.reject(`Failed to ping hosts: host is ${hostsError}`);

    if (!executor)
      return Promise.reject(`Failed to ping hosts: Executor is required`);

    return new Promise((resolve, reject) => {
      let actions = hosts.map(host => Ping.IsReachable(host, executor));
      Promise.all(actions).then(results => {
        let reachableDict = {};
        for (let i = 0; i < results.length; ++i) {
          let currHost = hosts[i];
          let currResult = results[i];
          reachableDict[currHost] = currResult;
        }
        resolve(reachableDict);
      }).catch(error => `Failed to ping hosts: ${error}`);
    });
  }
}

//--------------------------------
// EXPORTS

exports.Ping = Ping;