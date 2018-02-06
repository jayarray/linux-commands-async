let PATH = require('./path.js');
let FS = require('fs-extra');

//-------------------------------------------------
// COPY (cp)
class Copy {
  static Copy(src, dest) {
    return new Promise((resolve, reject) => {
      let error = PATH.Error.PathError(src);
      if (error) {
        reject(`Source error: ${error}`);
        return;
      }

      error = PATH.Error.PathError(dest);
      if (error) {
        reject(`Destination error: ${error}`);
        return;
      }

      PATH.Path.exists(src).then(exists => {
        if (!exists) {
          reject(`Source error: Path does not exist: ${src}`);
          return;
        }

        FS.copy(src, dest, (err) => {
          if (err) {
            reject(`Copy failed: ${err}`);
            return;
          }
          resolve(true);
        });
      }).catch(error => {
        reject(`Source error: ${error}`);
      });
    });
  }
}

//----------------------------------------
// EXPORTS

exports.Copy = Copy;