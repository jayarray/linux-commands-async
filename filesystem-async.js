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
          error: `CMD_ERROR: Command is ${invalidType}`,
          stderr: null,
          stdout: null,
          exitCode: null,
        });
        return;
      }

      let childProcess = CHILD_PROCESS.spawn(cmd.trim(), args);
      let errors = new SavedData(childProcess.stderr);
      let outputs = new SavedData(childProcess.stdout);

      childProcess.on('close', exitCode => {
        resolve({
          error: null,
          stderr: errors.value,
          stdout: outputs.value,
          exitCode: exitCode,
        });
      });
    });
  }

  static remote(user, host, cmd) {
    return new Promise((resolve, reject) => {
      let invalidType = invalid_type(user);
      if (invalidType) {
        reject({
          error: `USER_ERROR: User is ${invalidType}`,
          stderr: null,
          stdout: null,
          exitCode: null,
        });
        return;
      }

      invalidType = invalid_type(host);
      if (invalidType) {
        reject({
          error: `HOST_ERROR: Host is ${invalidType}`,
          stderr: null,
          stdout: null,
          exitCode: null,

        });
        return;
      }

      invalidType = invalid_type(cmd);
      if (invalidType) {
        reject({
          error: `CMD_ERROR: Command is ${invalidType}`,
          stderr: null,
          stdout: null,
          exitCode: null,
        });
        return;
      }

      let args = [`${user.trim()}@${host.trim()}`, `${cmd.trim()}`];
      let childProcess = CHILD_PROCESS.spawn('ssh', args);
      let errors = new SavedData(childProcess.stderr);
      let outputs = new SavedData(childProcess.stdout);

      childProcess.on('close', exitCode => {
        resolve({
          error: null,
          stderr: errors.value,
          stdout: outputs.value,
          exitCode: exitCode,
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

    let monthNumber = d.getMonth(); // 0-11;
    let monthName = Timestamp.month_list()[monthNumber];
    let dayOfMonth = d.getDate(); // 1-31

    let dayOfWeekNumber = d.getDay();  // 0-6
    let dayOfWeekName = Timestamp.day_of_week_list()[dayOfWeekNumber];

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
    let error = Timestamp.military_string_error(militaryTime);
    if (error)
      return { string: null, error: error };

    let parts = militaryTime.trim().split(':');

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
    return { string: timeStr, error: null };
  }

  static meridiem_to_military_time(meridiemTime) {
    let error = Timestamp.meridiem_string_error(meridiemTime);
    if (error)
      return { string: null, error: error };

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
    return { string: `${adjustedHours}:${minutesStr}:${secondsStr}`, error: null };
  }

  static difference(d1, d2) {
    let error = Timestamp.date_obj_error(d1);
    if (error)
      return { milliseconds: null, error: `DATE1_OBJ_ERROR: ${error}` };

    let error = Timestamp.date_obj_error(d2);
    if (error)
      return { milliseconds: null, error: `DATE2_OBJ_ERROR: ${error}` };

    let date1 = new Date(d1.year, d1.month_number, d1.day_of_month, d1.hours, d1.minutes, d1.seconds, d1.milliseconds);
    let date2 = new Date(d2.year, d2.month_number, d2.day_of_month, d2.hours, d2.minutes, d2.seconds, d2.milliseconds);
    return date1.getTime() - d2.getTime();
  }

  static meridiem_string_error(string) {
    let invalidType = invalid_type(string);
    if (invalidType)
      return `MERIDIEM_TIME_STR_ERROR: Time string is ${string}`;

    let sTrimmed = string.trim();
    let parts = sTrimmed.split(' ');  // parts = ['HH:MM:SS', '(AM|PM)']
    if (parts.length == 2) {
      let unitParts = parts[0].trim();
      if (unitParts.length == 3) {
        let hMin = 1;
        let hMax = 12;
        let mMin = 0;
        let mMax = 59;
        let sMin = mMin;
        let sMax = mMax;

        let hStr = unitParts[0].trim();
        if (hStr.length == 2) {
          let hours = null;
          try {
            hours = parseInt(hStr);
          } catch {
            return 'MERIDIEM_TIME_STR_ERROR: Hours do not resolve to an integer';
          }

          if (hours < hMin && hours > hMax)
            return `MERIDIEM_TIME_STR_ERROR: Hours must be between ${hMin} and ${hMax}`;

          let mStr = unitParts[1].trim();
          if (mStr.length == 2) {
            let minutes = null;
            try {
              minutes = parseInt(mStr);
            } catch {
              return 'MERIDIEM_TIME_STR_ERROR: Minutes do not resolve to an integer';
            }

            if (minutes < mMin && minutes > mMax)
              return `MERIDIEM_TIME_STR_ERROR: Minutes must be between ${mMin} and ${mMax}`;

            let sStr = unitParts[2].trim();
            if (sStr.length == 2) {
              let seconds = null;
              try {
                seconds = parseInt(sStr);
              } catch {
                return 'MERIDIEM_TIME_STR_ERROR: Seconds do not resolve to an integer';
              }

              if (seconds < sMin && seconds > sMax)
                return `MERIDIEM_TIME_STR_ERROR: Seconds must be between ${sMin} and ${sMax}`;

              let suffix = parts[1].trim();
              if (suffix == 'AM' || 'PM')
                return null;
              else
                return 'MERIDIEM_TIME_STR_ERROR: Suffix (AM|PM) is not formatted correctly';
            }
            else
              return 'MERIDIEM_TIME_STR_ERROR: Seconds are not formatted correctly';
          }
          else
            return 'MERIDIEM_TIME_STR_ERROR: Minutes are not formatted correctly';
        }
        else
          return 'MERIDIEM_TIME_STR_ERROR: Hours are not formatted correctly';
      }
    }
    return 'MERIDIEM_TIME_STR_ERROR: Time string is not formatted correctly. Must follow format HH:MM:SS (AM|PM)';
  }

  static military_string_error(string) {
    let invalidType = invalid_type(string);
    if (invalidType)
      return `MILITARY_TIME_STR_ERROR: Time string is ${string}`;

    let sTrimmed = string.trim();
    let parts = sTrimmed.split(':');  // parts = ['HH', 'MM', 'SS [(AM|PM)]'] <-- Check for suffix in SECONDS string
    if (parts.length == 3) {
      let hMin = 0;
      let hMax = 23;
      let mMin = 0;
      let mMax = 59;
      let sMin = mMin;
      let sMax = mMax;

      let hStr = parts[0].trim();
      if (hStr.length == 2) {
        let hours = null;
        try {
          hours = parseInt(hStr);
        } catch {
          return 'MILITARY_TIME_STR_ERROR: Hours do not resolve to an integer';
        }

        if (hours < hMin && hours > hMax)
          return `MILITARY_TIME_STR_ERROR: Hours must be between ${hMin} and ${hMax}`;

        let mStr = parts[1].trim();
        if (mStr.length == 2) {
          let minutes = null;
          try {
            minutes = parseInt(mStr);
          } catch {
            return 'MILITARY_TIME_STR_ERROR: Minutes do not resolve to an integer';
          }

          if (minutes < mMin && minutes > mMax)
            return `MILITARY_TIME_STR_ERROR: Minutes must be between ${mMin} and ${mMax}`;

          let sStr = parts[2].trim();
          let sParts = sStr.split(' ');
          if (sParts.length == 2)
            return 'MILITARY_TIME_STR_ERROR: Trailing chars at end of time string';

          if (sStr.length == 2) {
            let seconds = null;
            try {
              seconds = parseInt(sStr);
            } catch {
              return 'MILITARY_TIME_STR_ERROR: Seconds do not resolve to an integer';
            }

            if (seconds < sMin && seconds > sMax)
              return `MILITARY_TIME_STR_ERROR: Seconds must be between ${sMin} and ${sMax}`;
            return null;
          }
          else
            return 'MILITARY_TIME_STR_ERROR: Seconds are not formatted correctly';
        }
        else
          return 'MILITARY_TIME_STR_ERROR: Minutes are not formatted correctly';
      }
      else
        return 'MILITARY_TIME_STR_ERROR: Hours are not formatted correctly';

    }
    return 'MILITARY_TIME_STR_ERROR: Time string is not formatted correctly. Must follow format HH:MM:SS';
  }

  static date_obj_error(dateObj) {
    let invalidType = invalid_type(dateObj);
    if (invalidType)
      return `Date object is ${invalidType}`;

    // Check if obj missing values
    if (
      dateObj.year &&
      dateObj.month_number &&
      dateObj.day_of_month &&
      dateObj.hours &&
      dateObj.minutes &&
      dateObj.seconds &&
      dateObj.milliseconds
    )
      return 'Date object is missing required values';

    // Check if obj values are all integers and in range
    if (
      Number.isInteger(dateObj.year) &&
      Number.isInteger(dateObj.month_number) &&
      Number.isInteger(dateObj.day) &&
      Number.isInteger(dateObj.hours) &&
      Number.isInteger(dateObj.minutes) &&
      Number.isInteger(dateObj.seconds) &&
      Number.isInteger(dateObj.milliseconds)
    )
      return 'Date object values must all be integers';

    // Check if numbers are in range
    let monthMin = 1;
    let monthMax = 12;
    let dayMin = 1;
    let dayMax = 31;
    let hoursMin = 0;
    let hoursMax = 23;
    let minutesMin = 0;
    let minutesMax = 59;
    let secondsMin = 0;
    let secondsMax = 59;
    let millisecondsMin = 0;
    let millisecondsMax = 999;

    if (dateObj.year < 0)
      return 'Year must be integer greater than 0';

    if (dateObj.month_number < monthMin && dateObj.month_number > monthMax)
      return `Month must be integer between ${monthMin} and ${monthMax}`;

    if (dateObj.day < dayMin && dateObj.day > dayMax)
      return `Day must be integer between ${dayMin} and ${dayMax}`;

    if (dateObj.hours < hoursMin && dateObj.hours > hoursMax)
      return `Hours must be integer between ${hoursMin} and ${hoursMax}`;

    if (dateObj.minutes < minutesMin && dateObj.minutes > minutesMax)
      return `Minutes must be integer between ${minutesMin} and ${minutesMax}`;

    if (dateObj.seconds < secondsMin && dateObj.seconds > secondsMax)
      return `Seconds must be integer between ${secondsMin} and ${secondsMax}`;

    if (dateObj.milliseconds < millisecondsMin && dateObj.milliseconds > millisecondsMax)
      return `Milliseconds must be integer between ${millisecondsMin} and ${millisecondsMax}`;

    return null;
  }

  static month_list() {
    return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  }

  static month_name_to_index(name) {
    let invalidType = invalid_type(name);
    if (invalidType)
      return { index: null, error: `MONTH_NAME_ERROR: Name is ${invalidType}` };

    let months = Timestamp.month_list();
    if (months.includes(name))
      return { index: months.indexOf(name), error: null };
    return { index: null, error: `MONTH_NAME_ERROR: Name is not a valid name` };
  }

  static day_of_week_list() {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  }

  static day_of_week_name_to_index(name) {
    let invalidType = invalid_type(name);
    if (invalidType)
      return { index: null, error: `DAY_OF_WEEK_NAME_ERROR: Name is ${invalidType}` };

    let days_of_the_week = Timestamp.month_list();
    if (days_of_the_week.includes(name))
      return { index: days_of_the_week.indexOf(name), error: null };
    return { index: null, error: `DAY_OF_WEEK_NAME_ERROR: Name is not a valid name` };
  }
}

//-------------------------------------------
// PATH
class Path {
  static exists(path) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ exists: null, error: `PATH_ERROR: ${error}` });
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
        reject({ isFile: null, error: `PATH_ERROR: ${error}` });
        return;
      }

      let pTrimmed = path.trim();
      Path.exists(pTrimmed).then(results => {
        if (results.error) {
          reject({ isFile: null, error: `PATH_ERROR: ${results.error}` });
          return;
        }

        if (!results.exists) {
          reject({ isFile: null, error: `PATH_ERROR: Path does not exist: ${pTrimmed}` });
          return;
        }

        FS.lstat(pTrimmed, (err, stats) => {
          if (err)
            reject({ isFile: null, error: `FS_LSTAT_ERROR: ${err}` });
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
        reject({ isDir: null, error: `PATH_ERROR: ${error}` });
        return;
      }

      let pTrimmed = path.trim();
      Path.exists(pTrimmed).then(results => {
        if (results.error) {
          reject({ isDir: null, error: `PATH_ERROR: ${results.error}` });
          return;
        }

        if (!results.exists) {
          reject({ isDir: null, error: `PATH_ERROR: Path does not exist: ${pTrimmed}` });
          return;
        }

        FS.lstat(pTrimmed, (err, stats) => {
          if (err)
            reject({ isDir: null, error: `FS_LSTAT_ERROR: ${err}` });
          else
            resolve({ isDir: stats.isDirectory(), error: null });
        });
      }).catch(fatalFail);
    });
  }

  static filename(path) {
    let error = Path.error(path);
    if (error)
      return { name: null, error: `PATH_ERROR: ${error}` };
    return { name: PATH.basename(path.trim()), error: null };
  }

  static extension(path) {
    let error = Path.error(path);
    if (error)
      return { extension: null, error: `PATH_ERROR: ${error}` };
    return { extension: PATH.extname(path.trim()), error: null };
  }

  static parent_dir_name(path) {
    let error = Path.error(path);
    if (error)
      return { name: null, error: `PATH_ERROR: ${error}` };
    return { name: PATH.dirname(path.trim()).split(PATH.sep).pop(), error: null };
  }

  static parent_dir(path) {
    let error = Path.error(path);
    if (error)
      return { dir: null, error: `PATH_ERROR: ${error}` };
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
      return { string: null, error: `PATH_ERROR: Path is undefined` };

    if (path == null)
      return { string: null, error: `PATH_ERROR: Path is null` };
    return { string: escape(path.trim()), error: null };
  }

  static contains_whitespace(path) {
    if (path === undefined)
      return { hasWhitespace: null, error: `PATH_ERROR: Path is undefined` };

    if (path == null)
      return { hasWhitespace: null, error: `PATH_ERROR: Path is null` };
    return { hasWhitespace: path.includes(' '), error: null };
  }
}

//-------------------------------------------
// PERMISSIONS
class Permissions {
  static file_permissions(path) {
    return new Promise((resolve, reject) => {
      Path.is_file(pTrimmed).then(results => {
        if (results.error) {
          reject({ permissions: null, error: results.error });
          return;
        }

        let pTrimmed = path.trim();
        if (!results.isFile) {
          reject({ permissions: null, error: `PATH_ERROR: Path is not a file: ${pTrimmed}` });
          return;
        }

        List.file_item(pTrimmed).then(values => {
          if (values.error) {
            reject({ permissions: null, error: values.error });
            return;
          }

          let permStr = values.item.permstr.trim();

          let octalStr = Permissions.perm_string_to_octal_string(permStr.substring(1, 10));
          if (octalStr.error) {
            reject({ permissions: null, error: octalStr.error });
            return;
          }

          let perms = {
            u: {
              r: permStr.charAt(1) != '-',
              w: permStr.charAt(2) != '-',
              x: permStr.charAt(3) != '-' && !Permissions.is_non_executable_char(permStr.charAt(3)),
              xchar: permStr.charAt(3),
              string: `${permStr.charAt(1)}${permStr.charAt(2)}${permStr.charAt(3)}`
            },
            g: {
              r: permStr.charAt(4) != '-',
              w: permStr.charAt(5) != '-',
              x: permStr.charAt(6) != '-' && !Permissions.is_non_executable_char(permStr.charAt(6)),
              xchar: permStr.charAt(6),
              string: `${permStr.charAt(4)}${permStr.charAt(5)}${permStr.charAt(6)}`
            },
            o: {
              r: permStr.charAt(7) != '-',
              w: permStr.charAt(8) != '-',
              x: permStr.charAt(9) != '-' && !Permissions.is_non_executable_char(permStr.charAt(9)),
              xchar: permStr.charAt(9),
              string: `${permStr.charAt(7)}${permStr.charAt(8)}${permStr.charAt(9)}`
            },
            octal: {
              string: octalStr.string,
              special: parseInt(octalStr.string.charAt(0)),
              user: parseInt(octalStr.string.charAt(1)),
              group: parseInt(octalStr.string.charAt(2)),
              others: parseInt(octalStr.string.charAt(3))
            },
            owner: values.item.owner.trim(),
            group: values.item.group.trim(),
            string: permStr
          };
          resolve({ permissions: perms, error: null });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }

  static dir_permissions(path) {
    return new Promise((resolve, reject) => {
      Path.is_dir(pTrimmed).then(results => {
        if (results.error) {
          reject({ permissions: null, error: results.error });
          return;
        }

        let pTrimmed = path.trim();
        if (!results.isDir) {
          reject({ permissions: null, error: `PATH_ERROR: Path is not a directory: ${pTrimmed}` });
          return;
        }

        List.dir_item(pTrimmed).then(values => {
          if (values.error) {
            reject({ permissions: null, error: values.error });
            return;
          }

          let permStr = values.item.permstr.trim();

          let octalStr = Permissions.perm_string_to_octal_string(permStr.substring(1, 10));
          if (octalStr.error) {
            reject({ permissions: null, error: octalStr.error });
            return;
          }

          let perms = {
            u: {
              r: permStr.charAt(1) != '-',
              w: permStr.charAt(2) != '-',
              x: permStr.charAt(3) != '-' && !Permissions.is_non_executable_char(permStr.charAt(3)),
              xchar: permStr.charAt(3),
              string: `${permStr.charAt(1)}${permStr.charAt(2)}${permStr.charAt(3)}`
            },
            g: {
              r: permStr.charAt(4) != '-',
              w: permStr.charAt(5) != '-',
              x: permStr.charAt(6) != '-' && !Permissions.is_non_executable_char(permStr.charAt(6)),
              xchar: permStr.charAt(6),
              string: `${permStr.charAt(4)}${permStr.charAt(5)}${permStr.charAt(6)}`
            },
            o: {
              r: permStr.charAt(7) != '-',
              w: permStr.charAt(8) != '-',
              x: permStr.charAt(9) != '-' && !Permissions.is_non_executable_char(permStr.charAt(9)),
              xchar: permStr.charAt(9),
              string: `${permStr.charAt(7)}${permStr.charAt(8)}${permStr.charAt(9)}`
            },
            octal: {
              string: octalStr.string,
              special: parseInt(octalStr.string.charAt(0)),
              user: parseInt(octalStr.string.charAt(1)),
              group: parseInt(octalStr.string.charAt(2)),
              others: parseInt(octalStr.string.charAt(3))
            },
            owner: values.item.owner.trim(),
            group: values.item.group.trim(),
            string: permStr
          };
          resolve({ permissions: perms, error: null });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }

  static permissions(path) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ permissions: null, error: `PATH_ERROR: ${error}` });
        return;
      }

      let pTrimmed = path.trim();
      Path.exists(pTrimmed).then(results => {
        if (results.error) {
          reject({ permissions: null, error: `PATH_ERROR: ${results.error}` });
          return;
        }

        if (!results.exists) {
          reject({ permissions: null, error: `PATH_ERROR: Path does not exist: ${pTrimmed}` });
          return;
        }

        FS.lstat(pTrimmed, (err, stats) => {
          if (err)
            reject({ permissions: null, error: `FS_LSTAT_ERROR: ${err}` });
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

            Permissions.octal_string(pTrimmed).then(values => {
              if (values.error) {
                reject({ permissions: null, error: `PATH_ERROR: Path does not exist: ${pTrimmed}` });
                return;
              }
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
            }).catch(fatalFail);
          }
        });
      }).catch(fatalFail);
    });
  }

  static obj_error(obj) {
    let invalidType = invalid_type(obj);
    if (invalidType)
      return `Permissions object is ${invalidType}`;

    // Check if obj missing values
    if (
      obj.u && obj.u.r && obj.u.w && obj.u.x && obj.u.xchar && obj.u.string &&
      obj.g && obj.g.r && obj.g.w && obj.g.x && obj.g.xchar && obj.g.string &&
      obj.o && obj.o.r && obj.o.w && obj.o.x && obj.o.xchar && obj.o.string &&
      obj.octal && obj.octal.string && obj.octal.special && obj.octal.user && obj.octal.group && obj.octal.others &&
      obj.owner &&
      obj.group &&
      obj.string
    )
      return 'Permissions object is missing required values';

    // Check if obj values are correct types
    let boolVars = [obj.u.r, obj.u.w, obj.u.x, obj.g.r, obj.g.w, obj.g.x, obj.o.r, obj.o.w, obj.o.x];
    boolVars.forEach(bvar => {
      if (bvar === true || bvar === false)
        return 'Permissions object values for u,g,o are all required to be boolean (true|false)';
    });

    if (
      obj.octal.string != '' &&
      obj.octal.string.trim() &&
      Number.isInteger(obj.octal.special) &&
      Number.isInteger(obj.octal.user) &&
      Number.isInteger(obj.octal.group) &&
      Number.isInteger(obj.octal.others)
    )
      return 'Permissions object values for octal are incorrect types';

    if (
      obj.owner != '' && obj.owner.trim() &&
      obj.group != '' && obj.group.trim() &&
      obj.string != '' && obj.string.trim()
    )
      return 'Permissions object values for owner, group, string are empty or whitespace';

    return null;
  }

  static equal(p1, p2) {
    let error = Permissions.obj_error(p1);
    if (error)
      return { equal: null, error: `PERM1_OBJ_ERROR: ${error}` };

    error = Permissions.obj_error(p2);
    if (error)
      return { equal: null, error: `PERM2_OBJ_ERROR: ${error}` };

    let equal = p1.u.r == p2.u.r &&
      p1.u.w == p2.u.w &&
      p1.u.x == p2.u.x &&
      p1.u.xchar == p2.u.xchar &&
      p1.u.string == p2.u.string &&

      p1.g.r == p2.g.r &&
      p1.g.w == p2.g.w &&
      p1.g.x == p2.g.x &&
      p1.g.xchar == p2.g.xchar &&
      p1.g.string == p2.g.string &&

      p1.o.r == p2.o.r &&
      p1.o.w == p2.o.w &&
      p1.o.x == p2.o.x &&
      p1.o.xchar == p2.o.xchar &&
      p1.o.string == p2.o.string &&

      p1.octal.string == p2.octal.string &&
      p1.octal.special == p2.octal.special &&
      p1.octal.user == p2.octal.user &&
      p1.octal.group == p2.octal.group &&
      p1.octal.others == p2.octal.others &&

      p1.owner == p2.owner &&
      p1.group == p2.group &&
      p1.string == p2.string;

    return { equal: equal, error: null };
  }

  static obj_to_octal_string(obj) {  // Example:  {u:{...}, g:{...}, o:{...}} --> 777 
    let invalidType = invalid_type(obj);
    if (invalidType)
      return { string: null, error: `OBJ_ERROR: Object is ${invalidType}` };

    // Check if obj missing values
    if (
      obj.u && obj.u.r && obj.u.w && obj.u.x && obj.u.xchar &&
      obj.g && obj.g.r && obj.g.w && obj.g.x && obj.g.xchar &&
      obj.o && obj.o.r && obj.o.w && obj.o.x && obj.o.xchar
    )
      return { string: null, error: 'OBJ_ERROR: Object is missing required values' };

    // Check if obj values are correct types
    let boolVars = [obj.u.r, obj.u.w, obj.u.x, obj.g.r, obj.g.w, obj.g.x, obj.o.r, obj.o.w, obj.o.x];
    boolVars.forEach(bvar => {
      if (bvar === true || bvar === false)
        return 'OBJ_ERROR: Object values for u,g,o are all required to be boolean (true|false)';
    });

    if (
      Permissions.valid_execute_chars.includes(obj.u.xchar) &&
      Permissions.valid_execute_chars.includes(obj.g.xchar) &&
      Permissions.valid_execute_chars.includes(obj.o.xchar)
    )
      return { string: null, error: 'OBJ_ERROR: Object values for xchar are not valid characters' };

    let permStr = `${obj.u.r}${obj.u.w}${obj.u.x}${obj.g.r}${obj.g.w}${obj.g.x}${obj.o.r}${obj.o.w}${obj.o.x}`;

    let octalStr = Permissions.perm_string_to_octal_string(permStr);
    if (octalStr.error)
      return { string: null, error: octalStr.error };

    return { string: octalStr.string, error: null };
  }

  static perm_string_to_octal_string(permStr) {  // permStr = r--r--r--
    let error = Permissions.string_error(permStr);
    if (error)
      return { string: null, error: error };

    let pTrimmed = permStr.trim();

    let readChars = Permissions.valid_read_chars();
    let writeChars = Permissions.valid_write_chars();
    let executeChars = Permissions.valid_execute_chars();

    let specialOctal = 0;

    // Compute user octal
    let uidIsSet = false;
    let userOctal = 0;

    let userChars = pTrimmed.substring(0, 3);
    userChars.forEach(char => {
      userOctal += Permissions.char_value(char);
      if (Permissions.will_set_uid_guid_stickybit(char))
        uidIsSet = true;
    });

    if (uidIsSet)
      specialOctal += 4;


    // Check group permissions
    let gidIsSet = false;
    let groupOctal = 0;

    let groupChars = pTrimmed.substring(3, 6);
    groupChars.forEach(char => {
      groupOctal += Permissions.char_value(char);
      if (Permissions.will_set_uid_guid_stickybit(char))
        gidIsSet = true;
    });

    if (gidIsSet)
      specialOctal += 2;


    // Check execute permissions
    let stickybitIsSet = false;
    let othersOctal = 0;

    let othersChars = pTrimmed.substring(6, 9);
    othersChars.forEach(char => {
      othersOctal += Permissions.char_value(char);
      if (Permissions.will_set_uid_guid_stickybit(char))
        stickybitIsSet = true;
    });

    if (stickybitIsSet)
      specialOctal += 1;


    // Return octal string
    let octalStr = `${userOctal}${groupOctal}${othersOctal}`;
    if (specialOctal > 0)
      octalStr = `${specialOctal}${octalStr}`;
    return { string: octalStr, error: null };
  }

  static valid_file_descriptor_chars() {
    return ['b', 'c', 'd', 'l', 'n', 'p', 's', 'D', '-'];
  }

  static valid_read_chars() {
    return ['r', '-'];
  }

  static valid_write_chars() {
    return ['w', '-'];
  }

  static valid_execute_chars() {
    return ['x', 's', 'S', 't', 'T', '-'];
  }

  static is_non_executable_char(c) {
    return c == 'S' || c == 'T';
  }

  static will_set_uid_guid_stickybit(c) {
    return c == 's' || c == 'S' || c == 't' || c == 'T';
  }

  static valid_char_values() {
    return [4, 2, 1, 0];
  }

  static char_value_dict() {
    return { r: 4, w: 2, x: 1, s: 1, t: 1, S: 0, T: 0, '-': 0 };
  }

  static char_value(c) {
    let val = Permissions.char_value_dict()[c];
    if (Permissions.valid_char_values().includes(val))
      return val;
    return null;
  }

  static char_is_valid(c) {
    return Permissions.valid_file_descriptor_chars.includes(c) ||
      Permissions.valid_read_chars.includes(c) ||
      Permissions.valid_write_chars.includes(c) ||
      Permissions.valid_execute_chars.includes(c);
  }

  static valid_classes_chars() {
    return ['u', 'g', 'o'];
  }

  static string_error(permStr) {
    let invalidType = invalid_type(permStr);
    if (invalidType)
      return `PERM_STR_ERROR: Permissions string is ${invalidType}`;

    let pTrimmed = permStr.trim();
    let validSize = 9
    if (pTrimmed.length != validSize)
      return `PERM_STR_ERROR: Permissions string must contain exactly ${validSize} characters`;

    pTrimmed.forEach(char => {
      if (!Permissions.char_is_valid(char))
        return `PERM_STR_ERROR: Permissions string contains invalid characters`;
    });

    // Check if all chars are valid and in respective positions
    let readChars = Permissions.valid_read_chars();
    let writeChars = Permissions.valid_write_chars();
    let executeChars = Permiss.valid_execute_chars();

    // Check user permissions
    let userChars = pTrimmed.substring(0, 3);

    for (let i = 0; i < userChars.length; ++i) {
      let currChar = userChars.charAt(i);
      if (i == 0 && !readChars.includes(currChar)) // read
        return `PERM_STR_ERROR: Permissions string contains invalid character for user read permissions`;
      else if (i == 1 && !writeChars.includes(currChar))  // write
        return `PERM_STR_ERROR: Permissions string contains invalid character for user write permissions`;
      else if (i == 2 && !executeChars.includes(currChar))  // execute
        return `PERM_STR_ERROR: Permissions string contains invalid character for user execute permissions`;
    }

    // Check group permissions
    let groupChars = pTrimmed.substring(3, 6);

    for (let i = 0; i < groupChars.length; ++i) {
      let currChar = groupChars.charAt(i);
      if (i == 0 && !readChars.includes(currChar)) // read
        return `PERM_STR_ERROR: Permissions string contains invalid character for group read permissions`;
      else if (i == 1 && !writeChars.includes(currChar))  // write
        return `PERM_STR_ERROR: Permissions string contains invalid character for group write permissions`;
      else if (i == 2 && !executeChars.includes(currChar))  // execute
        return `PERM_STR_ERROR: Permissions string contains invalid character for group execute permissions`;
    }

    // Check others permissions
    let otherChars = pTrimmed.substring(6, 9);

    for (let i = 0; i < otherChars.length; ++i) {
      let currChar = otherChars.charAt(i);
      if (i == 0 && !readChars.includes(currChar)) // read
        return `PERM_STR_ERROR: Permissions string contains invalid character for others read permissions`;
      else if (i == 1 && !writeChars.includes(currChar))  // write
        return `PERM_STR_ERROR: Permissions string contains invalid character for others write permissions`;
      else if (i == 2 && !executeChars.includes(currChar))  // execute
        return `PERM_STR_ERROR: Permissions string contains invalid character for others execute permissions`;
    }

    return null; // NO errors detected
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
  static all_files(path) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ files: null, error: `PATH_ERROR: ${error}` });
        return;
      }

      let pTrimmed = path.trim();
      Path.exists(pTrimmed).then(results => {
        if (results.error) {
          reject({ files: null, error: `PATH_ERROR: ${results.error}` });
          return;
        }

        if (!results.exists) {
          reject({ files: null, error: `PATH_ERROR: Path does not exist: ${pTrimmed}` });
          return;
        }

        FS.readdir(pTrimmed, (err, files) => {
          if (err) {
            reject({ files: null, error: `FS_READDIR_ERROR: ${err}` });
            return;
          }
          resolve({ files: files, error: null });
        });
      }).catch(fatalFail);
    });
  }

  static visible_files(path) {
    return new Promise((resolve, reject) => {
      List.all_files(path).then(results => {
        if (results.error) {
          reject({ files: null, error: results.error });
          return;
        }
        resolve({ files: results.files.filter(x => !x.startsWith('.')), error: null });
      }).catch(fatalFail);
    });
  }

  static hidden_files(path) {
    return new Promise((resolve, reject) => {
      List.all_files(path).then(results => {
        if (results.error) {
          reject({ files: null, error: results.error });
          return;
        }
        resolve({ files: results.files.filterfilter(x => x.startsWith('.')), error: null });
      }).catch(fatalFail);
    });
  }

  static file_item(filepath) {
    return new Promise((resolve, reject) => {
      Path.is_file(dirPath).then(results => {
        if (results.error) {
          reject({ item: null, error: results.error });
          return;
        }

        let fTrimmed = filepath.trim();
        if (!results.isFile) {
          reject({ item: null, error: `PATH_ERROR: Path is not a file: ${fTrimmed}` });
          return;
        }

        let args = ['-l', fTrimmed];
        Execute.local('ls', args).then(output => {
          if (output.error) {
            reject({ item: null, error: output.error });
            return;
          }

          if (output.stderr) {
            reject({ item: null, error: `LS_ERROR: ${output.error}` });
            return;
          }

          let i = List.parse_ls_string(output.stdout.trim());
          if (i.error) {
            reject({ item: null, error: i.error });
            return;
          }

          resolve({ item: i.item, error: null });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }

  static dir_item(dirPath) {
    return new Promise((resolve, reject) => {
      Path.is_dir(dirPath).then(results => {
        if (results.error) {
          reject({ item: null, error: results.error });
          return;
        }

        let dTrimmed = dirPath.trim();
        if (!results.isDir) {
          reject({ item: null, error: `PATH_ERROR: Path is not a directory: ${dTrimmed}` });
          return;
        }

        let args = ['-ld', dTrimmed];
        Execute.local('ls', args).then(output => {
          if (output.error) {
            reject({ item: null, error: output.error });
            return;
          }

          if (output.stderr) {
            reject({ item: null, error: `LS_ERROR: ${output.error}` });
            return;
          }

          let i = List.parse_ls_string(output.stdout.trim());
          if (i.error) {
            reject({ item: null, error: i.error });
            return;
          }

          resolve({ item: i.item, error: null });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }

  static all_items(dirPath) {
    return new Promise((resolve, reject) => {
      Path.is_dir(dirPath).then(results => {
        if (results.error) {
          reject({ items: null, error: results.error });
          return;
        }

        if (!results.isDir) {
          reject({ items: null, error: `PATH_ERROR: Path is not a directory` });
          return;
        }

        let dTrimmed = dirPath.trim();
        let args = ['-la', dTrimmed];

        Execute.local('ls', args).then(output => {
          if (output.error) {
            reject({ items: null, error: output.error });
            return;
          }

          if (output.stderr) {
            reject({ items: null, error: `LS_ERROR: ${output.error}` });
            return;
          }

          let lines = output.stdout.trim().split('\n').map(line => line.trim());
          if (lines.length < 2) {
            resolve({ items: [], error: null });
            return;
          }

          let items = [];
          lines.slice(1).forEach(line => {
            let i = List.parse_ls_string(line.trim());
            items.push(i.item);
          });
          resolve({ items: items, error: null });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }

  static visible_items(dirPath) {
    return new Promise((resolve, reject) => {
      List.all_items(dirPath).then(results => {
        if (results.error) {
          resolve({ items: null, error: results.error });
          return;
        }
        resolve({ items: results.items.filter(item => !item.name.startsWith('.')), error: null });
      }).catch(fatalFail);
    });
  }

  static hidden_items(dirPath) {
    return new Promise((resolve, reject) => {
      List.all_items(dirPath).then(results => {
        if (results.error) {
          resolve({ items: null, error: results.error });
          return;
        }
        resolve({ items: results.items.filter(item => item.name.startsWith('.')), error: null });
      }).catch(fatalFail);
    });
  }

  static parse_ls_string(string) {
    let invalidType = invalid_type(string);
    if (invalidType)
      return { item: null, error: `ITEM_STR_ERROR: Item string is ${invalidType}` };

    let outputStr = output.stdout.trim();

    // PERMS
    let permStr = '';
    let startIndex = 0;
    let endIndex = 0;

    let indexes = { start: 0, end: null };
    for (let i = indexes.start; i < outputStr.length; ++i) {
      let currChar = outputStr.charAt(i);
      if (currChar.trim())
        indexes.end = i;
      else {
        indexes.end += 1;
        permStr = outputStr.substring(indexes.start, indexes.end);

        currChar = outputStr.charAt(indexes.end);
        while (!currChar.trim()) {
          indexes.end += 1;
          currChar = outputStr.charAt(indexes.end);
        }

        indexes.start = indexes.end + 1;
        break;
      }
    }

    // HARD LINKS
    let hLinksStr = '';
    for (let i = indexes.start; i < outputStr.length; ++i) {
      let currChar = outputStr.charAt(i);
      if (currChar.trim())
        indexes.end = i;
      else {
        indexes.end += 1;
        hLinksStr = outputStr.substring(indexes.start, indexes.end);

        currChar = outputStr.charAt(indexes.end);
        while (!currChar.trim()) {
          indexes.end += 1;
          currChar = outputStr.charAt(indexes.end);
        }

        indexes.start = indexes.end + 1;
        break;
      }
    }

    // OWNER
    let ownerStr = '';
    for (let i = indexes.start; i < outputStr.length; ++i) {
      let currChar = outputStr.charAt(i);
      if (currChar.trim())
        indexes.end = i;
      else {
        indexes.end += 1;
        ownerStr = outputStr.substring(indexes.start, indexes.end);

        currChar = outputStr.charAt(indexes.end);
        while (!currChar.trim()) {
          indexes.end += 1;
          currChar = outputStr.charAt(indexes.end);
        }

        indexes.start = indexes.end + 1;
        break;
      }
    }

    // GROUP
    let groupStr = '';
    for (let i = indexes.start; i < outputStr.length; ++i) {
      let currChar = outputStr.charAt(i);
      if (currChar.trim())
        indexes.end = i;
      else {
        indexes.end += 1;
        groupStr = outputStr.substring(indexes.start, indexes.end);

        currChar = outputStr.charAt(indexes.end);
        while (!currChar.trim()) {
          indexes.end += 1;
          currChar = outputStr.charAt(indexes.end);
        }

        indexes.start = indexes.end + 1;
        break;
      }
    }

    // SIZE
    let sizeStr = '';
    for (let i = indexes.start; i < outputStr.length; ++i) {
      let currChar = outputStr.charAt(i);
      if (currChar.trim())
        indexes.end = i;
      else {
        indexes.end += 1;
        sizeStr = outputStr.substring(indexes.start, indexes.end);

        currChar = outputStr.charAt(indexes.end);
        while (!currChar.trim()) {
          indexes.end += 1;
          currChar = outputStr.charAt(indexes.end);
        }

        indexes.start = indexes.end + 1;
        break;
      }
    }

    // MODIFIED TIME

    // Month
    let monthStr = '';
    for (let i = indexes.start; i < outputStr.length; ++i) {
      let currChar = outputStr.charAt(i);
      if (currChar.trim())
        indexes.end = i;
      else {
        indexes.end += 1;
        monthStr = outputStr.substring(indexes.start, indexes.end);

        currChar = outputStr.charAt(indexes.end);
        while (!currChar.trim()) {
          indexes.end += 1;
          currChar = outputStr.charAt(indexes.end);
        }

        indexes.start = indexes.end + 1;
        break;
      }
    }

    // Day
    let dayStr = '';
    for (let i = indexes.start; i < outputStr.length; ++i) {
      let currChar = outputStr.charAt(i);
      if (currChar.trim())
        indexes.end = i;
      else {
        indexes.end += 1;
        dayStr = outputStr.substring(indexes.start, indexes.end);

        currChar = outputStr.charAt(indexes.end);
        while (!currChar.trim()) {
          indexes.end += 1;
          currChar = outputStr.charAt(indexes.end);
        }

        indexes.start = indexes.end + 1;
        break;
      }
    }

    // Stamp
    let stampStr = '';
    for (let i = indexes.start; i < outputStr.length; ++i) {
      let currChar = outputStr.charAt(i);
      if (currChar.trim())
        indexes.end = i;
      else {
        indexes.end += 1;
        stampStr = outputStr.substring(indexes.start, indexes.end);

        currChar = outputStr.charAt(indexes.end);
        while (!currChar.trim()) {
          indexes.end += 1;
          currChar = outputStr.charAt(indexes.end);
        }

        indexes.start = indexes.end + 1;
        break;
      }
    }

    let modStr = `${monthStr} ${dayStr} ${stampStr}`;

    // FILENAME
    let nameStr = outputStr.substring(indexes.start);

    // ITEM
    let item = {
      permstr: permStr,
      hardlinks: parseInt(hLinksStr),
      owner: ownerStr,
      group: groupStr,
      size: parseInt(sizeStr),
      modtime: modStr,
      name: nameStr
    };

    return { item: item, error: null };
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
          let newPermNumStr = Permissions.obj_to_octal_string(obj);
          if (newPermNumStr.error) {
            reject({ success: false, error: newPermNumStr.error });
            return;
          }

          FS.chmod(pTrimmed, newPermNumStr.string, (err) => {
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
// DISK USAGE

class DiskUsage {
  static list_all_items(dirPath) {
    return new Promise((resolve, reject) => {
      let error = Path.error(dirPath);
      if (error) {
        reject({ size: null, error: `PATH_ERROR: ${error}` });
        return;
      }

      let dTrimmed = dirPath.trim();
      Path.is_dir(dTrimmed).then(results => {
        if (results.error) {
          reject({ size: null, error: results.error });
          return;
        }

        if (!results.isDir) {
          reject({ size: null, error: `PATH_ERROR: Path is not a directory: ${dTrimmed}` });
          return;
        }

        let args = ['-ha', '--block-size=1 --max-depth=1', dTrimmed];
        Execute.local('du', args).then(output => {
          if (output.error) {
            reject({ size: null, error: output.error });
            return;
          }

          if (output.stderr) {
            reject({ size: null, error: `DU_ERROR: ${output.stderr}` });
            return;
          }

          let items = [];

          let lines = output.stdout.trim().split('\n').map(line => line.trim()).filter(line => line && line != '');
          lines.forEach(line => {
            let sizeStr = '';
            line.forEach(char => {
              if (char.trim())
                sizeStr + char;
              else
                break;
            });

            let filepath = line.substring(sizeStr.length + 1);
            items.push({
              size: parseInt(sizeStr),
              path: filepath
            });
          });
          resolve({ items: items, error: null });
        }).catch(fatalFail);
      }).catch(fatalFail);
    });
  }

  static list_visible_items(dirPath) {
    return new Promise((resolve, reject) => {
      DiskUsage.list_all_items(dirPath).then(results => {
        if (results.error) {
          reject({ items: null, error: results.error });
          return;
        }
        reject({ items: results.items.filter(item => !Path.filename(item.path).startsWith('.')), error: null });
      }).catch(fatalFail);
    });
  }

  static list_hidden_items(dirPath) {
    return new Promise((resolve, reject) => {
      DiskUsage.list_all_items(dirPath).then(results => {
        if (results.error) {
          reject({ items: null, error: results.error });
          return;
        }
        reject({ items: results.items.filter(item => Path.filename(item.path).startsWith('.')), error: null });
      }).catch(fatalFail);
    });
  }

  static dir_size(path) {
    return new Promise((resolve, reject) => {
      let error = Path.error(path);
      if (error) {
        reject({ size: null, error: `PATH_ERROR: ${error}` });
        return;
      }

      let pTrimmed = path.trim();
      Path.is_dir(pTrimmed).then(results => {
        if (results.error) {
          reject({ size: null, error: results.error });
          return;
        }

        if (!results.isDir) {
          reject({ size: null, error: `PATH_ERROR: Path is not a directory: ${pTrimmed}` });
          return;
        }

        let args = ['-sh', '--block-size=1', pTrimmed];
        Execute.local('du', args).then(output => {
          if (output.error) {
            reject({ size: null, error: output.error });
            return;
          }

          if (output.stderr) {
            reject({ size: null, error: `DU_ERROR: ${output.stderr}` });
            return;
          }

          let sizeStr = '';
          output.stdout.trim().forEach(char => {
            if (char.trim())
              sizeStr += char;
            else
              break;
          });
          resolve({ size: parseInt(sizeStr), error: null });
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