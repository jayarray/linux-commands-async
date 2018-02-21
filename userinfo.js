let ERROR = require('./error.js');
let COMMAND = require('./command.js').Command;
let LINUX_COMMANDS = require('./linuxcommands.js');

//---------------------------------------
// USERINFO

class UserInfo {
  static WhoAmI(executor) {
    return new Promise((resolve, reject) => {
      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to identify who you are: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.WhoAmI();
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to identify who you are: ${output.stderr}`);
          return;
        }
        resolve(output.stdout.trim());
      }).catch(error => `Failed to identify who you are: ${error}`);
    });
  }

  static CurrentUser(executor) {
    return new Promise((resolve, reject) => {
      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to identify current user: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.CurrentUserInfo();
      COMMAND.Execute(cmd, [], executor).then(output => {
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
    return new Promise((resolve, reject) => {
      let usernameError = ERROR.StringValidator(username);
      if (usernameError) {
        reject(`Failed to identify other user: Username is ${usernameError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to identify other user: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.OtherUserInfo(username);
      COMMAND.Execute(cmd, [], executor).then(output => {
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