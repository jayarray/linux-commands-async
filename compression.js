let COMMAND = require('./command.js').Command;
let PATH = require('./path.js');
let ERROR = require('./error.js');
let LINUX_COMMANDS = require('./linuxcommands.js');

//------------------------------------------
// HELPERS

function allSourcesExist(sources, executor) {
  return new Promise((resolve, reject) => {
    let sourcesError = Error.SourcesValidator(sources);
    if (sourcesError) {
      reject(`Failed to verify if all sources exist: ${sourcesError}`);
      return;
    }

    let executorError = ERROR.ExecutorValidator(executor);
    if (executorError) {
      reject(`Failed to verify if all sources exist: Connection is ${executorError}`);
      return;
    }

    let sourcesExistActions = sources.map(src => PATH.Path.Exists(src, executor));
    Promise.all(sourcesExistActions).then(existsResults => {

      let nonExistantPaths = [];
      for (let i = 0; i < existsResults.length; ++i) {
        if (!existsResults[i])
          nonExistantPaths.push(sources[i]);
      }

      if (nonExistantPaths.length > 0) {
        let errorStr = '';
        if (nonExistantPaths.length == 1)
          errorStr = `This path does not exist: ${nonExistantPaths[0]}`;
        else
          errorStr = `The following (${nonExistantPaths.length}) paths do not exist:\n${nonExistantPaths.join('\n')}`;

        reject(errorStr);
        return;
      }
      resolve(true);
    }).catch(error => `Failed to verify if all sources exist: ${error}`);
  });
}

function allSourcesAreFiles(sources, executor) {
  return new Promise((resolve, reject) => {
    allSourcesExist(sources, executor).then(success => {
      let sourcesAreFilesActions = sources.map(src => PATH.Path.IsFile(src, executor));

      Promise.all(sourcesAreFilesActions).then(isFileResults => {

        let nonFilePaths = [];
        for (let i = 0; i < isFileResults.length; ++i) {
          if (!isFileResults[i])
            nonFilePaths.push(sources[i]);
        }

        if (nonFilePaths.length > 0) {
          let errorStr = '';
          if (nonFilePaths.length == 1)
            errorStr = `This path is not a file: ${nonFilePaths[0]}`;
          else
            errorStr = `The following (${nonFilePaths.length}) paths are not files:\n${nonFilePaths.join('\n')}`;

          reject(errorStr);
          return;
        }

        resolve(true);
      }).catch(error => `Failed to verify if all sources are files: ${error}`);
    }).catch(error => `Failed to verify if all sources are files: ${error}`);
  });
}

function allSourcesAreDirs(sources, executor) {
  return new Promise((resolve, reject) => {
    allSourcesExist(sources, executor).then(success => {
      let sourcesAreDirsActions = sources.map(src => PATH.Path.IsDir(src, executor));

      Promise.all(sourcesAreDirsActions).then(isDirResults => {

        let nonDirPaths = [];
        for (let i = 0; i < isDirResults.length; ++i) {
          if (!isDirResults[i])
            nonDirPaths.push(sources[i]);
        }

        if (nonDirPaths.length > 0) {
          let errorStr = '';
          if (nonDirPaths.length == 1)
            errorStr = `This path is not a directory: ${nonDirPaths[0]}`;
          else
            errorStr = `The following (${nonDirPaths.length}) paths are not directories:\n${nonDirPaths.join('\n')}`;

          reject(errorStr);
          return;
        }
        resolve(true);
      }).catch(error => `Failed to verify if all sources are directories: ${error}`);
    }).catch(error => `Failed to verify if all sources are directories: ${error}`);
  });
}

//-------------------------------------------
// ZIP
class Zip {
  static CompressFiles(sources, dest, executor) {
    return new Promise((resolve, reject) => {
      allSourcesExist(sources, executor).then(success => {
        allSourcesAreFiles(sources, executor).then(success => {
          let error = Error.DestValidator(dest);
          if (error) {
            reject(`Failed to zip files: ${error}`);
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
        }).catch(error => `Failed to zip files: ${error}`);
      }).catch(error => `Failed to zip files: ${error}`);
    });
  }

  static CompressDirs(sources, dest, executor) {
    return new Promise((resolve, reject) => {
      allSourcesExist(sources, executor).then(success => {
        allSourcesAreDirs(sources, executor).then(success => {
          let error = Error.DestValidator(dest);
          if (`Failed to zip directories: ${error}`) {
            reject(error);
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
        }).catch(error => `Failed to zip directories: ${error}`);
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

      PATH.Path.Exists(src, executor).then(exists => {
        if (!exists) {
          reject(`Failed to unzip: source does not exist: ${src}`);
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

      allSourcesExist(sources, executor).then(success => {
        let cmd = LINUX_COMMANDS.TarCompressMultiple(sources, dest);
        COMMAND.Execute(cmd, [], executor).then(output => {
          if (output.stderr) {
            reject(`Failed to tar: ${output.stderr}`);
            return;
          }
          resolve(true);
        }).catch(error => `Failed to tar: ${error}`);
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

      PATH.Path.Exists(src, executor).then(exists => {
        if (!exists) {
          reject(`Failed to untar: source does not exist: ${src}`);
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
exports.Gzip = Gzip;
exports.Tar = Tar;