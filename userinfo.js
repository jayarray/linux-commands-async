let VALIDATE = require('./validate.js');

//---------------------------------------
// USERINFO

class UserInfo {
  static WhoAmI(executor) {
    if (!executor)
      return Promise.reject(`Failed to identify who you are: Executor is required`);

    return new Promise((resolve, reject) => {
      executor.Execute('whoami', []).then(output => {
        if (output.stderr) {
          reject(`Failed to identify who you are: ${output.stderr}`);
          return;
        }
        resolve(output.stdout.trim());
      }).catch(error => `Failed to identify who you are: ${error}`);
    });
  }

  static CurrentUser(executor) {
    if (!executor)
      return Promise.reject(`Failed to identify current user: Executor is required`);

    return new Promise((resolve, reject) => {
      executor.Execute('id', []).then(output => {
        if (output.stderr) {
          reject(`Failed to identify current user: ${output.stderr}`);
          return;
        }

        let outStr = output.stdout.trim();
        let parts = outStr.split(' ');

        // UID
        let uidParts = parts[0].split('=')[1];
        let uid = parseInt(uidParts.split('(')[0]);
        let username = uidParts.split('(')[1].replace(')', '');

        // GID
        let gidParts = parts[1].split('=')[1];
        let gid = parseInt(gidParts.split('(')[0]);

        // GROUPS
        let groupsParts = parts[2].split('=')[1].split(',');

        let groups = [];
        groupsParts.forEach(gStr => {
          let groupId = parseInt(gStr.split('(')[0]);
          let groupName = gStr.split('(')[1].slice(0, -1);
          groups.push({ gid: groupId, name: groupName });
        });

        let info = {
          username: username,
          uid: uid,
          gid: gid,
          groups: groups
        };

        resolve(info);
      }).catch(error => `Failed to identify current user: ${error}`);
    });
  }

  static OtherUser(username, executor) {
    let usernameError = VALIDATE.IsStringInput(username);
    if (usernameError)
      return Promise.reject(`Failed to identify other user: username is ${usernameError}`);

    if (!executor)
      return Promise.reject(`Failed to identify other user: Executor is required`);

    return new Promise((resolve, reject) => {
      executor.Execute('id', [username], executor).then(output => {
        if (output.stderr) {
          if (output.stderr.toLowerCase().includes('no such user'))
            reject(`Failed to identify other user: No such user: ${username}`);
          else
            reject(`Failed to identify other user: ${output.stderr}`);
          return;
        }

        let outStr = output.stdout.trim();
        let parts = outStr.split(' ');

        // UID
        let uidParts = parts[0].split('=')[1];
        let uid = parseInt(uidParts.split('(')[0]);

        // GID
        let gidParts = parts[1].split('=')[1];
        let gid = parseInt(gidParts.split('(')[0]);

        // GROUPS
        let groupsParts = parts[2].split('=')[1].split(',');

        let groups = [];
        groupsParts.forEach(gStr => {
          let groupId = parseInt(gStr.split('(')[0]);
          let groupName = gStr.split('(')[1].slice(0, -1);
          groups.push({ gid: groupId, name: groupName });
        });

        let info = {
          username: username,
          uid: uid,
          gid: gid,
          groups: groups
        };
        resolve(info);
      }).catch(error => `Failed to identify other user: ${error}`);
    });
  }
}

//--------------------------------
// EXPORTS

exports.UserInfo = UserInfo;