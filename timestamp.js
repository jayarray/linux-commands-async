//-----------------------------------
// ERROR CATCHING

function fatalFail(error) {
  console.log(error);
  process.exit(-1);
}

//------------------------------------

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

//------------------------------------
// ERROR

class Error {
  static static NullOrUndefined(o) {
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

  static MeridiemTimeStringError(string) {
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

  static MilitaryTimeStringError(string) {
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

  static DateObjectError(dateObj) {
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
}

//---------------------------------------
// EXPORTS

exports.Timestamp = Timestamp;
exports.Error = Error;