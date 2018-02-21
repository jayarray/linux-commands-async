let COMMAND = require('./command.js').Command;
let ERROR = require('./error.js');
let USERINFO = require('./userinfo.js').UserInfo;
let LINUX_COMMANDS = require('./linuxcommands.js');

//-------------------------------------
// GROUPS

class Groups {
  static All(executor) {
    return new Promise((resolve, reject) => {
      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to get all groups: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.AdminGetGroups();
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to get all groups: ${output.stderr}`);
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
          let id = parseInt(parts[2]);

          let users = [];
          if (parts[3])
            users = parts[3].split(',');

          let group = { name: name, id: id, users: users };
          groups.push(group);
        });
        resolve(groups);
      }).catch(error => `Failed to get all groups: ${error}`);
    });
  }

  static Exists(gid, executor) {
    return new Promise((resolve, reject) => {
      let gidError = Error.IdError(gid);
      if (gidError) {
        reject(`Failed to check if group exists: gid ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to check if group exists: Connection is ${executorError}`);
        return;
      }

      Groups.All(executor).then(groups => {
        for (let i = 0; i < groups.length; ++i) {
          let currGroup = groups[i];
          if ((typeof gid == 'string' && currGroup.name == gid) || (Number.isInteger(gid) && currGroup.id == gid)) {
            resolve(true);
            return;
          }
        }
        resolve(false);
      }).catch(error => `Failed to check if group exists: ${error}`);
    });
  }

  static Get(id, executor) {
    return new Promise((resolve, reject) => {
      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to get group: Connection is ${executorError}`);
        return;
      }

      Groups.Exists(id, executor).then(exists => {
        if (!exists) {
          reject(`Failed to get group: group does not exist: ${id}`);
          return;
        }

        Groups.All(executor).then(groups => {
          for (let i = 0; i < groups.length; ++i) {
            let currGroup = groups[i];
            if ((typeof id == 'string' && currGroup.name == id) || (Number.isInteger(id) && currGroup.id == id)) {
              resolve(currGroup);
              return;
            }
          }
        }).catch(error => `Failed to get group: ${error}`);
      }).catch(error => `Failed to get group: ${error}`);
    });
  }
}

//-------------------------------------
// USERS
class Users {
  static All(executor) {
    return new Promise((resolve, reject) => {
      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to get all users: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.AdminGetUsers();
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to get all users: ${output.stderr}`);
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
          let id = parseInt(parts[2]);
          let info = parts.slice(3).join(':'); // Other info

          let user = { name: name, id: id, info: info };
          users.push(user);
        });
        resolve(users);
      }).catch(error => `Failed to get all users: ${error}`);
    });
  }

  static Exists(uid, executor) {
    return new Promise((resolve, reject) => {
      let uidError = Error.IdError(uid);
      if (uidError) {
        reject(`Failed to check if user exists: uid ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to check if user exists: Connection is ${executorError}`);
        return;
      }

      Users.All(executor).then(users => {
        for (let i = 0; i < users.length; ++i) {
          let currUser = users[i];
          if ((typeof uid == 'string' && currUser.name == uid) || (Number.isInteger(uid) && currUser.id == uid)) {
            resolve(true);
            return;
          }
        }
        resolve(false);
      }).catch(error => `Failed to check if user exists: ${error}`);
    });
  }

  static Get(id, executor) {
    return new Promise((resolve, reject) => {
      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to get user: Connection is ${executorError}`);
        return;
      }

      Users.Exists(id, executor).then(exists => {
        if (!exists) {
          reject(`Failed to get user: user does not exist: ${id}`);
          return;
        }

        Users.All(executor).then(users => {
          for (let i = 0; i < users.length; ++i) {
            let currUser = users[i];
            if ((typeof id == 'string' && currUser.name == id) || (Number.isInteger(id) && currUser.id == id)) {
              resolve(currUser);
              return;
            }
          }
        }).catch(error => `Failed to get user: ${error}`);
      }).catch(error => `Failed to get user: ${error}`);
    });
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
  static W(executor) { // displays users currently logged in and their process along with load averages.
    return new Promise((resolve, reject) => {
      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to get logged in users: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.AdminWhoIsLoggedIn();
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to get logged in users: ${output.stderr}`);
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
      }).catch(error => `Failed to get logged in users: ${error}`);
    });
  }

  static Ps(executor) { // Gives status of running processes with a unique id called PID and other fields.
    return new Promise((resolve, reject) => {
      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to get running processes: Connection is ${executorError}`);
        return;
      }

      let fields = ['user', 'uid', 'gid', 'tty', 'start', 'etime', 'pid', 'ppid', 'pgid', 'tid', 'tgid', 'sid', 'ruid', 'rgid', 'euid', 'suid', 'fsuid', 'comm'];
      let args = ['xao', fields.join(',')];

      let cmd = LINUX_COMMANDS.AdminProcesses(fields);
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to get running processes: ${output.stderr}`);
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
      }).catch(error => `Failed to get running processes: ${error}`);
    });
  }

  static Kill(pid, executor) { // Kills a process
    return new Promise((resolve, reject) => {
      let pidError = Error.IdNumberError(pid)
      if (pidError) {
        reject(`Failed to kill process: pid is ${pidError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to kill process: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.AdminKillProcess(pid);
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to kill process: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => `Failed to kill process: ${error}`);
    });
  }

  static Uptime(executor) { // Displays uptime info
    return new Promise((resolve, reject) => {
      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to get uptime: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.AdminUptime();
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to get uptime: ${output.stderr}`);
          return;
        }

        // System info
        let uptimeObj = parseUptimeString(output.stdout);
        resolve(uptimeObj);
      }).catch(error => `Failed to get uptime: ${error}`);
    });
  }

  static Free(executor) { // Displays info regarding memory and resources (i.e. memory, swap, etc)
    return new Promise((resolve, reject) => {
      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to get info regarding memory and resources: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.AdminMemoryCheck();
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to get info regarding memory and resources: ${output.stderr}`);
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
      }).catch(error => `Failed to get info regarding memory and resources: ${error}`);
    });
  }

  static Top(executor) { // Shows CPU processes (1 iteration)
    return new Promise((resolve, reject) => {
      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to get top processes: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.AdminTopProcesses();
      let options = {
        'env': {
          'TERM': 'xterm'
        }
      };

      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr && !output.stderr.includes('TERM environment variable not set')) {
          reject(`Failed to get top processes: ${output.stderr}`);
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
        let taskParts = tasksStr.split(',').map(part => part.trim());

        let tasks = {};
        taskParts.forEach(part => {
          let parts = part.split(' ').map(p => p.trim());
          let int = parseInt(parts[0].trim());
          let name = parts[1].trim();
          tasks[name] = int;
        });

        // cpu str
        let cpuStr = lines[2].replace('%Cpu(s):', '');
        let cpuParts = cpuStr.split(',').map(part => part.trim());

        let cpu = {};
        cpuParts.forEach(part => {
          let parts = part.split(' ').map(p => p.trim());
          let float = parseFloat(parts[0].trim());
          let name = parts[1].trim();
          cpu[name] = float
        });

        // mem str
        let memStr = lines[3].split(':')[1].trim();
        let memParts = memStr.split(',').map(part => part.trim());

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
        let swapParts = swapStr.split(',').map(part=> part.trim());

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
        let firstWord = parts[1].trim();
        let secondWord = parts[2].trim().toLowerCase();
        name = firstWord + secondWord;
        swap[name] = int;

        // headers
        let headersStr = lines[5].trim();
        let headers = getHeaders(headersStr);

        // rows
        let processes = [];

        lines.slice(6).forEach(line => {
          let parts = line.split(' ')
            .filter(part => part && part != '' && part.trim() != '')
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
          processes: processes
        };

        resolve(result);
      }).catch(error => `Failed to get top processes: ${error}`);
    });
  }

  static Lsof(user, executor) { // Displays all files opened by user
    return new Promise((resolve, reject) => {
      let userError = ERROR.StringError(user);
      if (userError) {
        reject(`Failed to list open files by user: user is ${userError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to list open files by user: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.AdminListOpenFilesByUser(user);
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (`Failed to list open files by user: ${output.stderr}`) {
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
      }).catch(error => `Failed to list open filesby user: ${error}`);
    });
  }
}

//-------------------------------------
// ADMIN
class Admin {
  static Groups(executor) {
    return Groups.All(executor);
  }

  static GroupExists(gid, executor) {
    return Groups.Exists(gid, executor);
  }

  static GetGroup(id, executor) {
    return Groups.Get(id, executor);
  }

  static Users(executor) {
    return Users.All(executor);
  }

  static UserExists(uid, executor) {
    return Users.Exists(uid, executor);
  }

  static GetUser(id, executor) {
    return Users.Get(id, executor);
  }

  static Uptime(executor) {
    return Commands.Uptime(executor);
  }

  static Processes(executor) {
    return Commands.Ps(executor);
  }

  static ProcessExists(pid, executor) {
    return new Promise((resolve, reject) => {
      let pidError = ERROR.IntegerError(pid);
      if (pidError) {
        reject(`Failed to check if process exists: pid is ${pidError}`);
        return;
      }

      let min = 0;
      boundError = ERROR.BoundIntegerError(pid, min, null);
      if (boundError) {
        reject(`Failed to check if process exists: ${boundError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to check if process exists: Connection is ${executorError}`);
        return;
      }

      Admin.Processes(executor).then(processes => {
        for (let i = 0; i < processes.length; ++i) {
          let currProcess = processes[i];
          if (currProcess.pid == pid) {
            resolve(true);
            return;
          }
        }
        resolve(false);
      }).catch(error => `Failed to check if process exists: ${error}`);
    });
  }

  static Kill(pid, executor) {
    return new Promise((resolve, reject) => {
      Admin.ProcessExists(pid, executor).then(exists => {
        if (!exists) {
          reject(`Failed to kill process: pid does not exist: ${pid}`);
        }

        Commands.Kill(pid, executor).then(success => {
          resolve(true);
        }).catch(error => `Failed to kill process: ${error}`);
      }).catch(error => `Failed to kill process: ${error}`);
    });
  }

  static MemoryCheck(executor) {
    return Commands.Free(executor);
  }

  static TopProcesses(executor) {
    return Commands.Top(executor);
  }

  static LoggedIn(executor) {
    return Commands.W(executor);
  }

  static UserHasRootPermissions(uid, executor) {
    return new Promise((resolve, reject) => {
      let pidError = ERROR.IntegerError(pid);
      if (pidError) {
        reject(`Failed to verify if user has root permissions: pid is ${pidError}`);
        return;
      }

      Admin.GetUser(uid, executor).then(user => {
        if (user.name == 'root') {
          resolve(true);
          return;
        }

        Admin.GetGroup('root', executor).then(group => {
          resolve(group.users.includes(user.name));
        }).catch(error => `Failed to verify if user has root permissions: ${error}`);
      }).catch(error => `Failed to verify if user has root permissions: ${error}`);
    });
  }

  static UserCanChangeGroupOwnership(uid, desiredGid, executor) { // Must be root OR be part of the desired group to give ownership to that group.
    return new Promise((resolve, reject) => {
      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to check if user can change group ownership: Connection is ${executorError}`);
        return;
      }

      Admin.GetUser(uid, executor).then(user => {
        Admin.UserHasRootPermissions(user.id, executor).then(hasRootAccess => {
          if (hasRootAccess) {
            resolve(true);
            return;
          }

          Admin.GetGroup(desiredGid, executor).then(group => {
            USERINFO.OtherUser(user.name, executor).then(info => {
              let userGroupIds = info.groups.map(group => group.gid);
              resolve(group.users.includes(user.name) || userGroupIds.includes(group.id));
            }).catch(error => `Failed to check if user can change group ownership: ${error}`);
          }).catch(error => `Failed to check if user can change group ownership: ${error}`);
        }).catch(error => `Failed to check if user can change group ownership: ${error}`);
      }).catch(error => `Failed to check if user can change group ownership: ${error}`);
    });
  }

  static UserCanChangeUserOwnership(uid, executor) { // Must have root permissions to change user ownership.
    return Admin.UserHasRootPermissions(uid, executor);
  }
}

//-----------------------------------
// ERROR

class Error {
  static IdStringError(string) {
    let error = ERROR.StringValidator(string);
    if (error)
      return `id is ${error} `;
    return null;
  }

  static IdNumberError(int) {
    let error = ERROR.NullOrUndefined(int);
    if (error)
      return `id is ${error} `;

    let min = 0;
    error = ERROR.BoundIntegerError(int, min, null);
    if (error)
      return error;
    return null;
  }

  static IdError(id) {
    let error = ERROR.NullOrUndefined(id);
    if (error)
      return `id is ${error} `;

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

//---------------------------------

let C = require('./command.js');
let L = new C.LocalCommand();

Admin.TopProcesses(L).then(u => {
  console.log(`CHECK: ${JSON.stringify(u)}`);
}).catch(error => {
  console.log(`ERROR: ${error}`);
});

//------------------------------------
// EXPORTS

exports.Admin = Admin;