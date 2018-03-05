let EXPECT = require('chai').expect;

let _path = require('path');
let rootDir = _path.join(__dirname, '..', '..');

let renameJs = _path.join(rootDir, 'rename.js');
let RENAME = require(renameJs).Rename;

let fileJs = _path.join(rootDir, 'file.js');
let FILE = require(fileJs);

let removeJs = _path.join(rootDir, 'remove.js');
let REMOVE = require(removeJs);

let pathJs = _path.join(rootDir, 'path.js');
let PATH = require(pathJs);

let commandJs = _path.join(rootDir, 'command.js');
let COMMAND = require(commandJs);

//------------------------------------------

describe('*** rename.js ***', () => {
  let executor = COMMAND.LOCAL;
  let filepath = _path.join(rootDir, 'delete_me.txt');
  let newName = 'renamed_file.txt';

  describe('Rename(src, newName, executor)', () => {
    it('Returns error if src is invalid.', () => {
      RENAME(null, newName, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if newName is invalid.', () => {
      RENAME(filepath, null, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      RENAME(filepath, newName, null).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Actually renames stuff.', () => {
      FILE.Create(filepath, 'delete me!', executor).then(success => {
        RENAME(filepath, newName, executor).then(success => {
          let parentDir = PATH.ParentDir(filepath);
          let newPath = _path.join(parentDir, newName);

          PATH.Exists(newPath, executor).then(exists => {
            FILE.Remove(newPath, executor).then(success => {
              EXPECT(exists).to.equal(true);
            }).catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      }).catch(error => EXPECT(false));
    });
  });
});