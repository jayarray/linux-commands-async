let EXECUTE = require('./execute.js').Execute;
let PATH = require('./path.js');
let ERROR = require('./error.js').Error;

//------------------------------------------
// HELPERS

function allSourcesExist(sources) {
  return new Promise((resolve, reject) => {
    let error = Error.SourcesError(sources);
    if (error) {
      reject(error);
      return;
    }

    let sourcesExistActions = sources.map(PATH.Path.Exists);
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
    }).catch(reject);
  });
}

function allSourcesAreFiles(sources) {
  return new Promise((resolve, reject) => {
    allSourcesExist(sources).then(success => {
      let sourcesAreFilesActions = sources.map(PATH.Path.IsFile);

      Promise.all(sourcesAreFilesActions).then(isFileResults => {

        let nonFilePaths = [];
        for (let i = 0; i < isFileResults.length; ++i) {
          if (!isFileResults[i])
            nonFilePaths.push(sources[i]);
        }

        if (nonFilePaths.length > 0) {
          let error = '';
          if (nonFilePaths.length == 1)
            error = `This path is not a file: ${nonFilePaths[0]}`;
          else
            error = `The following (${nonFilePaths.length}) paths are not files:\n${nonFilePaths.join('\n')}`;

          reject(error);
          return;
        }

        resolve(true);
      }).catch(reject);
    }).catch(reject);
  });
}

function allSourcesAreDirs(sources) {
  return new Promise((resolve, reject) => {
    allSourcesExist(sources).then(success => {
      let sourcesAreDirsActions = sources.map(PATH.Path.IsDir);

      Promise.all(sourcesAreDirsActions).then(isDirResults => {

        let nonDirPaths = [];
        for (let i = 0; i < isDirResults.length; ++i) {
          if (!isDirResults[i])
            nonDirPaths.push(sources[i]);
        }

        if (nonDirPaths.length > 0) {
          let error = '';
          if (nonDirPaths.length == 1)
            error = `This path is not a directory: ${nonDirPaths[0]}`;
          else
            error = `The following (${nonDirPaths.length}) paths are not directories:\n${nonDirPaths.join('\n')}`;

          reject(error);
          return;
        }

        resolve(true);
      }).catch(reject);
    }).catch(reject);
  });
}

//-------------------------------------------
// ZIP
class Zip {
  static CompressFiles(sources, dest) {
    return new Promise((resolve, reject) => {
      allSourcesExist(sources).then(success => {
        allSourcesAreFiles(sources).then(success => {
          let error = Error.DestError(dest);
          if (error) {
            reject(error);
            return;
          }

          let args = [dest].concat(sources);
          EXECUTE.Local('zip', args).then(output => {
            if (output.stderr) {
              reject(`Failed to compress files: ${output.stderr}`);
              return;
            }
            resolve(true);
          }).catch(reject);
        }).catch(reject);
      }).catch(reject);
    });
  }

  static CompressDirs(sources, dest) {
    return new Promise((resolve, reject) => {
      allSourcesExist(sources).then(success => {
        allSourcesAreDirs(sources).then(success => {
          let error = Error.DestError(dest);
          if (error) {
            reject(error);
            return;
          }

          let args = ['-r', dest].concat(sources);
          EXECUTE.Local('zip', args).then(output => {
            if (output.stderr) {
              reject(`Failed to compress directories: ${output.stderr}`);
              return;
            }
            resolve(true);
          }).catch(reject);
        }).catch(reject);
      }).catch(reject);
    });
  }

  static Decompress(src, dest) {
    return new Promise((resolve, reject) => {
      let error = Error.SrcError(src);
      if (error) {
        reject(error);
        return;
      }

      error = Error.DestError(dest);
      if (error) {
        reject(error);
        return;
      }

      PATH.Path.Exists(src).then(exists => {
        if (!exists) {
          reject(`Source does not exist: ${src}`);
          return;
        }

        let args = [src, '-d', dest];
        EXECUTE.Local('unzip', args).then(output => {
          if (output.stderr) {
            reject(`Failed to decompress: ${output.stderr}`);
            return;
          }
          resolve(true);
        }).catch(reject);
      }).catch(reject);
    });
  }

  static Manual(args) {
    return new Promise((resolve, reject) => {
      error = Error.ArgsError(args);
      if (error) {
        reject(error);
        return;
      }

      EXECUTE.Local('zip', args).then(output => {
        if (output.stderr) {
          reject(`Failed to compress: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(reject);
    });
  }
}


//--------------------------------------------
// GZIP

class Gzip {
  static CompressFile(src, dest, keepOriginal) {
    return new Promise((resolve, reject) => {
      let error = Error.SrcError(src);
      if (error) {
        reject(error);
        return;
      }

      error = Error.DestError(dest);
      if (error) {
        reject(error);
        return;
      }

      error = Error.KeepOriginalError(keepOriginal);
      if (error) {
        reject(error);
        return;
      }

      PATH.Path.Exists(src).then(exists => {
        if (!exists) {
          reject(`Source does not exist: ${src}`);
          return;
        }

        PATH.Path.IsFile(src).then(isFile => {
          if (!isFile) {
            reject(`Source is not a file: ${src}`);
            return;
          }

          let args = [];
          if (keepOriginal)
            args.push('-c');
          args.push(src, '>', dest);

          EXECUTE.Local('gzip', args).then(output => {
            if (output.stderr) {
              reject(`Failed to compress file: ${output.stderr}`);
              return;
            }
            resolve(true);
          }).catch(reject);
        }).catch(reject);
      }).catch(reject);
    });
  }

  static Decompress(src, keepOriginal) {
    return new Promise((resolve, reject) => {
      let error = Error.SrcError(src);
      if (error) {
        reject(error);
        return;
      }

      error = Error.KeepOriginalError(keepOriginal);
      if (error) {
        reject(error);
        return;
      }

      PATH.Path.Exists(src).then(exists => {
        if (!exists) {
          reject(`Source does not exist: ${src}`);
          return;
        }

        let args = [];
        if (keepOriginal)
          args.push('-cd');
        else
          args.push('-d');
        args.push(src);

        EXECUTE.Local('gzip', args).then(output => {
          if (output.stderr) {
            reject(`Failed to decompress: ${output.stderr}`);
            return;
          }
          resolve(true);
        }).catch(reject);
      }).catch(reject);
    });
  }

  static Manual(args) {
    return new Promise((resolve, reject) => {
      error = Error.ArgsError(args);
      if (error) {
        reject(error);
        return;
      }

      EXECUTE.Local('gzip', args).then(output => {
        if (output.stderr) {
          reject(`Failed to compress: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(reject);
    });
  }
}


//-------------------------------------------
// TAR

class Tar {
  static Compress(src, dest) {
    return new Promise((resolve, reject) => {
      let error = Error.SrcError(src);
      if (error) {
        reject(error);
        return;
      }

      error = Error.DestError(dest);
      if (error) {
        reject(error);
        return;
      }

      PATH.Path.Exists(src).then(exists => {
        if (!exists) {
          reject(`Source does not exist: ${src}`);
          return;
        }

        let args = ['-czvf', dest, src];
        EXECUTE.Local('tar', args).then(output => {
          if (output.stderr) {
            reject(`Failed to compress: ${output.stderr}`);
            return;
          }
          resolve(true);
        }).catch(reject);
      }).catch(reject);
    });
  }

  static Decompress(src, dest) {  // dest is a directory
    return new Promise((resolve, reject) => {
      let error = Error.SrcError(src);
      if (error) {
        reject(error);
        return;
      }

      error = Error.DestError(src);
      if (error) {
        reject(error);
        return;
      }

      PATH.Path.Exists(src).then(exists => {
        if (!exists) {
          reject(`Source does not exist: ${src}`);
          return;
        }

        PATH.Path.Exists(dest).then(exists => {
          if (!exists) {
            reject(`Destination does not exist: ${dest}`);
            return;
          }

          PATH.Path.IsDir(dest).then(isDir => {
            if (!isDir) {
              reject(`Destination is not a directory: ${dest}`);
              return;
            }

            let args = ['-xzvf', src, '-C', dest];
            EXECUTE.Local('tar', args).then(output => {
              if (output.stderr) {
                reject(`Failed to compress: ${output.stderr}`);
                return;
              }
              resolve(true);
            }).catch(reject);
          }).catch(reject);
        }).catch(reject);
      }).catch(reject);
    });
  }

  static Manual(args) {
    return new Promise((resolve, reject) => {
      error = Error.ArgsError(args);
      if (error) {
        reject(error);
        return;
      }

      EXECUTE.Local('tar', args).then(output => {
        if (output.stderr) {
          reject(`Failed to compress: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(reject);
    });
  }
}


//---------------------------------------------
// ERROR

class Error {
  static SrcError(dest) {
    let error = ERROR.StringError(dest);
    if (error)
      return `src is ${error}`;
    return null;
  }

  static DestError(dest) {
    let error = ERROR.StringError(dest);
    if (error)
      return `dest is ${error}`;
    return null;
  }

  static SourcesError(sources) {
    let error = ERROR.ArrayError(sources);
    if (error)
      return `sources is ${error}`;

    for (let i = 0; i < sources.length; ++i) {
      let currSrc = sources[i];
      let invalidType = ERROR.StringError(currSrc);
      if (invalidType)
        return `sources contains a path that is ${invalidType}`;
    }

    return null;
  }

  static KeepOriginalError(bool) {
    let error = ERROR.NullOrUndefined(bool);
    if (error)
      return `keepOriginal is ${error}`;

    if (!(bool === true) && !(bool === false))
      return 'keepOriginal is not a boolean value';

    return null;
  }

  static ArgsError(args) {
    let error = ERROR.ArrayError(args);
    if (error)
      return `args is ${error}`;

    for (let i = 0; i < args.length; ++i) {
      let currArg = args[i];
      let argIsValidString = ERROR.StringError(currArg) == null;
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