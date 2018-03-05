let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let removeJs = PATH.join(rootDir, 'remove.js');
let REMOVE = require(removeJs);

let fileJs = PATH.join(rootDir, 'file.js');
let FILE = require(fileJs);

let directoryJs = PATH.join(rootDir, 'directory.js');
let DIRECTORY = require(directoryJs);

let commandJs = PATH.join(rootDir, 'command.js');
let COMMAND = require(commandJs);

//------------------------------------------

describe('*** remove.js ***', () => {
  let executor = COMMAND.LOCAL;

  describe('Files(paths, executor)', () => {
    let filepath = 'delete_me.txt';

    it('Returns an error if paths is invalid.', () => {
      REMOVE.Files(null, executor).then(bool => EXPECT(false))
        .catch(error => EXPECT(true));
    });

    it('Returns an error if executor is invalid.', () => {
      REMOVE.Files([filepath], null).then(bool => EXPECT(false))
        .catch(error => EXPECT(true));
    });

    it('Actually deletes files.', () => {
      FILE.Create(filepath, 'delete me!', executor).then(success => {
        REMOVE.Files([filepath], executor).then(success => {
          EXPECT(true);
        }).catch(error => EXPECT(false));
      }).catch(error => EXPECT(false));
    });
  });

  describe('Directories(paths, executor)', () => {
    let dirpath = 'delete_this_dir';

    it('Returns an error if paths is invalid.', () => {
      REMOVE.Directories(null, executor).then(bool => EXPECT(false))
        .catch(error => EXPECT(true));
    });

    it('Returns an error if executor is invalid.', () => {
      REMOVE.Directories([dirpath], null).then(bool => EXPECT(false))
        .catch(error => EXPECT(true));
    });

    it('Actually deletes files.', () => {
      DIRECTORY.Create(dirpath, executor).then(success => {
        REMOVE.Directories([dirpath], executor).then(success => {
          EXPECT(true);
        }).catch(error => EXPECT(false));
      }).catch(error => EXPECT(false));
    });
  });
});