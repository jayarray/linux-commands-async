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
      if (error) {
        reject(`gid ${error}`);
        return;
      }

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

  static Get(id) {
    // Return group obj
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
      if (error) {
        reject(`uid ${error}`);
        return;
      }

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

  static Get(id) {
    // Return user obj
  }
}

//-------------------------------------
// COMMANDS

class Commands {
  static W() { // displays users currently logged in and their process along with load averages.
    return new Promise((resolve, reject) => {
      EXECUTE.Local('w', []).then(output => {
        if (output.stderr) {
          reject(output.stderr);
          return;
        }

        let lines = output.stdout.trim().split('\n')
          .filter(line => line && line != '' && line.trim() != '')
          .map(line => line.trim());

        // System info
        let sysLine = lines[0];
        let firstParts = sysLine.split(',')[0].split(' ')
          .filter(part => part && part != '' && part.trim() != '')
          .map(part => part.trim());

        let i = 0;
        let timestamp = firstParts[0];
        let uptime = firstParts[2];

        // Number of users
        let secondParts = sysLine.split(',')[1].split(' ')
          .filter(part => part && part != '' && part.trim() != '')
          .map(part => part.trim());
        let userCount = parseInt(secondParts[0]);

        let thirdParts = sysLine.split(',')
          .slice(2).join(',')
          .split(':')[1]
          .split(',')
          .filter(part => part && part != '' && part.trim() != '')
          .map(part => part.trim());

        let loadAverages = [];
        thirdParts.forEach(part => loadAverages.push(parseFloat(part)));

        let info = {
          timestamp: timestamp,
          uptime: uptime,
          userCount: userCount,
          loadAverages: loadAverages
        };

        // Headers
        let headersLine = lines[1];

        let headers = headersLine.split(' ')
          .filter(part => part && part != '' && part.trim() != '')
          .map(part => part.trim());

        // User info
        let users = [];

        let userLines = lines.slice(2)
          .filter(line => line && line != '' && line.trim() != '')
          .map(line => line.trim());

        userLines.forEach(line => {
          let parts = line.split(' ')
            .filter(part => part && part != '' && part.trim() != '')
            .map(part => part.trim());

          let name = parts[0];
          let tty = parts[1];
          let group = parts[2];
          let login = parts[3];
          let idle = parts[4];
          let jcpu = parts[5];
          let pcpu = parts[6];
          let what = parts.slice(7).join(' ');

          let user = {
            name: name,
            tty: tty,
            group: group,
            login: login,
            idle: idle,
            jcpu: jcpu,
            pcpu: pcpu,
            what: what,
            info: info
          }
          users.push(user);
        });
        resolve(users);
      }).catch(reject);
    });
  }

  static Ps() { // Gives status of running processes with a unique id called PID and other fields.
    return new Promise((resolve, reject) => {
      let fields = ['user', 'uid', 'gid', 'tty', 'start', 'etime', 'pid', 'ppid', 'pgid', 'tid', 'tgid', 'sid', 'ruid', 'rgid', 'euid', 'suid', 'fsuid', 'comm'];

      let args = ['xao', fields.join(',')];
      console.log(`CMD: ${args.join(' ')}`);
      EXECUTE.Local('ps', args).then(output => {
        if (output.stderr) {
          reject(output.stderr);
          return;
        }

        // Get lines
        let lines = output.stdout.trim().split('\n')
          .filter(line => line && line != '' && line.trim() != '')
          .map(line => line.trim());

        let headers = lines[0].split(' ')
          .filter(line => line && line != '' && line.trim() != '')
          .map(line => line.trim());

        // Parse lines into process objects
        let processes = [];

        lines.slice(1).forEach(line => {
          let parts = line.split(' ')
            .filter(part => part && part != '' && part.trim() != '')
            .map(part => part.trim());

          let process = {};
          for (let i = 0; i < fields.length; ++i) {
            let currField = fields[i];
            let currValue = parts[i];
            if (currField.endsWith('id'))
              process[currField] = parseInt(currValue);
            else
              process[currField] = currValue;
          }
          processes.push(process);
        });
        resolve(processes);
      }).catch(reject);
    });
  }

  static Kill(pid) { // Kills a process
    return new Promise((resolve, reject) => {
      let error = Error.IdNumberError(pid)
      if (error) {
        reject(error);
        return;
      }

      let args = ['-9', pid];
      EXECUTE.Local('kill', args).then(output => {
        if (output.stderr) {
          reject(output.stderr);
          return;
        }
        resolve(true);
      }).catch(reject);
    });
  }

  static Uptime() { // Displays uptime info
    return new Promise((resolve, reject) => {
      EXECUTE.Local('uptime', []).then(output => {
        if (output.stderr) {
          reject(output.stderr);
          return;
        }

        // System info
        let line = output.stdout.trim();
        let firstParts = line.split(',')[0].split(' ')
          .filter(part => part && part != '' && part.trim() != '')
          .map(part => part.trim());

        let i = 0;
        let timestamp = firstParts[0];
        let uptime = firstParts[2];

        // Number of users
        let secondParts = line.split(',')[1].split(' ')
          .filter(part => part && part != '' && part.trim() != '')
          .map(part => part.trim());
        let userCount = parseInt(secondParts[0]);

        let thirdParts = line.split(',')
          .slice(2).join(',')
          .split(':')[1]
          .split(',')
          .filter(part => part && part != '' && part.trim() != '')
          .map(part => part.trim());

        let loadAverages = [];
        thirdParts.forEach(part => loadAverages.push(parseFloat(part)));

        let info = {
          timestamp: timestamp,
          uptime: uptime,
          userCount: userCount,
          loadAverages: loadAverages
        };
        resolve(info);
      }).catch(reject);
    });
  }

  static WhoAmI() { // Returns current username
    return new Promise((resolve, reject) => {
      EXECUTE.Local('whoami', []).then(output => {
        if (output.stderr) {
          reject(output.stderr);
          return;
        }
        resolve(output.stdout.trim());
      }).catch(reject);
    });
  }

  static Free() { // Displays info regarding memory and resources (i.e. memory, swap, etc)
    return new Promise((resolve, reject) => {
      EXECUTE.Local('free', []).then(output => {
        if (output.stderr) {
          reject(output.stderr);
          return;
        }

        // Get lines
        let lines = output.stdout.trim().split('\n')
          .filter(line => line && line != '' && line.trim() != '')
          .map(line => line.trim());

        // Get info objects
        let findIt = function (strings, prefix) {
          for (let i = 0; i < strings.length; ++i) {
            let currStr = strings[i];
            if (currStr.startsWith(pattern))
              return currStr;
          }
          return null;
        };

        // Create memory object
        let hasBuffersCacheLine = lines.find(findIt(lines, '-/+ buffers/cache:')) != null;

        let memLine = lines.find(findIt(lines, 'Mem:'));
        let memParts = memLine.split(' ')
          .filter(part => part && part != '' && part.trim() != '')
          .map(part => part.trim());

        let memObj = {};
        memObj.total = parseInt(parts[1].trim());
        memObj.used = parseInt(parts[2].trim());
        memObj.free = parseInt(parts[3].trim());
        memObj.shared = parseInt(parts[4].trim());

        if (hasBuffersCacheLine) {
          memObj.buffers = parseInt(parts[5].trim());
          memObj.cached = parseInt(parts[6].trim());
        }
        else {
          memObj.buffCache = parseInt(parts[5].trim());
          memObj.available = parseInt(parts[6].trim());
        }

        // Create swap object
        let swapLine = lines.find(findIt(lines, 'Swap:'));
        let swapParts = swapLine.split(' ');

        let swapObj = {};

        let buffLine = lines.find(findIt(lines, '-/+ buffers/cache:'));
        let buffersCache = {};



        let infos = [];

        lines.slice(1).forEach(line => {
          let parts = line.split(' ')
            .filter(part => part && part != '' && part.trim() != '')
            .map(part => part.trim());

          let name = parts[0].trim().replace(':', '');
          let total = parseInt(parts[1].trim());
          let used = parseInt(parts[2].trim());
          let free = parseInt(parts[3].trim());
          let shared = parseInt(parts[4].trim());
          let buffcache = parseInt(parts[5].trim());
          let available = parseInt(parts[6].trim());

          let info = {
            name: name,
            total: total,
            used: used,
            free: free,
            shared: shared,
            buffcache: buffcache,
            available: available
          };

          infos.push(info);
        });
        resolve(infos);
      }).catch(reject);
    });
  }

  static Top() { // Shows CPU processes (1 iteration)
    // top -n 1
  }

  static Lsof(user) { // Displays all files opened by user
    // lsof -u user
  }

  static Last(user) { // 
    // last [username]
  }

  static WhereIs(cmd) {  // Locate binary, sources and manual pages of the command
    // whereis name
  }

  static Alias(name, cmdString) { // Add alias
    // alias identifier='command';
  }

  static Unalias(name) { // Remove alias
    // unalias name
  }

  static Ifconfig() { // Check active network interfaces
    // ifconfig
  }
}

//-------------------------------------
// ADMIN
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

  static Uptime() {
    return Commands.Uptime();
  }

  static Processes() {
    return Commands.Ps();
  }

  static Kill(pid) {
    return Commands.Kill(pid);
  }

  static WhoAmI() {
    return Commands.WhoAmI();
  }

  static MemoryCheck() {
    return Commands.Free();
  }

  static LoggedIn() {  // Same as 'w' command
    return Commands.W();
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

  static IdNumberError(id) {
    let idMin = 0;
    if (!Number.isInteger(id) || id < idMin)
      return `must be greater than or equal to ${idMin}`;
    return null;
  }

  static IdStringError(id) {
    let error = Error.StringError(id);
    if (error)
      return error;
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
// TEST

Admin.MemoryCheck().then(infos => {

  console.log(`INFO:\n${JSON.stringify(infos)}`);

}).catch(error => {
  console.log(`ERROR: ${error}`);
})
return;


//------------------------------------
// EXPORTS

exports.Admin = Admin;
exports.Error = Error;