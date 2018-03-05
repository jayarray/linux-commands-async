let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let moveJs = PATH.join(rootDir, 'move.js');
let MOVE = require(moveJs);

let fileJs = PATH.join(rootDir, 'file.js');
let FILE = require(fileJs);

let commandJs = PATH.join(rootDir, 'command.js');
let COMMAND = require(commandJs);

//------------------------------------------

describe('*** move.js ***', () => {
  let testFilepath = PATH.join(rootDir, 'delete_this_test_file.txt');
  let testDest = PATH.join(rootDir, 'delete_me.txt');
  let executor = COMMAND.LOCAL;

  describe('Move(src, dest, executor)', () => {
    it('Returns an error if src is invalid.', () => {
      MOVE.Move(null, testDest, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(true));
    });

    it('Returns an error if dest is invalid.', () => {
      MOVE.Move(testFilepath, null, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(true));
    });

    it('Returns an error if executor is invalid.', () => {
      MOVE.Move(testFilepath, testDest, null).then(success => EXPECT(false))
        .catch(error => EXPECT(true));
    });

    it('Actually moves a file.', () => {
      // Write a test file
      let src = PATH.join(rootDir, 'delete_me.txt');
      let text = 'Delete me!';

      FILE.Create(testFilepath, text, executor).then(success => {
        MOVE.Move(testFilepath, testDest, executor).then(success => {
          FILE.Remove(testDest, executor).then(success => {
            EXPECT(true);
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      }).catch(error => EXPECT(false));
    });
  });
});