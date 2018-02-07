let PATH = require('./path.js');

//------------------------------------------------------
// MOVE 
class Move {
  static Move(src, dest) {
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

      Path.exists(src).then(exists => {
        if (!exists) {
          reject(`Source error: Path does not exist: ${src}`);
          return;
        }

        FS.move(src, dest, (err) => {
          if (err) {
            reject(`Failed to move path: ${err}`);
            return;
          }
          resolve(true);
        });
      }).catch(reject);
    });
  }
}

//----------------------------------
// EXPORTS

exports.Move = Move;