let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let directoryJs = PATH.join(rootDir, 'directory.js');
let DIRECTORY = require(directoryJs).Directory;

//------------------------------------------

describe('*** directory.js ***', () => {
  describe('Directory', () => {
    let dirPath = PATH.join(rootDir, 'delete_this_test_dir');

    describe('Create(path)', () => {
      it('Returns error if path is invalid.', () => {
        DIRECTORY.Create(null).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Actually creates a directory.', () => {
        DIRECTORY.Create(dirPath).then(success => EXPECT(true))
          .catch(error => EXPECT(false));
      });
    });

    describe('Size(path)', () => {
      it('Returns error if path is invalid.', () => {
        DIRECTORY.Size(null).then(size => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns integer if path is valid.', () => {
        DIRECTORY.Size(dirPath).then(size => {
          let isValid = Number.isInteger(size) && size >= 0;
        }).catch(error => EXPECT(false));
      });
    });

    describe('Remove(path)', () => {
      it('Returns error if path is invalid.', () => {
        DIRECTORY.Remove(null).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Actually removes a directory.', () => {
        DIRECTORY.Remove(dirPath).then(success => EXPECT(true))
          .catch(error => EXPECT(false));
      });
    });
  });
});