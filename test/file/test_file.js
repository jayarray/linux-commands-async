let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let fileJs = PATH.join(rootDir, 'file.js');
let FILE = require(fileJs);

let commandJs = PATH.join(rootDir, 'command.js');
let COMMAND = require(commandJs);

//------------------------------------------

describe('*** file.js ***', () => {
  let executor = COMMAND.LOCAL;
  let filepath = PATH.join(rootDir, 'delete_this_test_file.txt');
  let text = 'test';

  describe('Create(path, text, executor)', () => {
    it('Returns error if path is invalid.', () => {
      FILE.Create(null, text, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if text is invalid.', () => {
      FILE.Create(filepath, null, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      FILE.Create(filepath, text, null).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Actually creates a file.', () => {
      FILE.Create(filepath, text, executor).then(success => EXPECT(true))
        .catch(error => EXPECT(false));
    });
  });

  describe('MakeExecutable(path, executor)', () => {
    it('Returns error if path is invalid.', () => {
      FILE.MakeExecutable(null, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      FILE.MakeExecutable(filepath, null).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Actually makes file executable.', () => {
      FILE.MakeExecutable(filepath, executor).then(success => EXPECT(true))
        .catch(error => EXPECT(false));
    });
  });

  describe('Read(path, executor)', () => {
    it('Returns error if path is invalid.', () => {
      FILE.Read(null, executor).then(content => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      FILE.Read(filepath, null).then(content => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns a stringn when file is read.', () => {
      FILE.Read(filepath, executor).then(content => {
        let isValid = typeof content == 'string';
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('ReadLines(path, executor)', () => {
    it('Returns error if path is invalid.', () => {
      FILE.Read(null, executor).then(lines => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      FILE.Read(filepath, null).then(lines => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an array of strings when file is read.', () => {
      FILE.ReadLines(filepath, executor).then(lines => {
        let isValid = Array.isArray(lines);
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('Remove(path, executor)', () => {
    it('Returns error if path is invalid.', () => {
      FILE.Remove(null, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      FILE.Remove(filepath, null).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Actually removes a file.', () => {
      FILE.Remove(filepath, executor).then(success => EXPECT(true))
        .catch(error => EXPECT(error).to.not.equal(null));
    });
  });
});