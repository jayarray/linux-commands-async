function Now(executor) {
  return new Promise((resolve, reject) => {
    // BUILD COMMANDS
    let dayInfoHeaders = ['abbr', 'name', 'weekNumber', 'monthNumber']; // weekNumber => 1-7 (1=Mon), monthNumber => 01-31
    let dayInfoParams = `%a %A %u %d`;

    let weekInfoHeaders = ['number']; // number => 00-53
    let weekInfoParams = `%U`;

    let monthInfoHeaders = ['abbr', 'name', 'number'];  // number => 01-12
    let monthInfoParams = `%b %B %m`;

    let yearInfoHeaders = ['abbr', 'full']; // abbr => 00-99
    let yearInfoParams = `%y %Y`;

    let meridiemTimeInfoHeaders = ['hours', 'minutes', 'seconds', 'nanoseconds', 'suffix']; // hours => 00-23, minutes/seconds => 00-59, nanoseconds => 000000000-999999999
    let meridiemTimeInfoParams = `%I %M %S %N %P`; // NOTE: %P (i.e. suffix) may not be known in some places.

    let epochInfoParams = `%s`;

    let formatStr = `+'${dayInfoParams}%n${weekInfoParams}%n${monthInfoParams}%n${yearInfoParams}%n${meridiemTimeInfoParams}%n${epochInfoParams}'`;

    // EXECUTE COMMAND
    executor.Execute('date', [formatStr]).then(output => {
      if (output.stderr) {
        reject(`Failed to get timestamp: ${output.stderr}`);
        return;
      }

      // PROCESS OUTPUTS
      let lines = output.stdout.split('\n').filter(line => line && line != '' && line.trim() != '').map(line => line.trim());

      // Day
      let dayInfoParts = lines[0].split(' ').map(part => part.trim());
      let day = {};
      day[dayInfoHeaders[0]] = dayInfoParts[0];
      day[dayInfoHeaders[1]] = dayInfoParts[1];
      day[dayInfoHeaders[2]] = parseInt(dayInfoParts[2]);
      day[dayInfoHeaders[3]] = parseInt(dayInfoParts[3]);

      // Week
      let weekInfoParts = lines[1].split(' ').map(part => part.trim());
      let week = {};
      week[weekInfoHeaders[0]] = parseInt(weekInfoParts[0]);

      // Month
      let monthInfoParts = lines[2].split(' ').map(part => part.trim());
      let month = {};
      month[monthInfoHeaders[0]] = monthInfoParts[0];
      month[monthInfoHeaders[1]] = monthInfoParts[1];
      month[monthInfoHeaders[2]] = parseInt(monthInfoParts[2]);

      // Year
      let yearInfoParts = lines[3].split(' ').map(part => part.trim());
      let year = {};
      year[yearInfoHeaders[0]] = yearInfoParts[0];
      year[yearInfoHeaders[1]] = yearInfoParts[1];

      // Meridiem Time
      let meridiemTimeInfoParts = lines[4].split(' ').map(part => part.trim());
      let meridiemTime = {};
      meridiemTime[meridiemTimeInfoHeaders[0]] = parseInt(meridiemTimeInfoParts[0]);
      meridiemTime[meridiemTimeInfoHeaders[1]] = parseInt(meridiemTimeInfoParts[1]);
      meridiemTime[meridiemTimeInfoHeaders[2]] = parseInt(meridiemTimeInfoParts[2]);
      meridiemTime[meridiemTimeInfoHeaders[3]] = parseInt(meridiemTimeInfoParts[3]);
      meridiemTime[meridiemTimeInfoHeaders[4]] = meridiemTimeInfoParts[4];
      meridiemTime['string'] = `${meridiemTimeInfoParts[0]}:${meridiemTimeInfoParts[1]}:${meridiemTimeInfoParts[2]} ${meridiemTimeInfoParts[4]}`;

      // Military Time
      let militaryTime = {};

      let adjustedHours = null;
      if (meridiemTime.suffix == 'pm' && meridiemTime.hours < 12)
        adjustedHours = (meridiemTime.hours + 12) % 24;
      else if (meridiemTime.suffix == 'am' && meridiemTime.hours == 12)
        adjustedHours = 0;
      else
        adjustedHours = meridiemTime.hours;

      let hoursStr = `00${adjustedHours}`;
      hoursStr = hoursStr.substring(hoursStr.length - 2);

      militaryTime['hours'] = adjustedHours;
      militaryTime['minutes'] = meridiemTime.minutes;
      militaryTime['seconds'] = meridiemTime.seconds;
      militaryTime['nanoseconds'] = meridiemTime.nanoseconds;
      militaryTime['string'] = `${hoursStr}:${meridiemTimeInfoParts[1]}:${meridiemTimeInfoParts[2]}`;

      // Epoch
      let epoch = {};
      epoch['seconds'] = parseInt(lines[5].trim());

      resolve({
        day: day,
        week: week,
        month: month,
        year: year,
        militaryTime: militaryTime,
        meridiemTime: meridiemTime,
        epoch: epoch
      });
    }).catch(error => `Failed to get timestamp: ${error}`);
  });
}

function Compare(t1, t2) {
  if (t1.epoch.seconds < t2.epoch.seconds)
    return -1;
  else if (t1.epoch.seconds > t2.epoch.seconds)
    return 1;
  else
    return 0;
}

function EpochSecondsToTimestamp(seconds, executor) {
  return new Promise((resolve, reject) => {
    // BUILD COMMANDS
    let dayInfoHeaders = ['abbr', 'name', 'weekNumber', 'monthNumber']; // weekNumber => 1-7 (1=Mon), monthNumber => 01-31
    let dayInfoParams = `%a %A %u %d`;

    let weekInfoHeaders = ['number']; // number => 00-53
    let weekInfoParams = `%U`;

    let monthInfoHeaders = ['abbr', 'name', 'number'];  // number => 01-12
    let monthInfoParams = `%b %B %m`;

    let yearInfoHeaders = ['abbr', 'full']; // abbr => 00-99
    let yearInfoParams = `%y %Y`;

    let meridiemTimeInfoHeaders = ['hours', 'minutes', 'seconds', 'nanoseconds', 'suffix']; // hours => 00-23, minutes/seconds => 00-59, nanoseconds => 000000000-999999999
    let meridiemTimeInfoParams = `%I %M %S %N %P`; // NOTE: %P (i.e. suffix) may not be known in some places.

    let formatStr = `+'${dayInfoParams}%n${weekInfoParams}%n${monthInfoParams}%n${yearInfoParams}%n${meridiemTimeInfoParams}'`;

    executor.Execute('date', ['-d', `@${seconds}`, formatStr]).then(output => {
      if (output.stderr) {
        reject(`Failed to convert epoch seconds to timestamp: ${output.stderr}`);
        return;
      }

      // PROCESS OUTPUTS
      let lines = output.stdout.split('\n').filter(line => line && line != '' && line.trim() != '').map(line => line.trim());

      // Day
      let dayInfoParts = lines[0].split(' ').map(part => part.trim());
      let day = {};
      day[dayInfoHeaders[0]] = dayInfoParts[0];
      day[dayInfoHeaders[1]] = dayInfoParts[1];
      day[dayInfoHeaders[2]] = parseInt(dayInfoParts[2]);
      day[dayInfoHeaders[3]] = parseInt(dayInfoParts[3]);

      // Week
      let weekInfoParts = lines[1].split(' ').map(part => part.trim());
      let week = {};
      week[weekInfoHeaders[0]] = parseInt(weekInfoParts[0]);

      // Month
      let monthInfoParts = lines[2].split(' ').map(part => part.trim());
      let month = {};
      month[monthInfoHeaders[0]] = monthInfoParts[0];
      month[monthInfoHeaders[1]] = monthInfoParts[1];
      month[monthInfoHeaders[2]] = parseInt(monthInfoParts[2]);

      // Year
      let yearInfoParts = lines[3].split(' ').map(part => part.trim());
      let year = {};
      year[yearInfoHeaders[0]] = yearInfoParts[0];
      year[yearInfoHeaders[1]] = yearInfoParts[1];

      // Meridiem Time
      let meridiemTimeInfoParts = lines[4].split(' ').map(part => part.trim());
      let meridiemTime = {};
      meridiemTime[meridiemTimeInfoHeaders[0]] = parseInt(meridiemTimeInfoParts[0]);
      meridiemTime[meridiemTimeInfoHeaders[1]] = parseInt(meridiemTimeInfoParts[1]);
      meridiemTime[meridiemTimeInfoHeaders[2]] = parseInt(meridiemTimeInfoParts[2]);
      meridiemTime[meridiemTimeInfoHeaders[3]] = parseInt(meridiemTimeInfoParts[3]);
      meridiemTime[meridiemTimeInfoHeaders[4]] = meridiemTimeInfoParts[4];
      meridiemTime['string'] = `${meridiemTimeInfoParts[0]}:${meridiemTimeInfoParts[1]}:${meridiemTimeInfoParts[2]} ${meridiemTimeInfoParts[4]}`;

      // Military Time
      let militaryTime = {};

      let adjustedHours = null;
      if (meridiemTime.suffix == 'pm' && meridiemTime.hours < 12)
        adjustedHours = (meridiemTime.hours + 12) % 24;
      else if (meridiemTime.suffix == 'am' && meridiemTime.hours == 12)
        adjustedHours = 0;
      else
        adjustedHours = meridiemTime.hours;

      let hoursStr = `00${adjustedHours}`.substring(-2);

      militaryTime['hours'] = hoursStr;
      militaryTime['minutes'] = meridiemTime.minutes;
      militaryTime['seconds'] = meridiemTime.seconds;
      militaryTime['nanoseconds'] = meridiemTime.nanoseconds;
      militaryTime['string'] = `${militaryTime.hours}:${meridiemTimeInfoParts[1]}:${meridiemTimeInfoParts[2]}`;

      // Epoch
      let epoch = {};
      epoch['seconds'] = seconds;

      resolve({
        day: day,
        week: week,
        month: month,
        year: year,
        militaryTime: militaryTime,
        meridiemTime: meridiemTime,
        epoch: epoch
      });
    }).catch(error => `Failed to convert epoch seconds to timestamp: ${error}`);
  });
}

//---------------------------------------
// EXPORTS

exports.Now = Now;
exports.Compare = Compare;
exports.EpochSecondsToTimestamp = EpochSecondsToTimestamp;