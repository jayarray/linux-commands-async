var OS = require('os');
var PATH = require('path');
var FS = require('fs-extra');
var RIMRAF = require('rimraf');
var MKDIRP = require('mkdirp');
var CHILD_PROCESS = require('child_process');

//-----------------------------------
// ERROR CATCHING

function fatalFail(error) {
  console.log(error);
  process.exit(-1);
}

function invalid_type(t) {
  if (t === undefined)
    return 'undefined';
  else if (t == null)
    return 'null';
  else if (t == '')
    return 'empty';
  else if (t.trim() == '')
    return 'whitespace';
  else
    return null;
}

//-----------------------------------
// SAVING DATA (to string)
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
    return new Promise((resolve, reject) => {
      let invalidType = invalid_type(cmd);
      if (invalidType) {
        reject({
          stderr: null,
          stdout: null,
          exitCode: null,
          error: `CMD_ERROR: Command is ${invalidType}`
        });
        return;
      }

      let childProcess = CHILD_PROCESS.spawn(cmd.trim(), args);
      let errors = new SavedData(childProcess.stderr);
      let outputs = new SavedData(childProcess.stdout);

      childProcess.on('close', exitCode => {
        resolve({
          stderr: errors.value,
          stdout: outputs.value,
          exitCode: exitCode,
          error: null
        });
      });
    });
  }

  static remote(user, host, cmd) {
    return new Promise((resolve, reject) => {
      let invalidType = invalid_type(user);
      if (invalidType) {
        reject({
          stderr: null,
          stdout: null,
          exitCode: null,
          error: `USER_ERROR: User is ${invalidType}`
        });
        return;
      }

      invalidType = invalid_type(host);
      if (invalidType) {
        reject({
          stderr: null,
          stdout: null,
          exitCode: null,
          error: `HOST_ERROR: Host is ${invalidType}`
        });
        return;
      }

      invalidType = invalid_type(cmd);
      if (invalidType) {
        reject({
          stderr: null,
          stdout: null,
          exitCode: null,
          error: `CMD_ERROR: Command is ${invalidType}`
        });
        return;
      }

      let args = [`${user.trim()}@${host.trim()}`, `${cmd.trim()}`];
      let childProcess = CHILD_PROCESS.spawn('ssh', args);
      let errors = new SavedData(childProcess.stderr);
      let outputs = new SavedData(childProcess.stdout);

      childProcess.on('close', exitCode => {
        resolve({
          stderr: errors.value,
          stdout: outputs.value,
          exitCode: exitCode,
          error: null
        });
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

    let adjustedHours = null;
    let timeStr = '';
    if (hours == 0) {
      adjustedHours = 12;
      timeStr = `${adjustedHours}:${minutesStr}:${secondsStr} AM`;
    }
    else if (hours == 12) {
      adjustedHours = 12;
      timeStr = `${adjustedHours}:${minutesStr}:${secondsStr} PM`;
    }
    else if (hours > 12) {
      adjustedHours = hours % 12;
      timeStr = `${adjustedHours}:${minutesStr}:${secondsStr} PM`;
    }
    else {
      adjustedHours = hours;
      timeStr = `${adjustedHours}:${minutesStr}:${secondsStr} AM`;
    }

    let meridiemTime = {  // 12-hour format (AM | PM)
      hours: adjustedHours,
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

    let weekDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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
    let parts = meridiemTime.split(':');

    let hoursStr = parts[0];
    let hoursVal = parseInt(hoursStr);

    let minutesStr = parts[1];
    let minutesVal = parseInt(minutesStr);

    let secondsStr = parts[2];
    let secondsVal = parseInt(secondsStr);

    let adjustedHours = null;
    if (meridiemTime.includes('AM') && hoursVal == 12) {
      adjustedhours = 0;
    }
    else if (meridiemTime.includes('PM') && hoursVal < 12) {
      adjustedHours = hoursVal + 12;
    }
    else {
      adjustedHours = hoursVal;
    }
    return `${adjustedHours}:${minutesStr}:${secondsStr}`;
  }

  static difference(d1, d2) {
    let date1 = new Date(d1.year, d1.month_number, d1.day_of_month, d1.hours, d1.minutes, d1.seconds, d1.milliseconds);
    let date2 = new Date(d2.year, d2.month_number, d2.day_of_month, d2.hours, d2.minutes, d2.seconds, d2.milliseconds);
    let diff = t1.getTime() - t2.getTime();

    let secondsFromD1ToD2 = diff / 1000;
    return secondsFromD1ToD2;
  }
}

//-------------------------------------------
// STATS 
class Stats {
  static stats(path) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ isDir: null, error: error });
        return;
      }

      let pTrimmed = path.trim();
      Path.exists(pTrimmed).then(results => {
        if (results.error) {
          reject({ stats: null, error: `PATH_ERROR: ${results.error}` });
          return;
        }

        if (!results.exists) {
          reject({ stats: null, error: `PATH_ERROR: Path does not exist: ${pTrimmed}` });
          return;
        }

        FS.lstat(pTrimmed, (err, stats) => {
          if (err)
            reject({ stats: null, error: err });
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
      }).catch(fatalFail);
    });
  }
}

//-------------------------------------------
// PATH
class Path {
  static exists(path) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ exists: null, error: error });
        return;
      }

      FS.access(path.trim(), FS.F_OK, (err) => {
        if (err)
          resolve({ exists: false, error: null });
        else
          resolve({ exists: true, error: null });
      });
    });
  }

  static is_file(path) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ exists: null, error: error });
        return;
      }

      let pTrimmed = path.trim();
      Path.exists(pTrimmed).then(results => {
        if (results.error) {
          reject({ isFile: null, error: results.error });
          return;
        }

        if (!results.exists) {
          reject({ isFile: null, error: `Path does not exist: ${pTrimmed}` });
          return;
        }

        FS.lstat(pTrimmed, (err, stats) => {
          if (err)
            reject({ isFile: null, error: err });
          else
            resolve({ isFile: stats.isFile() && !stats.isDirectory(), error: null });
        });
      }).catch(fatalFail);
    });
  }

  static is_dir(path) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ isDir: null, error: error });
        return;
      }

      let pTrimmed = path.trim();
      Path.exists(pTrimmed).then(results => {
        if (results.error) {
          reject({ isDir: null, error: results.error });
          return;
        }

        if (!results.exists) {
          reject({ isDir: null, error: `Path does not exist: ${pTrimmed}` });
          return;
        }

        FS.lstat(pTrimmed, (err, stats) => {
          if (err)
            reject({ isDir: null, error: err });
          else
            resolve({ isDir: stats.isDirectory(), error: null });
        });
      }).catch(fatalFail);
    });
  }

  static filename(path) {
    let error = Path.error(path);
    if (error)
      return { name: null, error: error };
    return { name: PATH.basename(path.trim()), error: null };
  }

  static extension(path) {
    let error = Path.error(path);
    if (error)
      return { extension: null, error: error };
    return { extension: PATH.extname(path.trim()), error: null };
  }

  static parent_dir_name(path) {
    let error = Path.error(path);
    if (error)
      return { name: null, error: error };
    return { name: PATH.dirname(path.trim()).split(PATH.sep).pop(), error: null };
  }

  static parent_dir(path) {
    let error = Path.error(path);
    if (error)
      return { dir: null, error: error };
    return { dir: PATH.dirname(path.trim()), error: null }; // Full path to parent dir
  }

  static error(path) {
    if (path === undefined)
      return 'Path is undefined';
    else if (path == null)
      return 'Path is null';
    else if (path == '')
      return 'Path is empty';
    else if (path.trim() == '')
      return 'Path is whitespace';
    else
      return null;
  }

  static escape(path) {
    if (path === undefined)
      return { string: null, error: `Path is undefined` };

    if (path == null)
      return { string: null, error: `Path is null` };
    return { string: escape(path.trim()), error: null };
  }

  static contains_whitespace(path) {
    if (path === undefined)
      return { hasWhitespace: null, error: `Path is undefined` };

    if (path == null)
      return { hasWhitespace: null, error: `Path is null` };
    return { hasWhitespace: path.includes(' '), error: null };
  }
}

//-------------------------------------------
// PERMISSIONS
class Permissions {
  static permissions(path) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ permissions: null, error: error });
        return;
      }

      let pTrimmed = path.trim();
      Path.exists(pTrimmed).then(results => {
        if (results.error) {
          reject({ permissions: null, error: results.error });
          return;
        }

        if (!results.exists) {
          reject({ permissions: null, error: `Path does not exist: ${pTrimmed}` });
          return;
        }

        FS.lstat(pTrimmed, (err, stats) => {
          if (err)
            reject({ permissions: null, error: err });
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
      }).catch(fatalFail);
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

  static obj_to_number_string(obj) {  // Example:  {u:{...}, g:{...}, o:{...}} --> 777 
    let values = { r: 4, w: 2, x: 1, '-': 0 };
    let leftNum = values[obj.u.r] + values[obj.u.w] + values[obj.u.x];
    let middleNum = values[obj.g.r] + values[obj.g.w] + values[obj.g.x];
    let rightNum = values[obj.o.r] + values[obj.o.w] + values[obj.o.x];
    return `${leftNum}${middleNum}${rightNum}`;
  }

  static perm_string_to_number_string(permString) {  // Example: rwxrwxrwx  --> 777
    let adjustedString = permString;
    if (permString.length > 9)
      adjustedString = permString.slice(1);

    let u = { r: adjustedString[0], w: adjustedString[1], x: adjustedString[2] };
    let g = { r: adjustedString[3], w: adjustedString[4], x: adjustedString[5] };
    let u = { r: adjustedString[6], w: adjustedString[7], x: adjustedString[8] };
    let obj = { u: u, g: g, o: o };
    return Permissions.obj_to_number_string(obj);
  }
}

//-------------------------------------------------
// COPY (cp)
class Copy {
  static copy(src, dest) {
    return new Promise((resolve, reject) => {
      let error = Path.error(src);
      if (error) {
        reject({ success: false, error: error });
        return;
      }

      let sTrimmed = src.trim();
      Path.exists(sTrimmed).then(results => {
        if (results.error) {
          reject({ success: false, error: results.error });
          return;
        }

        if (!results.exists) {
          reject({ success: false, error: `Path does not exist: ${sTrimmed}` });
          return;
        }

        FS.copy(sTrimmed, dest, (err) => {
          if (err) {
            reject({ success: false, error: err });
            return;
          }
          resolve({ success: true, error: null });
        });
      }).catch(fatalFail);
    });
  }
}

//-------------------------------------------------
// REMOVE (rm)
class Remove {
  static file(path) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ success: false, error: error });
        return;
      }

      let pTrimmed = path.trim();
      Path.exists(pTrimmed).then(results => {
        if (results.error) {
          reject({ success: false, error: results.error });
          return;
        }

        if (!results.exists) {
          reject({ success: false, error: `Path does not exist: ${pTrimmed}` });
          return;
        }

        Path.is_file(pTrimmed).then(results => {
          if (results.error) {
            resolve({ success: false, error: results.error });
            return;
          }

          if (!results.isFile) {
            resolve({ success: false, error: 'Path is not a file' });
            return;
          }

          FS.unlink(pTrimmed, (err) => {
            if (err) {
              reject({ success: false, error: err });
              return;
            }
            resolve({ success: true, error: null });
          });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }

  static directory(path) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ success: false, error: error });
        return;
      }

      let pTrimmed = path.trim();
      Path.exists(pTrimmed).then(results => {
        if (results.error) {
          reject({ successa: false, error: results.error });
          return;
        }

        if (!results.exists) {
          reject({ success: false, error: `Path does not exist: ${pTrimmed}` });
          return;
        }

        Path.is_dir(pTrimmed).then(results => {
          if (results.error) {
            resolve({ success: false, error: results.error });
            return;
          }

          if (!results.isDir) {
            resolve({ success: false, error: `Path is not a directory: ${pTrimmed}` });
            return;
          }

          RIMRAF(pTrimmed, (err) => {
            if (err) {
              reject({ success: false, error: err });
              return;
            }
            resolve({ success: true, error: null });
          });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }
}

//------------------------------------------------------
// MKDIR (mkdir)
class Mkdir {
  static mkdir(path) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ success: false, error: error });
        return;
      }

      FS.mkdir(path.trim(), (err) => {
        if (err) {
          reject({ success: false, error: err });
          return;
        }
        resolve({ success: true, error: null });
      });
    });
  }

  static mkdirp(path) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ success: false, error: error });
        return;
      }

      MKDIRP(path.trim(), (err) => {
        if (err) {
          reject({ success: false, error: err });
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
    return new Promise((resolve, reject) => {
      let error = Path.error(src);
      if (error) {
        reject({ success: false, error: error });
        return;
      }

      let sTrimmed = src.trim();
      Path.exists(sTrimmed).then(results => {
        if (results.error) {
          reject({ success: false, error: results.error });
          return;
        }

        if (!results.exists) {
          reject({ success: false, error: `Path does not exist: ${sTrimmed}` });
          return;
        }

        FS.move(sTrimmed, dest, (err) => {
          if (err) {
            reject({ success: false, error: err });
            return;
          }
          resolve({ success: true, error: null });
        });
      }).catch(fatalFail);
    });
  }
}

//------------------------------------------------------
// LIST (ls)
class List {
  static visible(path) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ files: null, error: error });
        return;
      }

      let pTrimmed = path.trim();
      Path.exists(pTrimmed).then(results => {
        if (results.error) {
          reject({ files: null, error: results.error });
          return;
        }

        if (!results.exists) {
          reject({ files: null, error: `Path does not exist: ${pTrimmed}` });
          return;
        }

        FS.readdir(pTrimmed, (err, files) => {
          if (err) {
            reject({ files: null, error: err });
            return;
          }
          resolve({ files: files.filter(x => !x.startsWith('.')), error: null });
        });
      }).catch(fatalFail);
    });
  }

  static hidden(path) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ files: null, error: error });
        return;
      }

      let pTrimmed = path.trim();
      Path.exists(pTrimmed).then(results => {
        if (results.error) {
          reject({ files: null, error: results.error });
          return;
        }

        if (!results.exists) {
          reject({ files: null, error: `Path does not exist: ${pTrimmed}` });
          return;
        }

        FS.readdir(pTrimmed, (err, files) => {
          if (err) {
            reject({ files: null, error: err });
            return;
          }
          resolve({ files: files.filter(x => x.startsWith('.')), error: null });
        });
      }).catch(fatalFail);
    });
  }

  static all(path) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ files: null, error: error });
        return;
      }

      let pTrimmed = path.trim();
      Path.exists(pTrimmed).then(results => {
        if (results.error) {
          reject({ files: null, error: results.error });
          return;
        }

        if (!results.exists) {
          reject({ files: null, error: `Path does not exist: ${pTrimmed}` });
          return;
        }

        FS.readdir(pTrimmed, (err, files) => {
          if (err) {
            reject({ files: null, error: err });
            return;
          }
          resolve({ files: files, error: null });
        });
      }).catch(fatalFail);
    });
  }
}

//------------------------------------------------
// RSYNC
class Rsync {
  static rsync(user, host, src, dest) {
    return new Promise((resolve, reject) => {
      let error = Path.error(src);
      if (error) {
        reject({
          success: false,
          error: error,
          stdout: null,
          stderr: null,
          exitCode: null
        });
        return;
      }

      let sTrimmed = src.trim();
      Path.exists(sTrimmed).then(results => {
        if (results.error) {
          reject({
            success: false,
            error: results.error,
            stdout: null,
            stderr: null,
            exitCode: null
          });
          return;
        }

        if (!results.exists) {
          reject({
            success: false,
            error: `Path does not exist: ${sTrimmed}`,
            stdout: null,
            stderr: null,
            exitCode: null
          });
          return;
        }

        let args = ['-a', sTrimmed, `${user}@${host}:${dest}`];
        Execute.local('rsync', args).then(output => {
          if (output.stderr) {
            reject({
              success: false,
              error: null,
              stdout: output.stdout,
              stderr: output.stderr,
              exitCode: output.exitCode
            });
            return;
          }
          resolve({
            success: true,
            error: null,
            stdout: output.stdout,
            stderr: output.stderr,
            exitCode: output.exitCode
          });
        }).catch(fatalFail);
      }).catch(fatalFail);;
    });
  }

  static update(user, host, src, dest) { // Update dest if src was updated
    return new Promise((resolve, reject) => {
      let error = Path.error(src);
      if (error) {
        reject({
          success: false,
          error: error,
          stdout: null,
          stderr: null,
          exitCode: null
        });
        return;
      }

      let sTrimmed = src.trim();
      Path.exists(sTrimmed).then(results => {
        if (results.error) {
          reject({
            success: false,
            error: results.error,
            stdout: null,
            stderr: null,
            exitCode: null
          });
          return;
        }

        if (!results.exists) {
          reject({
            success: false,
            error: `Path does not exist: ${sTrimmed}`,
            stdout: null,
            stderr: null,
            exitCode: null
          });
          return;
        }

        let args = ['-a', '--update', sTrimmed, `${user}@${host}:${dest}`];
        Execute.local('rsync', args).then(output => {
          if (output.stderr) {
            reject({
              success: false,
              error: null,
              stdout: output.stdout,
              stderr: output.stderr,
              exitCode: output.exitCode
            });
            return;
          }
          resolve({
            success: true,
            error: null,
            stdout: output.stdout,
            stderr: output.stderr,
            exitCode: output.exitCode
          });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }

  static match(user, host, src, dest) { // Copy files and then delete those NOT in src (Match dest to src)
    return new Promise((resolve, reject) => {
      let error = Path.error(src);
      if (error) {
        reject({
          success: false,
          error: error,
          stdout: null,
          stderr: null,
          exitCode: null
        });
        return;
      }

      let sTrimmed = src.trim();
      Path.exists(sTrimmed).then(results => {
        if (results.error) {
          reject({
            success: false,
            error: results.error,
            stdout: null,
            stderr: null,
            exitCode: null
          });
          return;
        }

        if (!results.exists) {
          reject({
            success: false,
            error: `Path does not exist: ${sTrimmed}`,
            stdout: null,
            stderr: null,
            exitCode: null
          });
          return;
        }

        let args = ['-a', '--delete-after', sTrimmed, `${user}@${host}:${dest}`];
        Execute.local('rsync', args).then(output => {
          if (output.stderr) {
            reject({
              success: false,
              error: null,
              stdout: output.stdout,
              stderr: output.stderr,
              exitCode: output.exitCode
            });
            return;
          }
          resolve({
            success: true,
            error: null,
            stdout: output.stdout,
            stderr: output.stderr,
            exitCode: output.exitCode
          });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }

  static manual(user, host, src, dest, flags, options) {  // flags: [chars], options: [strings]
    return new Promise((resolve, reject) => {
      let error = Path.error(src);
      if (error) {
        reject({
          success: false,
          error: error,
          stdout: null,
          stderr: null,
          exitCode: null
        });
        return;
      }

      let sTrimmed = src.trim();
      Path.exists(sTrimmed).then(results => {
        if (results.error) {
          reject({
            success: false,
            error: results.error,
            stdout: null,
            stderr: null,
            exitCode: null
          });
          return;
        }

        if (!results.exists) {
          reject({
            success: false,
            error: `Path does not exist: ${sTrimmed}`,
            stdout: null,
            stderr: null,
            exitCode: null
          });
          return;
        }

        let flagStr = `-${flags.join('')}`; // Ex.: -av
        let optionStr = options.join(' ');  // Ex.: --ignore times, --size-only, --exclude <pattern>

        let args = `${flagStr} ${optionStr} ${sTrimmed} ${user}@${host}:${dest}`.split(' ');
        Execute.local('rsync', args).then(output => {
          if (output.stderr) {
            reject({
              success: false,
              error: null,
              stdout: output.stdout,
              stderr: output.stderr,
              exitCode: output.exitCode
            });
            return;
          }
          resolve({
            success: true,
            error: null,
            stdout: output.stdout,
            stderr: output.stderr,
            exitCode: output.exitCode
          });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }

  static dry_run(user, host, src, dest, flags, options) { // Will execute without making changes (for testing command)
    return new Promise((resolve, reject) => {
      let error = Path.error(src);
      if (error) {
        reject({
          success: false,
          error: error,
          stdout: null,
          stderr: null,
          exitCode: null
        });
        return;
      }

      let sTrimmed = src.trim();
      Path.exists(sTrimmed).then(results => {
        if (results.error) {
          reject({
            success: false,
            error: results.error,
            stdout: null,
            stderr: null,
            exitCode: null
          });
          return;
        }

        if (!results.exists) {
          reject({
            success: false,
            error: `Path does not exist: ${sTrimmed}`,
            stdout: null,
            stderr: null,
            exitCode: null
          });
          return;
        }

        let flagStr = `-${flags.join('')}`; // Ex.: -av
        let optionStr = options.join(' ');  // Ex.: --ignore times, --size-only, --exclude <pattern>

        let args = `${flagStr} --dry-run ${optionStr} ${sTrimmed} ${user}@${host}:${dest}`.split(' ');
        Execute.local('rsync', args).then(output => {
          if (output.stderr) {
            reject({
              success: false,
              error: null,
              stdout: output.stdout,
              stderr: output.stderr,
              exitCode: output.exitCode
            });
            return;
          }
          resolve({
            success: true,
            error: null,
            stdout: output.stdout,
            stderr: output.stderr,
            exitCode: output.exitCode
          });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }
}

//-----------------------------------------
// CHMOD
class Chmod {
  static chmod(op, who, types, path) {    // op = (- | + | =)  who = [u, g, o]  types = [r, w, x]
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ success: false, error: error });
        return;
      }

      let pTrimmed = path.trim();
      Path.exists(pTrimmed).then(results => {
        if (results.error) {
          reject({ success: false, error: results.error });
          return;
        }

        if (!results.exists) {
          reject({ success: false, error: `Path does not exist: ${pTrimmed}` });
          return;
        }

        Permissions.permissions(pTrimmed).then(values => {
          if (values.error) {
            reject({ success: false, error: values.error });
            return;
          }

          let perms = values.permissions;
          let whoMapping = { u: 'owner', g: 'group', o: 'others' };
          who.forEach(w => {
            let whoString = whoMapping[w];

            if (op == '=') { // SET
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
          let newPermNumStr = Permissions.obj_to_number_string(obj);
          FS.chmod(pTrimmed, newPermNumStr, (err) => {
            if (err) {
              reject({ success: false, error: err });
              return;
            }
            resolve({ success: true, error: null });
          });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }
}

//-----------------------------------------------
// CHOWN
class Chown {
  static chown(path, uid, gid) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ success: false, error: error });
        return;
      }

      let pTrimmed = path.trim();
      Path.error(pTrimmed).then(results => {
        if (results.error) {
          reject({ success: false, error: results.error });
          return;
        }

        if (!results.exists) {
          reject({ success: false, error: `Path does not exist: ${pTrimmed}` });
          return;
        }

        FS.chown(pTrimmed, uid, gid, (err) => {
          if (err) {
            reject({ success: false, error: err });
            return;
          }
          resolve({ success: true, error: null });
        });
      }).catch(fatalFail);
    });
  }
}

//-----------------------------------------------
// USER
class UserInfo {
  static me() {
    let i = OS.userInfo();
    return { username: i.username, uid: i.uid, gid: i.gid };
  }

  static current() {
    return new Promise((resolve, reject) => {
      let username = OS.userInfo().username;
      Execute.local('id', [username]).then(output => {
        if (output.stderr) {
          reject({ info: null, error: output.stderr });
          return;
        }

        let outStr = output.stdout.trim();
        let parts = outStr.split(' ');

        // UID
        let uidParts = parts[0].split('=')[1];
        let uid = uidParts.split('(')[0];

        // GID
        let gidParts = parts[1].split('=')[1];
        let gid = gidParts.split('(')[0];

        // GROUPS
        let groupsParts = parts[2].split('=')[1].split(',');

        let groups = [];
        groupsParts.forEach(gStr => {
          let groupId = gStr.split('(')[0];
          let groupName = gStr.split('(')[1].slice(0, -1);
          groups.push({ gid: groupId, name: groupName });
        });

        resolve({
          info: {
            username: username,
            uid: uid,
            gid: gid,
            groups: groups
          },
          error: null
        });
      }).catch(fatalFail);
    });
  }

  static other(username) {
    return new Promise((resolve, reject) => {
      Execute.local('id', [username]).then(output => {
        if (output.stderr) {
          if (output.stderr.toLowerCase().includes('no such user'))
            reject({ info: null, error: `No such user: ${username}` });
          else
            reject({ info: null, error: output.stderr });
          return;
        }

        let outStr = output.stdout.trim();
        let parts = outStr.split(' ');

        // UID
        let uidParts = parts[0].split('=')[1];
        let uid = uidParts.split('(')[0];

        // GID
        let gidParts = parts[1].split('=')[1];
        let gid = gidParts.split('(')[0];

        // GROUPS
        let groupsParts = parts[2].split('=')[1].split(',');

        let groups = [];
        groupsParts.forEach(gStr => {
          let groupId = gStr.split('(')[0];
          let groupName = gStr.split('(')[1].slice(0, -1);
          groups.push({ gid: groupId, name: groupName });
        });

        resolve({
          info: {
            username: username,
            uid: uid,
            gid: gid,
            groups: groups
          },
          error: null
        });
      }).catch(fatalFail);
    });
  }
}

//-----------------------------------------------
// RENAME
class Rename {
  static rename(currPath, newName) {
    return new Promise((resolve, reject) => {
      let error = Path.error(currPath);
      if (error) {
        reject({ success: false, error: error });
        return;
      }

      let cTrimmed = currPath.trim();
      Path.exists(cTrimmed).then(results => {
        if (results.error) {
          reject({ success: false, error: results.error });
          return;
        }

        if (!results.exists) {
          reject({ success: false, error: `Path does not exist: ${cTrimmed}` });
          return;
        }

        let parentDir = Path.parent_dir(currPath).dir;
        let updatedPath = PATH.join(parentDir, newName);

        FS.rename(cTrimmed, updatedPath, (err) => {
          if (err) {
            reject({ success: false, error: err });
            return;
          }
          resolve({ success: true, error: null });
        });
      }).catch(fatalFail);
    });
  }
}

//---------------------------------------------------
// FILE
class File {
  static remove(path) {
    return Remove.file(path);
  }

  static create(path, text) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ success: false, error: error });
        return;
      }

      FS.writeFile(path.trim(), text, (err) => {
        if (err) {
          reject({ success: false, error: err });
        }
        resolve({ success: true, error: null })
      });
    });
  }

  static make_executable(path) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ success: false, error: error });
        return;
      }

      let pTrimmed = path.trim();
      Path.exists(pTrimmed).then(results => {
        if (results.error) {
          reject({ success: false, error: results.error });
          return;
        }

        if (!results.exists) {
          reject({ success: false, error: `Path does not exist: ${pTrimmed}` });
          return;
        }

        Path.is_file(pTrimmed).then(values => {
          if (values.error) {
            reject({ success: false, error: values.error });
            return;
          }

          if (!values.isFile) {
            reject({ success: false, error: `Path is not a file: ${pTrimmed}` });
            return;
          }

          let op = '+';
          let who = ['u', 'g', 'o'];
          let types = ['x'];
          Chmod.chmod(op, who, types, pTrimmed).then(vals => {
            if (vals.error) {
              reject({ success: false, error: vals.error });
              return;
            }
            resolve({ success: true, error: null });
          }).catch(fatalFail);
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }

  static read(path) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ content: null, error: error });
        return;
      }

      let pTrimmed = path.trim();
      Path.exists(pTrimmed).then(results => {
        if (results.error) {
          reject({ content: null, error: results.error });
          return;
        }

        if (!results.exists) {
          reject({ content: null, error: `Path does not exist: ${pTrimmed}` });
          return;
        }

        Path.is_file(pTrimmed).then(values => {
          if (values.error) {
            reject({ content: null, error: values.error });
            return;
          }

          if (!values.isFile) {
            reject({ content: null, error: `Path is not a file: ${pTrimmed}` });
            return;
          }

          FS.readFile(pTrimmed, (err, data) => {
            if (err) {
              reject({ content: null, error: err });
              return;
            }
            resolve({ content: data, error: null });
          });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }

  static read_lines(path) {
    return new Promise((resolve, reject) => {
      File.read(path).then(results => {
        if (results.error) {
          reject({ lines: null, error: results.error });
          return;
        }
        resolve({ lines: results.content.toString().split('\n'), error: null });
      });
    });
  }
}

//-----------------------------------------
// DIRECTORY
class Directory {
  static remove(path) {
    return Remove.directory(path);
  }

  static create(path) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ success: false, error: error });
        return;
      }

      Mkdir.mkdirp(path.trim()).then(results => {
        if (results.error) {
          reject({ success: false, error: results.error });
          return;
        }
        resolve({ success: true, error: null });
      }).catch(fatalFail);
    });
  }
}

//----------------------------------------
// BASH SCRIPT
class BashScript {
  static create(path, content) {
    return new Promise((resolve, reject) => {
      File.create(path, `#!/bin/bash\n${content}`).then(results => {
        if (results.error) {
          reject({ success: false, error: results.error });
          return;
        }

        File.make_executable(path).then(values => {
          if (values.error) {
            reject({ success: false, error: values.error });
            return;
          }
          resolve({ success: true, error: null });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }

  static execute(path, content) {
    return new Promise((resolve, reject) => {
      BashScript.create(path, content).then(results => {
        if (results.error) {
          reject({ success: false, output: null, error: results.error });
          return;
        }

        Execute.local(path).then(values => {
          if (values.stderr) {
            reject({ success: false, output: null, error: values.stderr });
            return;
          }
          resolve({ success: true, output: values.stdout, error: null });
          Remove.file(path).then(ret => {
          }).catch(fatalFail);
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }
}

//------------------------------------
// FIND
class Find {
  static manual(path, options) {  // options = [ "-option [value]" ]
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ results: null, error: error });
        return;
      }

      let pTrimmed = path.trim();
      Path.exists(pTrimmed).then(results => {
        if (results.error) {
          reject({ results: null, error: results.error });
          return;
        }

        if (!results.exists) {
          reject({ results: null, error: `Path does not exist: ${pTrimmed}` });
          return;
        }

        let cmd = `find ${pTrimmed}`;
        options.forEach(o => cmd += ` ${o}`);

        let tempFilepath = PATH.join(pTrimmed, 'temp_manual.sh');
        BashScript.execute(tempFilepath, cmd).then(values => {
          if (values.error) {
            reject({ results: null, error: values.error });
            return;
          }

          let lines = values.output.split('\n').filter(line => line && line.trim() != '' && line != path && line != tempFilepath);
          resolve({ results: lines, error: null });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }

  static files_by_pattern(path, pattern, maxDepth) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ results: null, error: error });
        return;
      }

      let pTrimmed = path.trim();
      Path.exists(pTrimmed).then(results => {
        if (results.error) {
          reject({ results: null, error: results.error });
          return;
        }

        if (!results.exists) {
          reject({ results: null, error: `Path does not exist: ${pTrimmed}` });
          return;
        }

        let cmd = `find ${pTrimmed}`;
        if (maxDepth && maxDepth > 0)
          cmd += ` -maxdepth ${maxDepth}`;
        cmd += ` -type f -name "${pattern}"`;

        let tempFilepath = PATH.join(pTrimmed, 'temp_files_by_pattern.sh');
        BashScript.execute(tempFilepath, cmd).then(values => {
          if (values.error) {
            reject({ results: null, error: values.error });
            return;
          }

          let lines = values.output.split('\n').filter(line => line && line.trim() != '' && line != path && line != tempFilepath);
          resolve({ results: lines, error: null });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }

  static files_by_content(path, text, maxDepth) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ results: null, error: error });
        return;
      }

      let pTrimmed = path.trim();
      Path.exists(pTrimmed).then(results => {
        if (results.error) {
          reject({ results: null, error: results.error });
          return;
        }

        if (!results.exists) {
          reject({ results: null, error: `Path does not exist: ${pTrimmed}` });
          return;
        }

        let cmd = `find ${pTrimmed}`;
        if (maxDepth && maxDepth > 0)
          cmd += ` -maxdepth ${maxDepth}`;
        cmd += ` -type f -exec grep -l "${text}" "{}" \\;`;

        let tempFilepath = PATH.join(pTrimmed, 'temp_files_by_content.sh');
        BashScript.execute(tempFilepath, cmd).then(values => {
          if (values.error) {
            reject({ results: null, error: values.error });
            return;
          }

          let lines = values.output.split('\n').filter(line => line && line.trim() != '' && line != path && line != tempFilepath);
          resolve({ results: lines, error: null });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }

  static files_by_user(path, user, maxDepth) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ results: null, error: error });
        return;
      }

      let pTrimmed = path.trim();
      Path.exists(pTrimmed).then(results => {
        if (results.error) {
          reject({ results: null, error: results.error });
          return;
        }

        if (!results.string) {
          reject({ results: null, error: `Path does not exist: ${pTrimmed}` });
          return;
        }

        let cmd = `find ${pTrimmed}`;
        if (maxDepth && maxDepth > 0)
          cmd += ` -maxdepth ${maxDepth}`;
        cmd += ` -type f -user ${user}`;

        let tempFilepath = PATH.join(pTrimmed, 'temp_files_by_user.sh');
        BashScript.execute(tempFilepath, cmd).then(values => {
          if (values.error) {
            reject({ results: null, error: values.error });
            return;
          }

          let lines = values.output.split('\n').filter(line => line && line.trim() != '' && line != path && line != tempFilepath);
          resolve({ results: lines, error: null });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }

  static dir_by_pattern(path, pattern, maxDepth) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ results: null, error: error });
        return;
      }

      let pTrimmed = path.trim();
      Path.exists(pTrimmed).then(results => {
        if (results.error) {
          reject({ results: null, error: results.error });
          return;
        }

        if (!results.exists) {
          reject({ results: null, error: `Path does not exist: ${pTrimmed}` });
          return;
        }

        let cmd = `find ${pTrimmed}`;
        if (maxDepth && maxDepth > 0)
          cmd += ` -maxdepth ${maxDepth}`;
        cmd += ` -type d -name "${pattern}"`;

        let tempFilepath = PATH.join(pTrimmed, 'temp_dir_by_pattern.sh');
        BashScript.execute(tempFilepath, cmd).then(values => {
          if (values.error) {
            reject({ results: null, error: values.error });
            return;
          }

          let lines = values.output.split('\n').filter(line => line && line.trim() != '' && line != path && line != tempFilepath);
          resolve({ results: lines, error: null });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }

  static empty_files(path, maxDepth) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ results: null, error: error });
        return;
      }

      let pTrimmed = path.trim();
      Path.exists(pTrimmed).then(results => {
        if (results.error) {
          reject({ results: null, error: results.error });
          return;
        }

        if (!results.exists) {
          reject({ results: null, error: `Path does not exist: ${pTrimmed}` });
          return;
        }

        let cmd = `find ${pTrimmed}`;
        if (maxDepth && maxDepth > 0)
          cmd += ` -maxdepth ${maxDepth}`;
        cmd += ` -empty -type f`;

        let tempFilepath = PATH.join(pTrimmed, 'temp_empty_files.sh');
        BashScript.execute(tempFilepath, cmd).then(values => {
          if (values.error) {
            reject({ results: null, error: values.error });
            return;
          }

          let lines = values.output.split('\n').filter(line => line && line.trim() != '' && line != path && line != tempFilepath);
          resolve({ results: lines, error: null });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }

  static empty_dirs(path, maxDepth) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ results: null, error: error });
        return;
      }

      let pTrimmed = path.trim();
      Path.exists(pTrimmed).then(results => {
        if (results.error) {
          reject({ results: null, error: results.error });
          return;
        }

        if (!results.exists) {
          reject({ results: null, error: `Path does not exist: ${pTrimmed}` });
          return;
        }

        let cmd = `find ${pTrimmed}`;
        if (maxDepth && maxDepth > 0)
          cmd += ` -maxdepth ${maxDepth}`;
        cmd += ` -empty -type d`;

        let tempFilepath = PATH.join(pTrimmed, 'temp_empty_dirs.sh');
        BashScript.execute(tempFilepath, cmd).then(values => {
          if (values.error) {
            reject({ results: null, error: values.error });
            return;
          }

          let lines = values.output.split('\n').filter(line => line && line.trim() != '' && line != path && line != tempFilepath);
          resolve({ results: lines, error: null });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }
}

//------------------------------------
// TEST

let user = 'pi';
let host = 'mama';
let cmd = 'ls';

Execute.remote(user, host, cmd).then(results => {
  console.log(`STDERR: ${results.stderr}`);
  console.log(`STDOUT: ${results.stdout}`);
  console.log(`EXIT_CODE: ${results.exitCode}`);
}).catch(e => {
  console.log(`ERROR: ${e.error}`);
});
return;

//------------------------------------
// EXPORTS

exports.Execute = Execute;
exports.Timestamp = Timestamp;
exports.Stats = Stats;
exports.Path = Path;
exports.Permissions = Permissions;
exports.Copy = Copy;
exports.Remove = Remove;
exports.Mkdir = Mkdir;
exports.Move = Move;
exports.List = List;
exports.Rsync = Rsync;
exports.Chmod = Chmod;
exports.Chown = Chown;
exports.UserInfo = UserInfo;
exports.Rename = Rename;
exports.File = File;
exports.Directory = Directory;
exports.BashScript = BashScript;
exports.Find = Find;