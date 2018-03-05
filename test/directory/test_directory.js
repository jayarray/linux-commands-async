let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let directoryJs = PATH.join(rootDir, 'directory.js');
let DIRECTORY = require(directoryJs);

let commandJs = PATH.join(rootDir, 'command.js');
let COMMAND = require(commandJs);

//------------------------------------------

describe('*** directory.js ***', () => {
  let dirPath = PATH.join(rootDir, 'delete_this_test_dir');
  let executor = COMMAND.LOCAL;

  describe('Create(path, executor)', () => {
    it('Returns error if path is invalid.', () => {
      DIRECTORY.Create(null, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      DIRECTORY.Create(dirPath, null).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Actually creates a directory.', () => {
      DIRECTORY.Create(dirPath, executor).then(success => EXPECT(true))
        .catch(error => EXPECT(false));
    });
  });

  describe('Remove(path, executor)', () => {
    it('Returns error if path is invalid.', () => {
      DIRECTORY.Remove(null, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      DIRECTORY.Remove(dirPath, null).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Actually removes a directory.', () => {
      DIRECTORY.Remove(dirPath, executor).then(success => EXPECT(true))
        .catch(error => EXPECT(false));
    });
  });

  describe('Size(path, executor)', () => {
    it('Returns error if path is invalid.', () => {
      DIRECTORY.Size(null, executor).then(size => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      DIRECTORY.Size(rootDir, null).then(size => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns integer if path is valid.', () => {
      DIRECTORY.Size(rootDir, executor).then(size => {
        let isValid = Number.isInteger(size) && size >= 0;
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });
});