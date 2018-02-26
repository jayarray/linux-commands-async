let VALIDATE = require('./validate.js');
let USERINFO = require('./userinfo.js').UserInfo;

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
  let hasValues = lsofOutputHasValues(line, headers);

  let parts = line.split(' ')
    .filter(part => part && part != '' && part.trim() != '')
    .map(part => part.trim());

  let partIndex = 0;
  let lsofObj = {};

  Object.keys(headers).forEach(field => {
    let name = field;
    if (field.includes('/'))
      name = field.replace('/', '');
    name = name.toLocaleLowerCase();

    if (hasValues[field]) {
      if (field == 'COMMAND' ||
        field == 'PID' ||
        field == 'USER' ||
        field == 'FD' ||
        field == 'TYPE' ||
        field == 'DEVICE' ||
        field == 'SIZE/OFF' ||
        field == 'NODE') {
        if (isNaN(field))
          lsofObj[name] = parts[partIndex];
        else
          lsofObj[name] = parseInt(parts[partIndex]);
      }
      else if (field == 'NAME') {
        lsofObj[name] = parts.slice(partIndex).join(' ');
      }
    }
    else
      lsofObj[name] = null;

    partIndex += 1;
  });
  return lsofObj;
}

//-------------------------------------
// ADMIN
class Admin {
  static Groups(executor) {
    if (!executor)
      return Promise.reject(`Failed to get all groups: Executor is required`);

    return new Promise((resolve, reject) => {
      executor.Execute('cat', ['/etc/group']).then(output => {
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

  static GetGroup(id, executor) {
    let gidError = Error.IdError(gid);
    if (gidError)
      return Promise.reject(`Failed to get group: gid ${error}`);

    if (!executor)
      return Promise.reject(`Failed to get group: Executor is required`);

    return new Promise((resolve, reject) => {
      Admin.Groups(executor).then(groups => {
        for (let i = 0; i < groups.length; ++i) {
          let currGroup = groups[i];
          if ((typeof gid == 'string' && currGroup.name == gid) || (Number.isInteger(gid) && currGroup.id == gid)) {
            resolve(currGroup);
            return;
          }
        }
        reject(`Failed to get group: group does not exist: ${gid}`);
      }).catch(error => `Failed to get group: ${error}`);
    });
  }

  static Users(executor) {
    if (!executor)
      return Promise.reject(`Failed to get all users: Executor is required`);

    return new Promise((resolve, reject) => {
      executor.Execute('cat', ['/etc/passwd']).then(output => {
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

  static GetUser(uid, executor) {
    let uidError = Error.IdError(uid);
    if (uidError)
      return Promise.reject(`Failed to get user: uid ${uidError}`);

    if (!executor)
      return Promise.reject(`Failed to get user: Executor is required`);

    return new Promise((resolve, reject) => {
      Admin.Users(executor).then(users => {
        for (let i = 0; i < users.length; ++i) {
          let currUser = users[i];
          if ((typeof uid == 'string' && currUser.name == uid) || (Number.isInteger(uid) && currUser.id == uid)) {
            resolve(currUser);
            return;
          }
        }
        reject(`Failed to get user: user does not exist: ${uid}`);
      }).catch(error => `Failed to get user: ${error}`);
    });
  }

  static Uptime(executor) { // Displays uptime info
    if (!executor)
      return Promise.reject(`Failed to get uptime: Executor is required`);

    return new Promise((resolve, reject) => {
      executor.Execute('uptime', []).then(output => {
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

  static Processes(executor) { // Gives status of running processes with a unique id called PID and other fields.
    if (!executor)
      return Promise.reject(`Failed to get running processes: Executor is required`);

    return new Promise((resolve, reject) => {
      let fields = ['user', 'uid', 'gid', 'tty', 'start', 'etime', 'pid', 'ppid', 'pgid', 'tid', 'tgid', 'sid', 'ruid', 'rgid', 'euid', 'suid', 'fsuid', 'comm'];

      executor.Execute('ps', ['xao', fields.join(',')]).then(output => {
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

  static GetProcess(pid, executor) {
    let pidError = VALIDATE.IsInteger(pid);
    if (pidError)
      return Promise.reject(`Failed to get process: pid is ${pidError}`);

    let min = 0;
    let boundError = VALIDATE.IsIntegerInRange(pid, min, null);
    if (boundError)
      return Promise.reject(`Failed to get process: ${boundError}`);

    if (!executor)
      return Promise.reject(`Failed to get process: Executor is required`);

    return new Promise((resolve, reject) => {
      Admin.Processes(executor).then(processes => {
        for (let i = 0; i < processes.length; ++i) {
          let currProcess = processes[i];
          if (currProcess.pid == pid) {
            resolve(currProcess);
            return;
          }
        }
        reject(`Failed to get process: process does not exist: ${pid}`);
      }).catch(error => `Failed to get process: ${error}`);
    });
  }

  static Kill(pid, executor) { // Kills a process
    if (!executor)
      return Promise.reject(`Failed to kill process: Executor is required`);

    return new Promise((resolve, reject) => {
      Admin.GetProcess(pid, executor).then(process => {
        executor.Execute('kill', ['-9', pid]).then(output => {
          if (output.stderr) {
            reject(`Failed to kill process: ${output.stderr}`);
            return;
          }
          resolve(true);
        }).catch(error => `Failed to kill process: ${error}`);
      }).catch(error => `Failed to kill process: ${error}`);
    });
  }

  static MemoryCheck(executor) { // Displays info regarding memory and resources (i.e. memory, swap, etc)
    if (!executor)
      return Promise.reject(`Failed to get info regarding memory and resources: Executor is required`);

    return new Promise((resolve, reject) => {
      executor.Execute('free', ['-t']).then(output => {
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

  static TopProcesses(executor) { // Shows CPU processes (1 iteration)
    if (!executor)
      return Promise.reject(`Failed to get top processes: Executor is required`);

    return new Promise((resolve, reject) => {
      executor.Execute('top', ['-b', '-n', 1]).then(output => {
        if (output.stderr) {
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
        let swapParts = swapStr.split(',').map(part => part.trim());

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

  static WhoIsLoggedIn(executor) { // displays users currently logged in and their process along with load averages.
    if (!executor)
      return Promise.reject(`Failed to get logged in users: Executor is required`);

    return new Promise((resolve, reject) => {
      executor.Execute('w', []).then(output => {
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
          }
          users.push(user);
        });
        resolve({
          users: users,
          uptimeObj: uptimeObj
        });
      }).catch(error => `Failed to get logged in users: ${error}`);
    });
  }

  static ListOpenFilesByUser(user, executor) { // Displays all files opened by user
    let userError = VALIDATE.IsStringInput(user);
    if (userError)
      return Promise.reject(`Failed to list open files: user is ${userError}`);

    if (!executor)
      return Promise.reject(`Failed to list open files: Executor is required`);

    return new Promise((resolve, reject) => {
      executor.Execute('lsof', ['-u', user]).then(output => {
        if (output.stderr) {
          reject(`Failed to list open files: ${output.stderr}`);
          return;
        }

        let lines = output.stdout.trim().split('\n')
          .filter(line => line && line != '' && line.trim() != '')
          .map(line => line.trim());

        // Headers
        let headersLine = lines[0];
        let headers = getHeaders(headersLine);

        // Info
        let files = []

        let fileLines = lines.slice(1)
          .filter(line => line && line != '' && line.trim() != '')
          .map(line => line.trim());

        fileLines.forEach(line => {
          let o = getLsofObject(line, headers);
          files.push(o);
        });

        resolve(files);
      }).catch(error => `Failed to list open files: ${error}`);
    });
  }

  static UserHasRootPermissions(uid, executor) {
    let pidError = VALIDATE.IsInteger(pid);
    if (pidError)
      return Promise.reject(`Failed to verify if user has root permissions: pid is ${pidError}`);

    if (!executor)
      return Promise.reject(`Failed to verify if user has root permissions: Executor is required`);

    return new Promise((resolve, reject) => {
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
    let uidError = Error.IdError(uid);
    if (uidError)
      return Promise.reject(`Failed to verify if user can change group ownership: uid ${uidError}`);

    let desiredGidError = Error.IdError(desiredGid);
    if (desiredGidError)
      return Promise.reject(`Failed to verify if user can change group ownership: desired gid ${desiredGidError}`);

    if (!executor)
      return Promise.reject(`Failed to verify if user can change group ownership: Executor is required`);

    return new Promise((resolve, reject) => {
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
            }).catch(error => `Failed to verify if user can change group ownership: ${error}`);
          }).catch(error => `Failed to verify if user can change group ownership: ${error}`);
        }).catch(error => `Failed to verify if user can change group ownership: ${error}`);
      }).catch(error => `Failed to verify if user can change group ownership: ${error}`);
    });
  }

  static UserCanChangeUserOwnership(uid, executor) { // Must have root permissions to change user ownership.
    let uidError = Error.IdError(uid);
    if (uidError)
      return Promise.reject(`Failed to verify if user can change user ownership: uid ${uidError}`);

    if (!executor)
      return Promise.reject(`Failed to verify if user can change group ownership: Executor is required`);
    return Admin.UserHasRootPermissions(uid, executor);
  }
}

//-----------------------------------
// ERROR

class Error {
  static IdStringError(string) {
    let error = VALIDATE.IsStringInput(string);
    if (error)
      return `is ${error} `;
    return null;
  }

  static IdNumberError(int) {
    let error = VALIDATE.IsInstance(int);
    if (error)
      return `is ${error} `;

    let min = 0;
    error = VALIDATE.IsIntegerInRange(int, min, null);
    if (error)
      return error;
    return null;
  }

  static IdError(id) {
    let error = VALIDATE.IsInstance(id);
    if (error)
      return `is ${error} `;

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

    return `is not a valid string or integer`;
  }
}

//------------------------------------
// EXPORTS

exports.Admin = Admin;