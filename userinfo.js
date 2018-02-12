let EXECUTE = require('./execute.js').Execute;
let ERROR = require('./error.js').Error;
let OS = require('os');

//---------------------------------------
// USERINFO

class UserInfo {
  static CurrentUser() {
    return new Promise((resolve, reject) => {
      let username = OS.userInfo().username;

      EXECUTE.Local('id', [username]).then(output => {
        if (output.stderr) {
          reject(output.stderr);
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
      }).catch(reject);
    });
  }

  static OtherUser(username) {
    return new Promise((resolve, reject) => {
      let error = ERROR.StringError(username);
      if (error) {
        reject(`username is ${invalidType}`);
        return;
      }

      EXECUTE.Local('id', [username]).then(output => {
        if (output.stderr) {
          if (output.stderr.toLowerCase().includes('no such user'))
            reject(`No such user: ${username}`);
          else
            reject(output.stderr);
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
      }).catch(reject);
    });
  }
}

//--------------------------------
// EXPORTS

exports.UserInfo = UserInfo;