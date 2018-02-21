let ERROR = require('./error.js');

//-------------------------------------

class Timestamp {
  static Timestamp() {
    let d = new Date();

    // TIME
    let hours = d.getHours();  // 0-23
    let minutes = d.getMinutes();  // 0-59
    let seconds = d.getSeconds();  // 0-59
    let milliseconds = d.getMilliseconds();  // 0-999 

    let hoursStr = `00${hours}`.slice(-2);

    let minutesStr = `00${minutes}`;
    minutesStr = minutesStr.slice(-2);

    let secondsStr = `00${seconds}`;
    secondsStr = secondsStr.slice(-2);

    let militaryTime = {  // 24-hour format
      hours: hours,
      minutes: minutes,
      seconds: seconds,
      milliseconds: milliseconds,
      string: `${hoursStr}:${minutesStr}:${secondsStr}`
    }

    let adjustedHours = null;
    let suffix = null;

    if (hours == 0) {
      adjustedHours = 12;
      suffix = 'AM';
    }
    else if (hours == 12) {
      adjustedHours = 12;
      suffix = 'PM';
    }
    else if (hours > 12) {
      adjustedHours = hours % 12;
      suffix = 'PM';
    }
    else {
      adjustedHours = hours;
      suffix = 'AM';
    }

    hoursStr = `00${adjustedHours}`.slice(-2);

    let timeStr = `${hoursStr}:${minutesStr}:${secondsStr} ${suffix}`;

    let meridiemTime = {  // 12-hour format (AM | PM)
      hours: adjustedHours,
      minutes: minutes,
      seconds: seconds,
      milliseconds: milliseconds,
      suffix: suffix,
      string: timeStr
    }

    // DATE
    let year = d.getFullYear();  // yyyy

    let monthNumber = d.getMonth(); // 0-11;
    let monthName = Timestamp.Months()[monthNumber];
    let dayOfMonth = d.getDate(); // 1-31

    let dayOfWeekNumber = d.getDay();  // 0-6
    let dayOfWeekName = Timestamp.DaysOfTheWeek()[dayOfWeekNumber];

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

  static MilitaryStringToMeridiemString(militaryTime) {
    let error = Error.MilitaryTimeStringError(militaryTime);
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

  static MeridiemToMilitaryTime(meridiemTime) {
    let error = Error.MeridiemTimeStringError(meridiemTime);
    if (error)
      return { string: null, error: error };

    let parts = meridiemTime.split(':');

    let hoursStr = parts[0];
    let hoursVal = parseInt(hoursStr);

    let minutesStr = parts[1];
    let minutesVal = parseInt(minutesStr);

    let secondsStr = parts[2].split(' ')[0].trim();
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

  static Difference(d1, d2) {
    let error = Error.DateObjectError(d1);
    if (error)
      return { milliseconds: null, error: `DATE1_OBJ_ERROR: ${error}` };

    error = Error.DateObjectError(d2);
    if (error)
      return { milliseconds: null, error: `DATE2_OBJ_ERROR: ${error}` };

    let date1 = new Date(d1.year, d1.month, d1.day, d1.hours, d1.minutes, d1.seconds, d1.milliseconds);
    let date2 = new Date(d2.year, d2.month, d2.day, d2.hours, d2.minutes, d2.seconds, d2.milliseconds);
    return ({ milliseconds: date2.getTime() - date1.getTime(), error: null });
  }

  static Months() {
    return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  }

  static MonthIndex(name) {
    let error = ERROR.StringValidator(name);
    if (error)
      return { index: null, error: `MONTH_NAME_ERROR: Name is ${error}` };

    if (Timestamp.Months().includes(name))
      return { index: months.indexOf(name), error: null };
    return { index: null, error: `MONTH_NAME_ERROR: Name is not a valid name` };
  }

  static DaysOfTheWeek() {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  }

  static DayOfTheWeekIndex(name) {
    let error = ERROR.StringValidator(name);
    if (error)
      return { index: null, error: `DAY_OF_WEEK_INDEX_ERROR: Name is ${error}` };

    if (Timestamp.DaysOfTheWeek().includes(name))
      return { index: daysOfTheWeek.indexOf(name), error: null };
    return { index: null, error: `DAY_OF_WEEK_INDEX_ERROR: Name is not a valid name` };
  }
}

//------------------------------------
// ERROR

class Error {
  static MeridiemTimeStringError(string) {
    let error = ERROR.StringValidator(string);
    if (error)
      return `Time string is ${error}`;

    let sTrimmed = string.trim();
    let parts = sTrimmed.split(' ');  // parts = ['HH:MM:SS', '(AM|PM)']
    if (parts.length == 2) {
      let unitParts = parts[0].trim().split(':');
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
          } catch (err) {
            return 'Hours do not resolve to an integer';
          }

          if (hours < hMin || hours > hMax)
            return `Hours must be between ${hMin} and ${hMax}`;

          let mStr = unitParts[1].trim();
          if (mStr.length == 2) {
            let minutes = null;
            try {
              minutes = parseInt(mStr);
            } catch (err) {
              return 'Minutes do not resolve to an integer';
            }

            if (minutes < mMin || minutes > mMax)
              return `Minutes must be between ${mMin} and ${mMax}`;

            let sStr = unitParts[2].trim();
            if (sStr.length == 2) {
              let seconds = null;
              try {
                seconds = parseInt(sStr);
              } catch (err) {
                return 'Seconds do not resolve to an integer';
              }

              if (seconds < sMin || seconds > sMax)
                return `Seconds must be between ${sMin} and ${sMax}`;

              let suffix = parts[1].trim();
              if (suffix == 'AM' || suffix == 'PM')
                return null;
              else
                return 'Suffix AM|PM is not formatted correctly';
            }
            else
              return 'Seconds are not formatted correctly';
          }
          else
            return 'Minutes are not formatted correctly';
        }
        else
          return 'Hours are not formatted correctly';
      }
    }
    return 'Time string is not formatted correctly. Must follow format HH:MM:SS (AM|PM)';
  }

  static MilitaryTimeStringError(string) {
    let error = ERROR.StringValidator(string);
    if (error)
      return `Time string is ${error}`;

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
        } catch (err) {
          return 'Hours do not resolve to an integer';
        }

        if (hours < hMin || hours > hMax)
          return `Hours must be between ${hMin} and ${hMax}`;

        let mStr = parts[1].trim();
        if (mStr.length == 2) {
          let minutes = null;
          try {
            minutes = parseInt(mStr);
          } catch (err) {
            return 'Minutes do not resolve to an integer';
          }

          if (minutes < mMin || minutes > mMax)
            return `Minutes must be between ${mMin} and ${mMax}`;

          let sStr = parts[2].trim();
          let sParts = sStr.split(' ');
          if (sParts.length == 2)
            return 'Trailing chars at end of time string';

          if (sStr.length == 2) {
            let seconds = null;
            try {
              seconds = parseInt(sStr);
            } catch (err) {
              return 'Seconds do not resolve to an integer';
            }

            if (seconds < sMin || seconds > sMax)
              return `Seconds must be between ${sMin} and ${sMax}`;
            return null;
          }
          else
            return 'Seconds are not formatted correctly';
        }
        else
          return 'Minutes are not formatted correctly';
      }
      else
        return 'Hours are not formatted correctly';

    }
    return 'Time string is not formatted correctly. Must follow format HH:MM:SS';
  }

  static DateObjectError(dateObj) {
    let error = ERROR.NullOrUndefined(dateObj);
    if (error)
      return `Date object is ${error}`;

    // Check if obj missing values
    if (
      dateObj.year === undefined ||
      dateObj.month === undefined ||
      dateObj.day === undefined ||
      dateObj.hours === undefined ||
      dateObj.minutes === undefined ||
      dateObj.seconds === undefined ||
      dateObj.milliseconds === undefined
    )
      return 'Date object is missing required values';

    // Check if obj values are all integers and in range
    if (
      !Number.isInteger(dateObj.year) ||
      !Number.isInteger(dateObj.month) ||
      !Number.isInteger(dateObj.day) ||
      !Number.isInteger(dateObj.hours) ||
      !Number.isInteger(dateObj.minutes) ||
      !Number.isInteger(dateObj.seconds) ||
      !Number.isInteger(dateObj.milliseconds)
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
      return 'Year must be integer greater than or equal to 0';

    if (dateObj.month < monthMin || dateObj.month > monthMax)
      return `Month must be integer between ${monthMin} and ${monthMax}`;

    if (dateObj.day < dayMin || dateObj.day > dayMax)
      return `Day must be integer between ${dayMin} and ${dayMax}`;

    if (dateObj.hours < hoursMin || dateObj.hours > hoursMax)
      return `Hours must be integer between ${hoursMin} and ${hoursMax}`;

    if (dateObj.minutes < minutesMin || dateObj.minutes > minutesMax)
      return `Minutes must be integer between ${minutesMin} and ${minutesMax}`;

    if (dateObj.seconds < secondsMin || dateObj.seconds > secondsMax)
      return `Seconds must be integer between ${secondsMin} and ${secondsMax}`;

    if (dateObj.milliseconds < millisecondsMin || dateObj.milliseconds > millisecondsMax)
      return `Milliseconds must be integer between ${millisecondsMin} and ${millisecondsMax}`;

    return null;
  }
}

//---------------------------------------
// EXPORTS

exports.Timestamp = Timestamp;