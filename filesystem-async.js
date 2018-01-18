var fs = require('fs-extra');
var rsync = require('rsync');
var path = require('path');
var childProcess = require('child_process');

//-----------------------------------
// EXECUTE

class Execute {
  static local(cmd, args) {
    let process = childProcess.spawnSync(cmd, args);

    return {
      error: process.error && process.error.toString().trim() || '',
      stdout: process.stdout && process.stdout.toString().trim() || '',
      stderr: process.stderr && process.stderr.toString().trim() || '',
      status: process.status && process.status.toString().trim() || ''
    };
  }

  static remote(user, host, cmd) {
    let remoteCmd = `ssh ${user}@${host} "${cmd}"`;
    let process = childProcess.spawnSync(remoteCmd);

    return {
      error: process.error && process.error.toString().trim(),
      stdout: process.stdout && process.stdout.toString().trim(),
      stderr: process.stderr && process.stderr.toString().trim(),
      status: process.status && process.status.toString().trim()
    };
  }
};

//---------------------------------------
// TIMESTAMP

class Timestamp {
  static timestamp() {
    let d = new Date();

    // TIME
    let hours = d.getHours();  // 0-23
    let minutes = d.getMinutes();  // 0-59
    let seconds = d.getSeconds();  // 0-59
    let milliseconds = d.getMilliseconds();  // 0-999 

    let militaryTime = {  // 24-hour format
      hours: hours,
      minutes: minutes,
      seconds: seconds,
      milliseconds: milliseconds,
      string: `${hours}:${minutes}:${seconds}`
    }

    let minutesStr = `00${minutes}`;
    minutesStr = minutesStr.slice(-2);

    let secondsStr = `00${seconds}`;
    secondsStr = secondsStr.slice(-2);

    let adjustHours = null;
    let timeStr = '';
    if (hours == 0) {
      adjustHours = 12;
      timeStr = `${adjustedHours}:${minutesStr}:${secondsStr} AM`;
    }
    else if (hours == 12) {
      adjustHours = 12;
      timeStr = `${adjustedHours}:${minutesStr}:${secondsStr} PM`;
    }
    else if (hours > 12) {
      adjustHours = hours % 12;
      timeStr = `${adjustedHours}:${minutesStr}:${secondsStr} PM`;
    }
    else {
      adjustedHours = hours;
      timeStr = `${adjustedHours}:${minutesStr}:${secondsStr} AM`;
    }

    let meridiemTime = {  // 12-hour format (AM | PM)
      hours: adjustHours,
      minutes: minutes,
      seconds: seconds,
      milliseconds: milliseconds,
      string: timeStr
    }

    // DATE
    let year = d.getFullYear();  // yyyy

    let monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let monthNumber = d.getMonth(); // 0-11;
    let monthName = monthNames[monthNumber];
    let dayOfMonth = d.getDate(); // 1-31

    let weekDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let dayOfWeekNumber = d.getDay();  // 0-6
    let dayOfWeekName = weekDayNames[dayOfWeekNumber];

    return {
      hours: hours,
      minutes: minutes,
      seconds: seconds,
      milliseconds: milliseconds,
      militaryTime: militaryTime,
      meridiemTime: meridiemTime,
      year: year,
      monthNumber: monthNumber,
      monthName: monthName,
      dayOfMonth: dayOfMonth,
      dayOfWeekNumber: dayOfWeekNumber,
      dayOfWeekName: dayOfWeekName
    };
  }

  static military_to_meridiem_time(militaryTime) {
    let parts = militaryTime.split(':');

    let hoursStr = parts[0];
    let hoursVal = parseInt(hoursStr);

    let minutesStr = parts[1];
    let minutesVal = parseInt(minutesStr);

    let secondsStr = parts[2];
    let secondsVal = parseInt(secondsStr);

    let adjustedHours = null;
    if (hoursVal == 0 || hoursVal == 12) {
      adjustedHours = 12;
    }
    else if (hoursVal > 12) {
      adjustedHours = hoursVal % 12;
    }
    else {
      adjustedHours = hoursVal;
    }

    let timeStr = `${adjustedHours}:${minutesStr}:${secondsStr}`;
    if (hoursVal < 12) {
      timeStr += ' AM';
    }
    else {
      timeStr += ' PM';
    }
    return timeStr;
  }

  static meridiem_to_military_time(meridiemTime) {
    let parts = militaryTime.split(':');

    let hoursStr = parts[0];
    let hoursVal = parseInt(hoursStr);

    let minutesStr = parts[1];
    let minutesVal = parseInt(minutesStr);

    let secondsStr = parts[2];
    let secondsVal = parseInt(secondsStr);

    let adjustedhours = null;
    if (meridiemTime.includes('AM') && hoursVal == 12) {
      adjustedhours = 0;
    }
    else if (meridiemTime.includes('PM') && hoursVal < 12) {
      adjustedhours = hoursVal + 12;
    }
    else {
      adjustedhours = hours;
    }
    return `${adjustedHours}:${minutesStr}:${secondsStr}`;
  }

  static difference(d1, d2) {
    let date1 = new Date(d1.year, d1.month_number, d1.day_of_month, 0, 0, 0, 0);
    let date2 = new Date(d2.year, d2.month_number, d2.day_of_month, 0, 0, 0, 0);
    let diff = t1.getTime() - t2.getTime();

    let secondsFromD1ToD2 = diff / 1000;
    return secondsFromD1ToD2;
  }
}

//-------------------------------------------
// PATH

class Path {
  static exists(path) {
    if (!path)
      return { exists: null, error: `Path is ${Path.get_invalid_type(path)}` };
    return { exists: fs.existsSync(path.trim()), error: null };
  }

  static is_file(path) {
    if (!path)
      return { isFile: null, error: `Path is ${Path.get_invalid_type(path)}` };

    let pTrimmed = path.trim();
    if (!Path.exists(pTrimmed))
      return { isFile: null, error: 'Path does not exist' };

    try {
      let isFile = fs.lstatSync(pTrimmed).isFile();
      let isDir = !fs.lstatSync(pTrimmed).isDirectory();
      return { isFile: isFile && !isDir, error: null };
    }
    catch (e) {
      return { isFile: null, error: e };
    }
  }

  static is_dir(path) {
    if (!path)
      return { isDir: null, error: `Path is ${Path.get_invalid_type(path)}` };

    let pTrimmed = path.trim();
    if (!Path.exists(pTrimmed))
      return { isDir: null, error: 'Path does not exist' };

    try {
      let isDir = fs.lstatSync(pTrimmed).isDirectory();
      return { isDir: isDir, error: null };
    }
    catch (e) {
      return { isDir: null, error: e };
    }
  }

  static filename(path) {
    if (!path)
      return { filename: null, error: `Path is ${Path.get_invalid_type(path)}` };

    let pTrimmed = path.trim();
    if (!Path.exists(pTrimmed))
      return { filename: null, error: 'Path does not exist' };
    return { filename: path.parse(pTrimmed).base, error: null };
  }

  static parent_dir_name(path) {
    if (!path)
      return { name: null, error: `Path is ${Path.get_invalid_type(path)}` };

    let pTrimmed = path.trim();
    if (!Path.exists(pTrimmed))
      return { name: null, error: 'Path does not exist' };
    return { name: path.parse(pTrimmed).base, error: null };
  }

  static parent_dir(path) {
    if (!path)
      return { dir: null, error: `Path is ${Path.get_invalid_type(path)}` };

    let pTrimmed = path.trim();
    if (!Path.exists(pTrimmed))
      return { dir: null, error: 'Path does not exist' };
    return { dir: path.dirname(path.trim()), error: null }; // Full path to parent dir
  }

  static is_valid(path) {
    return path != null && path != undefined && path != '' && path.trim() != '';
  }

  static get_invalid_type(path) {
    if (path == null)
      return 'null';
    else if (path == undefined)
      return 'undefined';
    else if (path == '')
      return 'empty string';
    else if (path.trim() == '')
      return 'whitespace';
    else
      return typeof path;
  }

  static escape(path) {
    if (!path)
      return { string: null, error: `Path is ${Path.get_invalid_type(path)}` };

    let pTrimmed = path.trim();
    if (!Path.exists(pTrimmed))
      return { string: null, error: 'Path does not exist' };
    return { string: escape(path), error: null };
  }

  static containsWhiteSpace(path) {
    if (!path)
      return { hasWhitespace: null, error: `Path is ${Path.get_invalid_type(path)}` };

    let pTrimmed = path.trim();
    if (!Path.exists(pTrimmed))
      return { hasWhitespace: null, error: 'Path does not exist' };

    path.forEach(char => {
      if (char.trim() == '')
        return { hasWhitespace: true, error: null };
    });
    return { hasWhitespace: false, error: null };
  }
}

//-------------------------------------------
// STATS

class Stats {
  static stats(path) {
    if (!path)
      return { stats: null, error: `Path is ${Path.get_invalid_type(path)}` };

    let pTrimmed = path.trim();
    if (!Path.exists(pTrimmed))
      return { stats: null, error: 'Path does not exist' };

    let fstats = fs.statSync(path);

    return {
      stats: {
        size: fstats.size,  // bytes
        mode: fstats.mode,
        others_x: fstats.mode & 1 ? 'x' : '-',
        others_w: fstats.mode & 2 ? 'w' : '-',
        others_r: fstats.mode & 4 ? 'r' : '-',
        group_x: fstats.mode & 8 ? 'x' : '-',
        group_w: fstats.mode & 16 ? 'w' : '-',
        group_r: fstats.mode & 32 ? 'r' : '-',
        owner_x: fstats.mode & 64 ? 'x' : '-',
        owner_w: fstats.mode & 128 ? 'w' : '-',
        owner_r: fstats.mode & 256 ? 'r' : '-',
        is_dir: fstats.mode & 512 ? 'd' : '-',
        uid: fstats.uid,
        gid: fstats.gid
      },
      error: null
    };
  }
}

//-------------------------------------------
// PERMISSIONS

class Permissions {
  static permissions(path) {
    let stats = fs.statSync(path);

    let others = {
      x: stats.mode & 1 ? 'x' : '-',
      w: stats.mode & 2 ? 'w' : '-',
      r: stats.mode & 4 ? 'r' : '-',
    };
    let others_string = `${others.r}${others.w}${others.x}`;

    let group = {
      x: stats.mode & 8 ? 'x' : '-',
      w: stats.mode & 16 ? 'w' : '-',
      r: stats.mode & 32 ? 'r' : '-',
    };
    let group_string = `${group.r}${group.w}${group.x}`;

    let owner = {
      x: stats.mode & 64 ? 'x' : '-',
      w: stats.mode & 128 ? 'w' : '-',
      r: stats.mode & 256 ? 'r' : '-',
    };
    let owner_string = `${owner.r}${owner.w}${owner.x}`;

    return {
      others: others,
      others_string: others_string,
      group: group,
      group_string: group_string,
      owner: owner,
      owner_string: owner_string
    };
  }

  static equal(p1, p2) {
    return p1.owner.r == p2.owner.r &&
      p1.owner.w == p2.owner.w &&
      p1.owner.x == p2.owner.x &&
      p1.group.r == p2.group.r &&
      p1.group.w == p2.group.w &&
      p1.group.x == p2.group.x &&
      p1.others.r == p2.others.r &&
      p1.others.w == p2.others.w &&
      p1.others.x == p2.others.x;
  }

  static objToNumberString(obj) {
    let values = { r: 4, w: 2, x: 1, '-': 0 };
    let leftNum = values[obj.u.r] + values[obj.u.w] + values[obj.u.x];
    let middleNum = values[obj.g.r] + values[obj.g.w] + values[obj.g.x];
    let rightNum = values[obj.o.r] + values[obj.o.w] + values[obj.o.x];
    return `${leftNum}${middleNum}${rightNum}`;
  }

  static permStringToNumberString(permString) {
    let adjustedString = permString;
    if (permString.length > 9)
      adjustedString = permString.slice(1);

    let u = { r: adjustedString[0], w: adjustedString[1], x: adjustedString[2] };
    let g = { r: adjustedString[3], w: adjustedString[4], x: adjustedString[5] };
    let u = { r: adjustedString[6], w: adjustedString[7], x: adjustedString[8] };
    let obj = { u: u, g: g, o: o };
    return Permissions.objToNumberString(obj);
  }
}

//-------------------------------------------------
// COPY (cp)

class Copy {
  static copy(src, dest) {
    fs.copyFileSync(src, dest);
    return Path.exists(dest);
  }
}

//-------------------------------------------------
// REMOVE (rm)

class Remove {
  static file(path) {
    fs.unlinkSync(path);
    return !Path.exists(path);
  }

  static directory(path) {
    fs.rmdirSync(path);
    return !Path.exists(path);
  }
}

//------------------------------------------------------
// MKDIR (mkdir)

class Mkdir {
  static mkdir(path) {
    fs.mkdirSync(path);
    return Path.exists(path);
  }

  static mkdirp(path) {
    fs.mkdirpSync(path);
    return Path.exists(path);
  }
}

//------------------------------------------------------
// MOVE 

class Move {
  static move(src, dest) {
    fs.moveSync(src, dest);
    return !Path.exists(src) && Path.exists(dest);
  }
}

//------------------------------------------------------
// LIST (ls)

class List {
  static visible(path) {
    return fs.readdirSync(path).filter(x => !x.startsWith('.'));
  }

  static hidden(path) {
    return fs.readdirSync(path).filter(x => x.startsWith('.'));
  }

  static all(path) {
    return fs.readdirSync(path);
  }
}

//------------------------------------------------
// RSYNC

class Rsync {
  static rsync(user, host, src, dest) {
    let r = new Rsync()
      .shell('ssh')
      .flags('av')
      .set('progress')
      .set('size-only')
      .source(src)
      .destination(dest);

    r.execute(function (error, code, cmd) {
      if (error)
        console.log(`ERROR: ${error}`);
      console.log('Rsync complete!');
    });
  }
}

//-----------------------------------------
// CHMOD

class Chmod {
  static chmod(op, who, types, path) {    // op = (- | + | =)  who = [u, g, o]  types = [r, w, x]
    let perms = Permissions.permissions(path);

    let whoMapping = { u: 'owner', g: 'group', o: 'others' };
    who.forEach(w => {
      let whoString = whoMapping[w];

      if (op == '=') {
        let typesList = ['r', 'w', 'x'];
        typesList.forEach(t => {
          if (types.includes(t))
            perms[whoString][t] = t;
          else
            perms[whoString][t] = '-';
        });
      }
      else {
        types.forEach(t => {
          if (op == '+')  // ADD
            perms[whoString][t] = t;
          else if (op == '-')  // REMOVE
            perms[whoString][t] = '-';
        });
      }
    });

    let obj = { u: perms.owner, g: perms.group, o: perms.others };
    let newPermNumStr = Permissions.objToNumberString(obj);
    fs.chmodSync(path, newPermNumStr);

    perms = Permissions.permissions(path);
    obj = { u: perms.owner, g: perms.group, o: perms.others };
    return Permissions.objToNumberString(obj) == newPermNumStr;
  }
}

//-----------------------------------------------
// RENAME

class Rename {
  static rename(currPath, newName) {
    let parentDir = Path.parent_dir(currPath);
    let updatedPath = path.join(parentDir, newName);

    fs.renameSync(currPath, updatedPath);
    return Path.exists(updatedPath);
  }
}

//---------------------------------------------------
// FILE

class File {
  static exists(path) {
    return Path.exists(path);
  }

  static copy(src, dest) {
    return Copy.file(src, dest);
  }

  static remove(path) {
    return Remove.file(path);
  }

  static create(path, text) {
    fs.writeFileSync(path, text);
    return Path.exists(path);
  }

  static move(src, dest) {
    return Move.file(src, dest);
  }

  static rename(path, newName) {
    return Rename.rename(path, newName);
  }

  static make_executable(path) {
    let op = '+';
    let who = ['u', 'g', 'o'];
    let types = ['x'];
    return Chmod.chmod(op, who, types, path);
  }

  static read(path) {
    return fs.readFileSync(path);
  }

  static read_lines(path) {
    return fs.readFileSync(path).toString().split('\n');
  }
}

//-----------------------------------------
// DIRECTORY

class Directory {
  static exists(path) {
    return Path.exists(path);
  }

  static copy(src, dest) {
    return Copy.copy(src, dest);
  }

  static remove(path) {
    return Remove.directory(path);
  }

  static create(path) {
    return Mkdir.mkdirp(path);
  }

  static move(src, dest) {
    return Move.move(src, dest);
  }

  static rename(path, newName) {
    return Rename.rename(path, newName);
  }
}

//----------------------------------------
// BASH SCRIPT

class BashScript {
  static create(path, content) {
    let fileCreated = File.create(path, `#!/bin/bash\n${content}`);
    if (fileCreated) {
      let op = '+';
      let who = ['u', 'g', 'o'];
      let types = ['x'];
      return Chmod.chmod(op, who, types, path);
    }
    return false;
  }

  static execute(path, content) {
    let fileCreated = BashScript.create(path, content);
    if (fileCreated) {
      // Execute
      let output = Execute.local(path);

      // Clean it up
      File.remove(path);
      return output;
    }
    return null;
  }
}

//------------------------------------
// EXPORTS

exports.Execute = Execute;
exports.Timestamp = Timestamp;
exports.Path = Path;
exports.Stats = Stats;
exports.Permissions = Permissions;
exports.Copy = Copy;
exports.Remove = Remove;
exports.Mkdir = Mkdir;
exports.Move = Move;
exports.List = List;
exports.Rsync = Rsync;
exports.Chmod = Chmod;
exports.Rename = Rename;
exports.File = File;
exports.Directory = Directory;
exports.BashScript = BashScript;