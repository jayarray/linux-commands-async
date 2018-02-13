let EXPECT = require('chai').expect;

let _path = require('path');
let rootDir = _path.join(__dirname, '..', '..');

let renameJs = _path.join(rootDir, 'rename.js');
let RENAME = require(renameJs).Rename;

let mkdirJs = _path.join(rootDir, 'mkdir.js');
let MKDIR = require(mkdirJs).Mkdir;

let removeJs = _path.join(rootDir, 'remove.js');
let REMOVE = require(removeJs).Remove;

let pathJs = _path.join(rootDir, 'path.js');
let PATH = require(pathJs).Path;

//------------------------------------------

describe('*** rename.js ***', () => {
  describe('Rename', () => {
    describe('Rename(currPath, newName)', () => {
      let testDirPath = _path.join(rootDir, 'delete_this_test_dir');
      let newName = 'new_test_dir';

      it('Returns error if currPath is undefined.', () => {
        RENAME.Rename(null, newName).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if currPath is invalid.', () => {
        RENAME.Rename('', newName).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if newName is undefined.', () => {
        RENAME.Rename(testDirPath, null).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if newName is invalid.', () => {
        RENAME.Rename(testDirPath, '').then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Actually renames stuff.', () => {
        MKDIR.Mkdirp(testDirPath).then(success => {
          RENAME.Rename(testDirPath, newName).then(success => {
            let parentDir = PATH.Path.ParentDir(testDirPath);
            let renamedPath = _path.join(parentDir.dir, newName);
            REMOVE.Directory(renamedPath).then(success => EXPECT(true))
              .catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      });
    });
  });
});