var path = require('path');
var fs = require('fs-extra');
var rsync = require('rsync');
var mkdirp = require('mkdirp');
var simpleSsh = require('simple-ssh');
var childProcess = require('child_process');

//-----------------------------------
// ERROR CATCHING

function fatalFail(error) {
  console.log(error);
  process.exit(-1);
}

//-----------------------------------
// HELPER
class SavedData {
  constructor(thing) {
    this.value = '';
    thing.on('data', this.callback_.bind(this));
  }

  callback_(data) {
    this.value += data.toString();
  }
}

//-----------------------------------
// EXECUTE

class Execute {
  static local(cmd, args) {
    let child = childProcess.spawn(cmd, args);
    let errors = new SavedData(child.stderr);
    let outputs = new SavedData(child.stdout);

    return new Promise(resolve => {
      child.on('close', exitCode => {
        resolve({
          stderr: errors.value,
          stdout: outputs.value,
          exitCode: exitCode
        });
      });
    });
  }

  static remote(user, host, cmd) {
    let ssh = new simpleSsh({
      user: user,
      host: host
    });


    return new Promise(resolve => {
      ssh.exec(cmd, {
        out: function (stdout) {
          // TO DO
        },
        err: function (stderr) {
          // TO DO
        },
        exit: function (code) {
          // TO DO 
        }
      }).start();

      resolve({
        stdout: ssh.stdout,
        stderr: ssh.stderr,
        exitCode: ssh.exitCode
      });
    });
  }
}

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
// STATS
class Stats {
  static stats(path) {
    return new Promise(resolve => {
      let error = Path.error(path);
      if (error) {
        resolve({ stats: null, error: error });
        return;
      }

      fs.lstat(path, (err, stats) => {
        if (err)
          resolve({ stats: null, error: err });
        else {
          resolve({
            stats: {
              size: stats.size,  // bytes
              mode: stats.mode,
              uid: stats.uid,
              gid: stats.gid,
              others_x: stats.mode & 1 ? 'x' : '-',
              others_w: stats.mode & 2 ? 'w' : '-',
              others_r: stats.mode & 4 ? 'r' : '-',
              group_x: stats.mode & 8 ? 'x' : '-',
              group_w: stats.mode & 16 ? 'w' : '-',
              group_r: stats.mode & 32 ? 'r' : '-',
              owner_x: stats.mode & 64 ? 'x' : '-',
              owner_w: stats.mode & 128 ? 'w' : '-',
              owner_r: stats.mode & 256 ? 'r' : '-',
              is_dir: stats.isDirectory(),
              is_symlink: stats.isSymbolicLink()
            },
            error: null
          });
        }
      });
    });
  }
}

//-------------------------------------------
// PATH
class Path {
  static exists(p) {
    return new Promise(resolve => {
      let error = Path.error(p);
      if (error) {
        resolve({ exists: null, error: error });
        return;
      }

      fs.access(p, fs.F_OK, (err) => {
        if (err)
          resolve({ exists: false, error: null });
        else
          resolve({ exists: true, error: null });
      });
    });
  }

  static is_file(p) {
    return new Promise(resolve => {
      let error = Path.error(p);
      if (error) {
        resolve({ isFile: null, error: error });
        return;
      }

      fs.lstat(p, (err, stats) => {
        if (err)
          resolve({ isFile: null, error: err });
        else
          resolve({ isFile: stats.isFile() && !stats.isDirectory(), error: null });
      });
    });
  }

  static is_dir(p) {
    return new Promise(resolve => {
      let error = Path.error(p);
      if (error) {
        resolve({ isDir: null, error: error });
        return;
      }

      fs.lstat(p, (err, stats) => {
        if (err)
          resolve({ isDir: null, error: err });
        else
          resolve({ isDir: stats.isDirectory(), error: null });
      });
    });
  }

  static filename(p) {
    let error = Path.error(p);
    if (error)
      return { name: null, error: error };
    return { name: path.basename(p.trim()), error: null };
  }

  static extension(p) {
    let error = Path.error(p);
    if (error)
      return { extension: null, error: error };
    return { extension: path.extname(p.trim()), error: null };
  }

  static parent_dir_name(p) {
    let error = Path.error(p);
    if (error)
      return { dir: null, error: error };
    return { dir: path.dirname(p.trim()).split(path.sep).pop(), error: null };
  }

  static parent_dir(p) {
    let error = Path.error(p);
    if (error)
      return { dir: null, error: error };
    return { dir: path.dirname(p.trim()), error: null }; // Full path to parent dir
  }

  static is_valid(p) {
    return p != null && p != undefined && p != '' && p.trim() != '';
  }

  static get_invalid_type(p) {
    if (p == null)
      return 'null';
    else if (p == undefined)
      return 'undefined';
    else if (p == '')
      return 'empty string';
    else if (p.trim() == '')
      return 'whitespace';
    else
      return typeof p;
  }

  static error(p) {
    if (!Path.is_valid(p)) {
      if (!p)
        return `Path is ${Path.get_invalid_type(p)}`;

      let pTrimmed = p.trim();
      if (!Path.exists(pTrimmed))
        return 'No such file or directory';
    }
    return null;
  }

  static escape(p) {
    let error = Path.error(p);
    if (error)
      return { string: null, error: error };
    return { string: escape(path), error: null };
  }

  static containsWhiteSpace(p) {
    let error = Path.error(p);
    if (error)
      return { hasWhitespace: null, error: error };

    path.forEach(char => {
      if (char.trim() == '')
        return { hasWhitespace: true, error: null };
    });
    return { hasWhitespace: false, error: null };
  }
}

//-------------------------------------------
// PERMISSIONS
class Permissions {
  static permissions(path) {
    return new Promise(resolve => {
      fs.lstat(path, (err, stats) => {
        if (err)
          resolve({ permissions: null, error: err });
        else {
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

          resolve({
            permissions: {
              others: others,
              others_string: others_string,
              group: group,
              group_string: group_string,
              owner: owner,
              owner_string: owner_string
            },
            error: null
          });
        }
      });
    });
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
    return new Promise(resolve => {
      fs.copy(src, dest, (err) => {
        if (err) {
          resolve({ success: false, error: err });
          return;
        }
        resolve({ success: true, error: null });
      });
    });
  }
}

//-------------------------------------------------
// REMOVE (rm)
class Remove {
  static file(path) {
    return new Promise(resolve => {
      fs.unlink(path, (err) => {
        if (err) {
          resolve({ success: false, error: err });
          return;
        }
        resolve({ success: true, error: null });
      });
    });
  }

  static directory(path) {
    return new Promise(resolve => {
      fs.rmdir(path, (err) => {
        if (err) {
          resolve({ success: false, error: err });
          return;
        }
        resolve({ success: true, error: null });
      });
    });
  }
}

//------------------------------------------------------
// MKDIR (mkdir)
class Mkdir {
  static mkdir(path) {
    return new Promise(resolve => {
      fs.mkdir(path, (err) => {
        if (err) {
          resolve({ success: false, error: err });
          return;
        }
        resolve({ success: true, error: null });
      });
    });
  }

  static mkdirp(path) {
    return new Promise(resolve => {
      mkdirp(path, (err) => {
        if (err) {
          resolve({ success: false, error: err });
          return;
        }
        resolve({ success: true, error: null });
      });
    });
  }
}

//------------------------------------------------------
// MOVE 

class Move {
  static move(src, dest) {
    return new Promise(resolve => {
      fs.move(src, dest, (err) => {
        if (err) {
          resolve({ success: false, error: err });
          return;
        }
        resolve({ success: true, error: null });
      });
    });
  }
}

//------------------------------------------------------
// LIST (ls)

class List {
  static visible(path) {
    return new Promise(resolve => {
      fs.readdir(path, (err, files) => {
        if (err) {
          resolve({ files: null, error: err });
          return;
        }
        resolve({ files: files.filter(x => !x.startsWith('.')), error: null });
      });
    });
  }

  static hidden(path) {
    return new Promise(resolve => {
      fs.readdir(path, (err, files) => {
        if (err) {
          resolve({ files: null, error: err });
          return;
        }
        resolve({ files: files.filter(x => x.startsWith('.')), error: null });
      });
    });
  }

  static all(path) {
    return new Promise(resolve => {
      fs.readdir(path, (err, files) => {
        if (err) {
          resolve({ files: null, error: err });
          return;
        }
        resolve({ files: files, error: null });
      });
    });
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
    return new Promise(resolve => {
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
      fs.chmodSync(path, newPermNumStr, (err) => {
        if (err) {
          resolve({success: false, error: err});
          return;
        }
        resolve({success: true, error: null});
      });
    });
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

//---------------------------------------
// TEST



let P = '/home/isa/test_dir';

console.log('Testing REMOVE (dir)...');
Remove.directory(P).then(S => {
  if (S.error) {
    console.log(`REMOVE_ERROR:: ${S.error}`);
    return;
  }
  console.log(`REMOVE_SUCCESSFUL: ${S.success}`);

  Path.exists(P).then(E => {
    console.log(`EXISTS: ${E.exists}`);
  }).catch(fatalFail);
}).catch(fatalFail);