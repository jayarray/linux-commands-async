let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let copyJs = PATH.join(rootDir, 'copy.js');
let COPY = require(copyJs);

let fileJs = PATH.join(rootDir, 'file.js');
let FILE = require(fileJs);

let directoryJs = PATH.join(rootDir, 'directory.js');
let DIRECTORY = require(directoryJs);

let commandJs = PATH.join(rootDir, 'command.js');
let COMMAND = require(commandJs);

//------------------------------------------

describe('*** copy.js ***', () => {
  let executor = COMMAND.LOCAL;

  describe('File(src, dest, executor)', () => {
    let src = PATH.join(rootDir, 'README.md');
    let dest = PATH.join(rootDir, 'delete_me.txt');
    it('Returns an error if src is invalid.', () => {
      COPY.File(null, dest, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(true));
    });

    it('Returns an error if dest is invalid.', () => {
      COPY.File(src, null, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(true));
    });

    it('Returns an error if executor is invalid.', () => {
      COPY.File(src, dest, null).then(success => EXPECT(false))
        .catch(error => EXPECT(true));
    });

    it('Actually copies a file.', () => {
      COPY.File(src, dest, executor).then(success => {
        FILE.Remove(dest, executor).then(success => {
          EXPECT(true);
        }).catch(error => EXPECT(false));
      }).catch(error => EXPECT(false));
    });
  });

  describe('Directory(src, dest, executor)', () => {
    let testDir = PATH.join(rootDir, 'delete_this_dir');
    let testDirCopy = PATH.join(rootDir, 'dir_copy');

    it('Returns an error if src is invalid.', () => {
      COPY.Directory(null, testDirCopy, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(true));
    });

    it('Returns an error if dest is invalid.', () => {
      COPY.Directory(testDir, null, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(true));
    });

    it('Returns an error if executor is invalid.', () => {
      COPY.Directory(testDir, testDirCopy, null).then(success => EXPECT(false))
        .catch(error => EXPECT(true));
    });

    it('Actually copies a directory.', () => {
      DIRECTORY.Create(testDir, executor).then(success => {
        COPY.Directory(testDir, testDirCopy, executor).then(success => {
          DIRECTORY.Remove(testDir, executor).then(success => {
            DIRECTORY.Remove(testDirCopy, executor).then(success => {
              EXPECT(true);
            }).catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      }).catch(error => EXPECT(false));
    });
  });
});