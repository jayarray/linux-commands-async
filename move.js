let PATH = require('./path.js');
let ERROR = require('./error.js');
let COMMAND = require('./command.js').Command;
let LINUX_COMMANDS = require('./linuxcommands.js');

//------------------------------------------------------
// MOVE 
class Move {
  static Move(src, dest, executor) {
    return new Promise((resolve, reject) => {
      let srcError = PATH.Error.PathValidator(src);
      if (srcError) {
        reject(`Failed to move: Source is ${srcError}`);
        return;
      }

      let destError = PATH.Error.PathValidator(dest);
      if (destError) {
        reject(`Failed to move: Destination is ${destError}`);
        return;
      }

      let executorError = ERROR.ExecutorValidator(executor);
      if (executorError) {
        reject(`Failed to move: Connection is ${executorError}`);
        return;
      }

      let cmd = LINUX_COMMANDS.Move(src, dest);
      COMMAND.Execute(cmd, [], executor).then(output => {
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