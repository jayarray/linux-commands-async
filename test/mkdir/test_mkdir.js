let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let mkdirJs = PATH.join(rootDir, 'mkdir.js');
let MKDIR = require(mkdirJs);

let directoryJs = PATH.join(rootDir, 'directory.js');
let DIRECTORY = require(directoryJs);

let commandJs = PATH.join(rootDir, 'command.js');
let COMMAND = require(commandJs);

//------------------------------------------

describe('*** mkdir.js ***', () => {
  let executor = COMMAND.LOCAL;
  let testDirPath = PATH.join(rootDir, 'delete_me');

  describe('MakeDirectory(path, executor)', () => {
    it('Returns an error if path is invalid.', () => {
      MKDIR.MakeDirectory(null, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(true));
    });

    it('Returns an error if executor is invalid.', () => {
      MKDIR.MakeDirectory(testDirPath, null).then(success => EXPECT(false))
        .catch(error => EXPECT(true));
    });

    it('Actually creates a directory.', () => {
      MKDIR.MakeDirectory(testDirPath, executor).then(success => {
        DIRECTORY.Remove(testDirPath, executor).then(success => {
          EXPECT(true);
        }).catch(error => EXPECT(false));
      }).catch(error => EXPECT(false));
    });
  });
});