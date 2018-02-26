let VALIDATE = require('./validate.js');

//------------------------------------------------------
// MOVE 

class Move {
  static Move(src, dest, executor) {
    let srcError = VALIDATE.IsStringInput(src);
    if (srcError)
      return Promise.reject(`Failed to move: Source is ${srcError}`);

    let destError = VALIDATE.IsStringInput(dest);
    if (destError)
      return Promise.reject(`Failed to move: Destination is ${destError}`);

    if (!executor)
      return Promise.reject(`Failed to move: Executor is required`);

    return new Promise((resolve, reject) => {
      executor.Execute('mv', [src, dest]).then(output => {
        if (output.stderr) {
          reject(`Failed to move: ${output.stderr}`);
          return;
        }
        resolve(true);
      }).catch(error => reject(`Failed to move: ${error}`));
    });
  }
}

//----------------------------------
// EXPORTS

exports.Move = Move;