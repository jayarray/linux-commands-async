let COMMAND = require('./command.js').Command;
let PATH = require('./path.js').Path;
let ERROR = require('./error.js');
let LINUX_COMMANDS = require('./linuxcommands.js');

//-------------------------------------------
// ZIP
class Zip {
  static CompressFiles(sources, dest, executor) {
    return new Promise((resolve, reject) => {
      let error = Error.DestValidator(dest);
      if (error) {
        reject(`Failed to zip files: ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to zip files: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.ZipFiles(sources, dest);
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to zip files: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => `Failed to zip files: ${error}`);
    });
  }

  static CompressDirs(sources, dest, executor) {
    return new Promise((resolve, reject) => {
      let error = Error.DestValidator(dest);
      if (error) {
        reject(`Failed to zip directories: ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to zip directories: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.ZipDirs(sources, dest);
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to zip directories: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => `Failed to zip directories: ${error}`);
    });
  }

  static Decompress(src, dest, executor) {
    return new Promise((resolve, reject) => {
      let error = Error.SrcValidator(src);
      if (error) {
        reject(`Failed to unzip: ${error}`);
        return;
      }

      error = Error.DestValidator(dest);
      if (error) {
        reject(`Failed to unzip: ${error}`);
        return;
      }

      let cmd = LINUX_COMMANDS.ZipDecompress(src, dest);
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to unzip: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => `Failed to unzip: ${error}`);
    });
  }

  static Manual(args, executor) {
    return new Promise((resolve, reject) => {
      error = Error.ArgsValidator(args);
      if (error) {
        reject(error);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to execute zip command: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.ZipManual(args);
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to execute zip command: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => `Failed to execute zip command: ${error}`);
    });
  }
}

//-------------------------------------------
// TAR

class Tar {
  static Compress(sources, dest, executor) {
    return new Promise((resolve, reject) => {
      let error = Error.SourcesValidator(src);
      if (error) {
        reject(`Failed to tar: ${error}`);
        return;
      }

      error = Error.DestValidator(dest);
      if (error) {
        reject(`Failed to tar: ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to tar: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.TarCompress(sources, dest);
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to tar: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => `Failed to tar: ${error}`);
    });
  }

  static Decompress(src, dest, executor) {
    return new Promise((resolve, reject) => {
      let error = Error.SrcValidator(src);
      if (error) {
        reject(`Failed to untar: source is ${error}`);
        return;
      }

      error = Error.DestValidator(dest);
      if (error) {
        reject(`Failed to untar: ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to untar: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.TarDecompress(src, dest);
      EXECUTE.Local(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to untar: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => `Failed to untar: ${error}`);
    });
  }

  static Manual(args, executor) {
    return new Promise((resolve, reject) => {
      error = Error.ArgsValidator(args);
      if (error) {
        reject(`Failed to execute tar command: ${error}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to execute tar command: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.TarManual(args);
      COMMAND.Execute(cmd, [], executor).then(output => {
        if (output.stderr) {
          reject(`Failed to execute tar command: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => `Failed to execute tar command: ${error}`);
    });
  }
}

//---------------------------------------------
// ERROR

class Error {
  static SrcValidator(dest) {
    let error = ERROR.StringValidator(dest);
    if (error)
      return `source is ${error}`;
    return null;
  }

  static DestValidator(dest) {
    let error = ERROR.StringValidator(dest);
    if (error)
      return `destination is ${error}`;
    return null;
  }

  static SourcesValidator(sources) {
    let error = ERROR.ArrayValidator(sources);
    if (error)
      return `sources are ${error}`;

    for (let i = 0; i < sources.length; ++i) {
      let currSrc = sources[i];
      let invalidType = ERROR.StringValidator(currSrc);
      if (invalidType)
        return `sources contains a path that is ${invalidType}`;
    }

    return null;
  }

  static KeepOriginalValidator(bool) {
    let error = ERROR.NullOrUndefined(bool);
    if (error)
      return `keepOriginal is ${error}`;

    if (!(bool === true) && !(bool === false))
      return 'keepOriginal is not a boolean value';

    return null;
  }

  static ArgsValidator(args) {
    let error = ERROR.ArrayValidator(args);
    if (error)
      return `arguments are ${error}`;

    for (let i = 0; i < args.length; ++i) {
      let currArg = args[i];
      let argIsValidString = ERROR.StringValidator(currArg) == null;
      let argIsValidNumber = !isNaN(currArg);

      if (!argIsValidString && !argIsValidNumber)
        return `arg elements must be string or number type`;
    }

    return null;
  }
}

//--------------------------
// EXPORTS

exports.Zip = Zip;
exports.Tar = Tar;