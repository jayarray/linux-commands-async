let VALIDATE = require('./validate.js');

//-----------------------------------
// HELPERS

function argsValidator(args) {
  let error = VALIDATE.IsArray(args);
  if (error)
    return `arguments are ${error}`;

  // Every element should be a number or 
  if (!args.every(currArg => !isNaN(currArg) || VALIDATE.IsStringInput(currArg) == null))
    return `arg elements must be string or number type`;

  return null;
}

//------------------------------------------------
// RSYNC

function Rsync_(user, host, flag, src, dest, executor) { // PRIVATE
  let userError = VALIDATE.IsStringInput(user);
  if (userError)
    return Promise.reject(`Failed to execute rsync: user is ${userError}`);

  let hostError = VALIDATE.IsStringInput(host);
  if (hostError)
    return Promise.reject(`Failed to execute rsync: host is ${hostError}`);

  let flagError = VALIDATE.IsStringInput(flag);
  if (flagError)
    return Promise.reject(`Failed to execute rsync: flag is ${flagError}`);

  let srcError = VALIDATE.IsStringInput(src);
  if (srcError)
    return Promise.reject(`Failed to execute rsync: source is ${srcError}`);

  let destError = VALIDATE.IsStringInput(dest);
  if (destError)
    return Promise.reject(`Failed to execute rsync: destination is ${destError}`);

  if (!executor)
    return Promise.reject(`Failed to execute rsync: Executor is required`);

  return new Promise((resolve, reject) => {
    executor.Execute('rsync', ['-a'].concat(flag).concat([src, `${user}@${host}:${dest}`])).then(output => {
      if (output.stderr) {
        reject(`Failed to execute rsync: ${output.stderr}`);
        return;
      }
      resolve(output.stdout);
    }).catch(error => reject(`Failed to execute rsync: ${error}`));
  });
}

function Rsync(user, host, src, dest, executor) {
  return Rsync_(user, host, [], src, dest, executor);
}

function Update(user, host, src, dest, executor) { // Update dest if src was updated
  return Rsync_(user, host, '--update', src, dest, executor);
}

function Match(user, host, src, dest, executor) { // Copy files and then delete those NOT in src (Match dest to src)
  return Rsync_(user, host, '--delete-after', src, dest, executor);
}

function DryRun(args, executor) { // Will execute without making changes (for testing command)
  return Rsync_(user, host, '--dry-run', src, dest, executor);
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