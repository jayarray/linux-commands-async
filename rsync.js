let VALIDATE = require('./validate.js');

//-----------------------------------
// HELPERS

function argsValidator(args) {
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

//------------------------------------------------
// RSYNC

function Rsync(user, host, src, dest, executor) {
  let userError = VALIDATE.IsStringInput(user);
  if (userError)
    return Promise.reject(`Failed to execute rsync: user is ${userError}`);

  let hostError = VALIDATE.IsStringInput(host);
  if (hostError)
    return Promise.reject(`Failed to execute rsync: host is ${hostError}`);

  let srcError = VALIDATE.IsStringInput(src);
  if (srcError)
    return Promise.reject(`Failed to execute rsync: source is ${srcError}`);

  let destError = VALIDATE.IsStringInput(dest);
  if (destError)
    return Promise.reject(`Failed to execute rsync: destination is ${destError}`);

  if (!executor)
    return Promise.reject(`Failed to execute rsync: Executor is required`);

  return new Promise((resolve, reject) => {
    executor.Execute('rsync', ['-a', src, `${user}@${host}:${dest}`]).then(output => {
      if (output.stderr) {
        reject(`Failed to execute rsync: ${output.stderr}`);
        return;
      }
      resolve(output.stdout);
    }).catch(error => reject(`Failed to execute rsync: ${error}`));
  });
}

function Update(user, host, src, dest, executor) { // Update dest if src was updated
  let userError = VALIDATE.IsStringInput(user);
  if (userError)
    return Promise.reject(`Failed to execute rsync: user is ${userError}`);

  let hostError = VALIDATE.IsStringInput(host);
  if (hostError)
    return Promise.reject(`Failed to execute rsync: host is ${hostError}`);

  let srcError = VALIDATE.IsStringInput(src);
  if (srcError)
    return Promise.reject(`Failed to execute rsync: source is ${srcError}`);

  let destError = VALIDATE.IsStringInput(dest);
  if (destError)
    return Promise.reject(`Failed to execute rsync: destination is ${destError}`);

  if (!executor)
    return Promise.reject(`Failed to execute rsync: Executor is required`);

  return new Promise((resolve, reject) => {
    executor.Execute('rsync', ['-a', '--update', src, `${user}@${host}:${dest}`]).then(output => {
      if (output.stderr) {
        reject(`Failed to execute rsync: ${output.stderr}`);
        return;
      }
      resolve(output.stdout);
    }).catch(error => reject(`Failed to execute rsync: ${error}`));
  });
}

function Match(user, host, src, dest, executor) { // Copy files and then delete those NOT in src (Match dest to src)
  let userError = VALIDATE.IsStringInput(user);
  if (userError)
    return Promise.reject(`Failed to execute rsync: user is ${userError}`);

  let hostError = VALIDATE.IsStringInput(host);
  if (hostError)
    return Promise.reject(`Failed to execute rsync: host is ${hostError}`);

  let srcError = VALIDATE.IsStringInput(src);
  if (srcError)
    return Promise.reject(`Failed to execute rsync: source is ${srcError}`);

  let destError = VALIDATE.IsStringInput(dest);
  if (destError)
    return Promise.reject(`Failed to execute rsync: destination is ${destError}`);

  if (!executor)
    return Promise.reject(`Failed to execute rsync: Executor is required`);

  return new Promise((resolve, reject) => {
    executor.Execute('rsync', ['-a', '--delete-after', src, `${user}@${host}:${dest}`]).then(output => {
      if (output.stderr) {
        reject(`Failed to execute rsync: ${output.stderr}`);
        return;
      }
      resolve(output.stdout);
    }).catch(error => reject(`Failed to execute rsync: ${error}`));
  });
}

function DryRun(args, executor) { // Will execute without making changes (for testing command)
  let argsError = argsValidator(args);
  if (argsError)
    return Promise.reject(`Failed to execute rsync: ${argsError}`);

  if (!executor)
    return Promise.reject(`Failed to execute rsync: Executor is required`);

  return new Promise((resolve, reject) => {
    executor.Execute('rsync', ['--dry-run'].concat(args)).then(output => {
      if (output.stderr) {
        reject(`Failed to execute rsync: ${output.stderr}`);
        return;
      }
      resolve(output.stdout);
    }).catch(error => reject(`Failed to execute rsync: ${error}`));
  });
}

function Manual(args, executor) {  // args = [string | number]
  let argsError = argsValidator(args);
  if (argsError)
    return Promise.reject(`Failed to execute rsync: ${argsError}`);

  if (!executor)
    return Promise.reject(`Failed to execute rsync: Executor is required`);

  return new Promise((resolve, reject) => {
    executor.Execute('rsync', args).then(output => {
      if (output.stderr) {
        reject(`Failed to execute rsync: ${output.stderr}`);
        return;
      }
      resolve(output.stdout);
    }).catch(error => reject(`Failed to execute rsync: ${error}`));
  });
}

//-----------------------------------
// EXPORTS

exports.Rsync = Rsync;
exports.Update = Update;
exports.Match = Match;
exports.DryRun = DryRun;
exports.Manual = Manual;