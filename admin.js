let EXECUTE = require('./execute.js').Execute;
let ERROR = require('./error.js').Error;

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
          groups.push(group);
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
          let info = line.substring(3); // Other info

          let user = { name: name, id: id, info: info };
          users.push(user);
        });
        resolve(users);
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

//-----------------------------------
// HELPERS

// UPTIME (helper functions)

function parseUptimeString(string) {
  // System info
  let firstParts = string.split(',')[0].split(' ')
    .filter(part => part && part != '' && part.trim() != '')
    .map(part => part.trim());

  let timestamp = firstParts[0];
  let uptime = firstParts[2];

  // Number of users
  let secondParts = string.split(',')[1].split(' ')
    .filter(part => part && part != '' && part.trim() != '')
    .map(part => part.trim());
  let userCount = parseInt(secondParts[0]);

  let thirdParts = string.split(',')
    .slice(2).join(',')
    .split(':')[1]
    .split(',')
    .filter(part => part && part != '' && part.trim() != '')
    .map(part => part.trim());

  // Load averages
  let loadAverages = [];
  thirdParts.forEach(part => loadAverages.push(parseFloat(part)));

  let obj = {
    timestamp: timestamp,
    uptime: uptime,
    userCount: userCount,
    loadAverages: loadAverages
  };
  return obj;
}

// FREE (helper functions)

function getHeaders(string) {
  let headers = {};

  let startIndex = 0;
  let endIndex = 0;
  let char = string.charAt(endIndex);
  let str = '';

  while (startIndex < string.length && endIndex < string.length) {
    if (char.trim() == '') {
      let strTrimmed = str.trim();
      if (strTrimmed) {
        headers[string.substring(startIndex, endIndex)] = { start: startIndex, end: endIndex - 1 };
        startIndex = endIndex;
        str = '';
      }
      else {
        startIndex += 1;
        endIndex += 1;
      }
    }
    else {
      str += char;
      endIndex += 1;
    }
    char = string.charAt(endIndex);
  }

  if (str)
    headers[string.substring(startIndex, endIndex)] = { start: startIndex, end: endIndex - 1 };
  return headers;
}

function freeOutputHasValues(line, headers) {
  let hasValues = {};

  Object.keys(headers).forEach(key => {
    let indexes = headers[key];
    let string = getStringFromEndIndex(line, indexes.end);

    if (!string)
      hasValues[key] = false;
    else
      hasValues[key] = true;
  });
  return hasValues;
}

function getStringFromEndIndex(line, endIndex) {
  let startIndex = endIndex;

  let char = line.charAt(startIndex);
  while (char.trim() != '') {
    startIndex -= 1;
    char = line.charAt(startIndex);
  }
  return line.substring(startIndex, endIndex + 1);
}

function getStringFromStartIndex(line, startIndex) {
  let endIndex = startIndex;

  let char = line.charAt(endIndex);
  while (char.trim() != '') {
    endIndex += 1;
    char = line.charAt(endIndex);
  }
  return line.substring(startIndex, endIndex + 1);
}

function getFreeObject(line, headers) {
  let name = line.split(':')[0].trim();

  let hasValues = freeOutputHasValues(line, headers);

  let parts = line.split(' ')
    .filter(part => part && part != '' && part.trim() != '')
    .map(part => part.trim());

  let partIndex = 1;
  let freeObj = { name: name };

  Object.keys(headers).forEach(field => {
    let name = field;
    if (field.includes('/'))
      name = field.replace('/', '');

    if (hasValues[field])
      freeObj[name] = parseInt(parts[partIndex]);
    else
      freeObj[name] = null;
    partIndex += 1;
  });
  return freeObj;
}

// LSOF (helper functions)

function lsofOutputHasValues(line, headers) {
  let hasValues = {};

  Object.keys(headers).forEach(key => {
    let indexes = headers[key];

    let string = '';
    if (key == 'NAME')
      string = line.substring(indexes.startIndex);
    else
      string = getStringFromEndIndex(line, indexes.end);

    if (!string)
      hasValues[key] = false;
    else
      hasValues[key] = true;
  });
  return hasValues;
}

function getLsofObject(line, headers) {
  let name = line.split(':')[0].trim();

  let hasValues = lsofOutputHasValues(line, headers);

  let parts = line.split(' ')
    .filter(part => part && part != '' && part.trim() != '')
    .map(part => part.trim());

  let partIndex = 0;
  let lsofObj = {};

  Object.keys(headers).forEach(field => {
    let name = field;
    if (field.includes('/'))
      name = field.replace('/', '').toLowerCase();

    if (hasValues[field])
      freeObj[name] = parseInt(parts[partIndex]);
    else
      freeObj[name] = null;
    partIndex += 1;
  });
  return freeObj;
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

        // Uptime info
        let uptimeStr = lines[0];
        let uptimeObj = parseUptimeString(uptimeStr);

        // Headers
        let headersLine = lines[1];
        let headers = getHeaders(headersLine);

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

        // Get headers
        let headers = getHeaders(lines[0]);

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
        let uptimeObj = parseUptimeString(output.stdout);
        resolve(uptimeObj);
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
      EXECUTE.Local('free', ['-t']).then(output => {
        if (output.stderr) {
          reject(output.stderr);
          return;
        }

        // Get lines
        let lines = output.stdout.split('\n')
          .filter(line => line && line != '' && line.trim() != '');

        // Get headers (with indexes)
        let headerLine = lines[0];
        let headers = getHeaders(headerLine);

        // Create objects
        let objects = [];
        lines.slice(1).forEach(line => {
          let o = getFreeObject(line, headers);
          objects.push(o);
        });
        resolve(objects);
      }).catch(reject);
    });
  }

  static Top() { // Shows CPU processes (1 iteration)
    return new Promise((resolve, reject) => {
      EXECUTE.Local('top', ['-n', 1]).then(output => {
        if (output.stderr) {
          reject(output.stderr);
          return;
        }

        let lines = output.stdout.split('\n')
          .filter(line => line && line != '' && line.trim() != '')
          .map(line => line.trim());

        // Uptime str
        let uptimeStr = lines[0].replace('top -', '');
        let uptimeObj = parseUptimeString(uptimeStr);

        // Tasks str
        let tasksStr = lines[1].replace('Tasks:', '').trim();
        let taskParts = tasksStr.split(',');

        let tasks = {};
        taskParts.forEach(part => {
          let parts = part.split(' ').map(p => p.trim());
          let int = parseInt(parts[0].trim());
          let name = parts[1].trim();
          tasks[name] = int;
        });

        // cpu str
        let cpuStr = lines[2].replace('%Cpu(s):', '');
        let cpuParts = cpuStr.split(',');

        let cpu = {};
        cpuParts.forEach(part => {
          let parts = part.split(' ').map(p => p.trim());
          let float = parseFloat(parts[0].trim());
          let name = parts[1].trim();
          cpu[name] = float
        });

        // mem str
        let memStr = lines[3].split(':')[1].trim();
        let memParts = memStr.split(',');

        let mem = {};
        memParts.forEach(part => {
          let parts = part.split(' ').map(p => p.trim());
          let float = parseInt(parts[0].trim());

          let name = parts[1].trim();
          if (name.includes('/'))
            name = name.replace('/', '');

          mem[name] = float
        });

        // swap str
        let swapStr = lines[4].split(':')[1].trim();
        let swapParts = swapStr.split(',');

        let swap = {};
        for (let i = 0; i < 2; ++i) {
          let currSwapPart = swapParts[i];
          let parts = currSwapPart.split(' ');
          let int = parseInt(parts[0].trim());
          let name = parts[1].trim();
          swap[name] = int;
        }

        let otherParts = swapParts[2].split('.');

        // swap: used
        let currPart = otherParts[0].trim();
        let parts = currPart.split(' ');
        let int = parseInt(parts[0].trim());
        let name = parts[1].trim();
        swap[name] = int;

        // swap: avail Mem
        currPart = otherParts[1].trim();
        parts = currPart.split(' ');
        int = parseInt(parts[0].trim());
        firstWord = parts[1].trim();
        secondWord = parts[2].trim().toLowerCase();
        name = firstWord + secondWord;
        swap[name] = int;

        // headers
        let headersStr = lines[5].trim();
        let headers = getHeaders(headersStr);

        // rows
        let processes = [];

        lines.slice(6).forEach(line => {
          let parts = line.split(' ')
            .filter(parts => part && part != '' && part.trim() != '')
            .map(part => part.trim());

          let pid = parts[0];
          let user = parts[1];
          let pr = parseInt(parts[2]);
          let ni = parseInt(parts[3]);
          let virt = parseInt(parts[4]);
          let res = parseInt(parts[5]);
          let shr = parseInt(parts[6]);
          let s = parts[7];
          let cpu = parseFloat(parts[8]);
          let mem = parseFloat(parts[9]);
          let time = parts[10];
          let command = parts[11]

          let process = {
            pid: pid,
            user: user,
            pr: pr,
            ni: ni,
            virt: virt,
            res: res,
            shr: shr,
            s: s,
            cpu: cpu,
            mem: mem,
            time: time,
            command: command
          };
          processes.push(process);
        });

        let result = {
          uptime: uptimeObj,
          tasks: tasks,
          cpu: cpu,
          mem: mem,
          swap: swap,
          processes: process
        };

        resolve(result);
      }).catch(reject);
    });
  }

  static Lsof(user) { // Displays all files opened by user
    return new Promise((resolve, reject) => {
      let error = ERROR.StringError(user);
      if (error) {
        reject(`user is ${error}`);
        return;
      }

      EXECUTE.Local('lsof', ['-u', user]).then(output => {
        if (output.stderr) {
          reject(output.stderr);
          return;
        }

        let lines = output.stdout.trim().split('\n')
          .filter(line => line && line != '' && line.trim() != '')
          .map(line => line.trim());

        // Get headers
        let headersStr = lines[0];
        let headers = getHeaders(headersStr);

        // Rows
        let results = [];

        line.slice(1).forEach(l => {
          let parts = l.split(' ')
            .filter(l => l && l != '' && l.trim() != '')
            .map(l => l.trim());

          let obj = {};
          for (let i = 0; i < parts.length; ++i) {
            let currPart = parts[i];
            if (i == 0)
              obj.command = getStringFromEndIndex(l, headers['COMMAND'].endIndex);
            else if (i == 1)
              obj.pid = parseInt(getStringFromEndIndex(l, headers['PID'].endIndex));
            else if (i == 2)
              obj.user = getStringFromEndIndex(l, headers['USER'].endIndex);
            else if (i == 3)
              obj.fd = getStringFromEndIndex(l, headers['FD'].endIndex);
            else if (i == 4)
              obj.type = getStringFromEndIndex(l, headers['TYPE'].endIndex);
            else if (i == 5)
              obj.devices = getStringFromEndIndex(l, headers['DEVICE'].endIndex).split(',').map(p => parseIntp.trim());
            else if (i == 6)
              obj.sizeoff = parseInt(getStringFromEndIndex(l, headers['SIZE/OFF'].endIndex));
            else if (i == 7)
              obj.node = parseInt(getStringFromEndIndex(l, headers['NODE'].endIndex));
            else if (i == 8)
              obj.type = l.substring(headers['NAME'].startIndex);
          }
          results.push(obj);
        });
        resolve(results);
      }).catch(reject);
    });
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

  static ProcessExists(pid) {
    return new Promise((resolve, reject) => {
      let error = ERROR.IntegerError(pid);
      if (error) {
        reject(`pid is ${error}`);
        return;
      }

      let min = 0;
      error = ERROR.BoundIntegerError(pid, min, null);
      if (error) {
        reject(error);
        return;
      }

      Processes().then(processes => {
        for (let i = 0; i < processes.length; ++i) {
          let currProcess = processes[i];
          if (currProcess.pid == pid) {
            resolve(true);
            return;
          }
        }
        resolve(false);
      }).catch(reject);
    });
  }

  static Kill(pid) {
    return new Promise((resolve, reject) => {
      Admin.ProcessExists(pid).then(exists => {
        if (!exists) {
          reject(`pid does not exist`);
        }

        Commands.Kill(pid).then(success => {
          resolve(true);
        }).catch(reject);
      }).catch(reject);
    });
  }

  static WhoAmI() {
    return Commands.WhoAmI();
  }

  static MemoryCheck() {
    return Commands.Free();
  }

  static Processes() {
    return Commands.Top();
  }

  static LoggedIn() {
    return Commands.W();
  }
}

//-----------------------------------
// ERROR

class Error {
  static IdStringError(string) {
    let error = ERROR.StringError(string);
    if (error)
      return `id is ${error}`;
    return null;
  }

  static IdNumberError(int) {
    let error = ERROR.NullOrUndefined(int);
    if (error)
      return `id is ${error}`;

    let min = 0;
    error = ERROR.BoundIntegerError(int, min, null);
    if (error)
      return error;
    return null;
  }

  static IdError(id) {
    let error = ERROR.NullOrUndefined(id);
    if (error)
      return `id is ${error}`;

    // Check if string
    if (typeof id == 'string') {
      error = Error.IdStringError(id);
      if (error)
        return error;
      return null;
    }

    // Check if number
    if (Number.isInteger(id)) {
      error = Error.IdNumberError(id);
      if (error)
        return error;
      return null;
    }

    return `id is not a valid string or integer`;
  }
}

//------------------------------------
// EXPORTS

exports.Admin = Admin;