let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let fileJs = PATH.join(rootDir, 'file.js');
let FILE = require(fileJs).File;

//------------------------------------------

describe('*** file.js ***', () => {
  describe('File', () => {
    let filepath = PATH.join(rootDir, 'delete_this_test_file.txt');
    let text = 'test';

    describe('Create(path, text)', () => {
      it('Returns error if path is invalid.', () => {
        FILE.Create(null, text).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if text is invalid.', () => {
        FILE.Create(filepath, null).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Actually creates a file.', () => {
        FILE.Create(filepath, text).then(success => EXPECT(true))
          .catch(error => EXPECT(false));
      });
    });

    describe('MakeExecutable(path)', () => {
      it('Returns error if path is invalid.', () => {
        FILE.MakeExecutable(null).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Actually makes file executable.', () => {
        FILE.MakeExecutable(filepath).then(success => EXPECT(true))
          .catch(error => EXPECT(false));
      });
    });

    describe('Read(path)', () => {
      it('Returns error if path is invalid.', () => {
        FILE.Read(null).then(content => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns a string if path is valid.', () => {
        FILE.Read(filepath).then(content => {
          let isValid = typeof content == 'string';
          EXPECT(isValid).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });

    describe('ReadLines(path)', () => {
      it('Returns error if path is invalid.', () => {
        FILE.Read(null).then(lines => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an array of strings if path is valid.', () => {
        FILE.ReadLines(filepath).then(lines => {
          let isValid = Array.isArray(lines);
          EXPECT(isValid).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });

    describe('Remove(path)', () => {
      it('Returns error if path is invalid.', () => {
        FILE.Remove(null).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Actually removes a file.', () => {
        FILE.Remove(filepath).then(success => EXPECT(true))
          .catch(error => EXPECT(error).to.not.equal(null));
      });
    });
  });
});