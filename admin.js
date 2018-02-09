let EXECUTE = require('./execute.js').Execute;

//-------------------------------------
// GROUPS

class Groups {
  static All() {
    return new Promise((resolve, reject) => {
      EXECUTE.Local('cat', ['/etc/group']).then(output => {
        if (output.stderr) {
          reject(output.stderr);
          return;
        }

        let lines = output.stdout.trim()
          .split('\n')
          .filter(line => line && line != '' && line.trim() != '')
          .map(line => line.trim());

        let groups = [];
        lines.forEach(line => {
          let parts = line.split(':');
          let name = parts[0];
          let id = parts[2];

          let users = [];
          if (parts[3])
            users = parts[3].split(',');

          let group = { name: name, id: id, users: users };
          groups.append(group);
        });
        resolve(groups);
      }).catch(reject);
    });
  }

  static Exists(gid) {
    return new Promise((resolve, reject) => {
      let error = Error.IdError(gid);
      if (error)
        return `gid ${error}`;

      Groups.All().then(groups => {
        for (let i = 0; i < groups.length; ++i) {
          let currGroup = groups[i];
          if ((typeof gid == 'string' && currGroup.name == gid) || (Number.isInteger(gid) && currGroup.id == gid)) {
            resolve(true);
            return;
          }
        }
        resolve(false);
      }).catch(reject);
    });
  }
}

//-------------------------------------
// USERS

class Users {
  static All() {
    return new Promise((resolve, reject) => {
      EXECUTE.Local('cat', ['/etc/passwd']).then(output => {
        if (output.stderr) {
          reject(output.stderr);
          return;
        }

        let lines = output.stdout.trim()
          .split('\n')
          .filter(line => line && line != '' && line.trim() != '')
          .map(line => line.trim());

        let users = [];
        lines.forEach(line => {
          let parts = line.split(':');
          let name = parts[0];
          let id = parts[2];
          let info = line.slice(3).join(''); // Other info

          let user = { name: name, id: id, info: info };
          users.append(user);
        });
        resolve(groups);
      }).catch(reject);
    });
  }

  static Exists(uid) {
    return new Promise((resolve, reject) => {
      let error = Error.IdError(uid);
      if (error)
        return `uid ${error}`;

      Users.All().then(users => {
        for (let i = 0; i < users.length; ++i) {
          let currUser = users[i];
          if ((typeof uid == 'string' && currUser.name == uid) || (Number.isInteger(uid) && currUser.id == uid)) {
            resolve(true);
            return;
          }
        }
        resolve(false);
      }).catch(reject);
    });
  }
}

//-------------------------------------

class Admin {
  static Groups() {
    return Groups.All();
  }

  static GroupExists(gid) {
    return Groups.Exists(gid);
  }

  static Users() {
    return Users.All();
  }

  static UserExists(uid) {
    return Users.Exists(uid);
  }
}

//-----------------------------------
// ERROR

class Error {
  static NullOrUndefined(o) {
    if (o === undefined)
      return 'undefined';
    else if (o == null)
      return 'null';
    else
      return null;
  }

  static StringError(s) {
    let error = Error.NullOrUndefined(s);
    if (error)
      return error;

    if (typeof s != 'string')
      return 'not a string';
    else if (s == '')
      return 'empty';
    else if (s.trim() == '')
      return 'whitespace'
    else
      return null;
  }

  static IdError(id) {
    let error = Error.NullOrUndefined(id);
    if (error)
      return error;


    // Check if name string
    if (typeof id == 'string') {
      error = Error.StringError(id);
      if (error)
        return error;
      return null;
    }

    // Check if id number
    let idMin = 0;
    if (Number.isInteger(id)) {
      if (id < idMin)
        return `must be greater than or equal to ${idMin}`;
      return null;
    }

    return `must be a string or an integer greater than or equal to ${idMin}`;
  }
}

//------------------------------------
// EXPORTS

exports.Admin = Admin;
exports.Error = Error;