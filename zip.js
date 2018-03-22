let VALIDATE = require('./validate.js');

//---------------------------------------------
// ERROR

function SrcValidator(dest) {
  let error = VALIDATE.IsStringInput(dest);
  if (error)
    return `source is ${error}`;
  return null;
}

function DestValidator(dest) {
  let error = VALIDATE.IsStringInput(dest);
  if (error)
    return `destination is ${error}`;
  return null;
}

function SourcesValidator(sources) {
  let error = VALIDATE.IsArray(sources);
  if (error)
    return `sources are ${error}`;

  for (let i = 0; i < sources.length; ++i) {
    let currSrc = sources[i];
    let invalidType = VALIDATE.IsStringInput(currSrc);
    if (invalidType)
      return `sources contains a path that is ${invalidType}`;
  }

  return null;
}

function ArgsValidator(args) {
  let error = VALIDATE.IsArray(args);
  if (error)
    return `arguments are ${error}`;

  for (let i = 0; i < args.length; ++i) {
    let currArg = args[i];
    let argIsValidString = VALIDATE.IsStringInput(currArg) == null;
    let argIsValidNumber = !isNaN(currArg);

    if (!argIsValidString && !argIsValidNumber)
      return `arg elements must be string or number type`;
  }

  return null;
}

//-------------------------------------------
// ZIP

/**
 * Compress files using ZIP utility.
 * @param {Array<string>} sources List of paths to zip.
 * @param {string} dest Destination.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise that resolves if successful, otherwise it rejects and returns an error.
 */
function Files(sources, dest, executor) {
  let error = SourcesValidator(sources);
  if (error)
    return Promise.reject(`Failed to zip files: ${error}`);

  error = DestValidator(dest);
  if (error)
    return Promise.reject(`Failed to zip files: ${error}`);

  if (!executor)
    return Promise.reject(`Failed to zip files: Executor is required`);

  return new Promise((resolve, reject) => {
    executor.Execute('zip', [dest].concat(sources)).then(output => {
      if (output.stderr) {
        reject(`Failed to zip files: ${output.stderr}`);
        return;
      }
      resolve();
    }).catch(error => reject(`Failed to zip files: ${error}`));
  });
}

/**
 * Compress directories using ZIP utility.
 * @param {Array<string>} sources List of paths to zip.
 * @param {string} dest Destination.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise that resolves if successful, otherwise it rejects and returns an error.
 */
function Directories(sources, dest, executor) {
  let error = SourcesValidator(sources);
  if (error)
    return Promise.reject(`Failed to zip files: ${error}`);

  error = DestValidator(dest);
  if (error)
    return Promise.reject(`Failed to zip files: ${error}`);

  if (!executor)
    return Promise.reject(`Failed to zip files: Executor is required`);

  return new Promise((resolve, reject) => {
    executor.Execute('zip', ['-r', dest].concat(sources)).then(output => {
      if (output.stderr) {
        reject(`Failed to zip directories: ${output.stderr}`);
        return;
      }
      resolve();
    }).catch(error => reject(`Failed to zip directories: ${error}`));
  });
}

/**
 * Decompress zip file using UNZIP utility.
 * @param {string} src Source for zip file.
 * @param {string} dest Destination.
 * @param {Command} executor Command object that will execute the command.
 * @returns {Promise} Returns a promise that resolves if successful, otherwise it rejects and returns an error.
 */
function Unzip(src, dest, executor) {
  let error = SrcValidator(src);
  if (error)
    return Promise.reject(`Failed to unzip: ${error}`);

  error = DestValidator(dest);
  if (error)
    return Promise.reject(`Failed to unzip: ${error}`);

  if (!executor)
    return Promise.reject(`Failed to unzip: Executor is required`);

  return new Promise((resolve, reject) => {
    executor.Execute('unzip', [src, '-d', dest], executor).then(output => {
      if (output.stderr) {
        reject(`Failed to unzip: ${output.stderr}`);
        return;
      }
      resolve();
    }).catch(error => reject(`Failed to unzip: ${error}`));
  });
}

//--------------------------
// EXPORTS

exports.Files = Files;
exports.Directories = Directories;
exports.Unzip = Unzip;