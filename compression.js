let VALIDATE = require('./validate.js');

//-------------------------------------------
// ZIP

function ZipFiles(sources, dest, executor) {
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
      resolve(true);
    }).catch(error => reject(`Failed to zip files: ${error}`));
  });
}

function ZipDirectories(sources, dest, executor) {
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
      resolve(true);
    }).catch(error => reject(`Failed to zip directories: ${error}`));
  });
}

function ZipManual(args, executor) {
  let error = ArgsValidator(args);
  if (error)
    return Promise.reject(`Failed to execute zip command: ${error}`);

  if (!executor)
    return Promise.reject(`Failed to execute zip command: Executor is required`);

  return new Promise((resolve, reject) => {
    executor.Execute('zip', args).then(output => {
      if (output.stderr) {
        reject(`Failed to execute zip command: ${output.stderr}`);
        return;
      }
      resolve(true);
    }).catch(error => reject(`Failed to execute zip command: ${error}`));
  });
}

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
      resolve(true);
    }).catch(error => reject(`Failed to unzip: ${error}`));
  });
}

function UnzipManual(args, executor) {
  let error = ArgsValidator(args);
  if (error)
    return Promise.reject(`Failed to execute unzip command: args are ${error}`);

  if (!executor)
    return Promise.reject(`Failed to execute unzip command: Executor is required`);

  return new Promise((resolve, reject) => {
    executor.Execute('unzip', args).then(output => {
      if (output.stderr) {
        reject(`Failed to execute unzip command: ${output.stderr}`);
        return;
      }
      resolve(true);
    }).catch(error => reject(`Failed to execute unzip command: ${error}`));
  });
}

//-------------------------------------------
// TAR

function Tar(sources, dest, executor) {
  let error = SourcesValidator(sources);
  if (error)
    return Promise.reject(`Failed to tar: ${error}`);

  error = DestValidator(dest);
  if (error)
    return Promise.reject(`Failed to tar: ${error}`);

  if (!executor)
    return Promise.reject(`Failed to tar: Executor is required`);

  return new Promise((resolve, reject) => {
    executor.Execute('tar', ['-czvf', dest].concat(sources)).then(output => {
      if (output.stderr) {
        reject(`Failed to tar: ${output.stderr}`);
        return;
      }
      resolve(true);
    }).catch(error => reject(`Failed to tar: ${error}`));
  });
}

function Untar(src, dest, executor) {
  let error = SrcValidator(src);
  if (error)
    return Promise.reject(`Failed to untar: ${error}`);

  error = DestValidator(dest);
  if (error)
    return Promise.reject(`Failed to untar: ${error}`);

  if (!executor)
    return Promise.reject(`Failed to untar: Executor is required`);

  return new Promise((resolve, reject) => {
    executor.Local('tar', ['-xzvf', src, '-C', dest], executor).then(output => {
      if (output.stderr) {
        reject(`Failed to untar: ${output.stderr}`);
        return;
      }
      resolve(true);
    }).catch(error => reject(`Failed to untar: ${error}`));
  });
}

function TarManual(args, executor) {
  let error = ArgsValidator(args);
  if (error)
    return Promise.reject(`Failed to execute tar command: ${error}`);

  if (!executor)
    return Promise.reject(`Failed to execute tar command: Executor is required`);

  return new Promise((resolve, reject) => {
    executor.Execute('tar', args).then(output => {
      if (output.stderr) {
        reject(`Failed to execute tar command: ${output.stderr}`);
        return;
      }
      resolve(true);
    }).catch(error => reject(`Failed to execute tar command: ${error}`));
  });
}

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

//--------------------------
// EXPORTS

exports.ZipFiles = ZipFiles;
exports.ZipDirectories = ZipDirectories;
exports.ZipManual = ZipManual;
exports.Unzip = Unzip;
exports.UnzipManual = UnzipManual;
exports.Tar = Tar;
exports.Untar = Untar;
exports.TarManual = TarManual;