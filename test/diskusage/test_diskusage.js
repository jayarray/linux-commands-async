let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let diskusageJs = PATH.join(rootDir, 'diskusage.js');
let DISKUSAGE = require(diskusageJs);

let commandJs = PATH.join(rootDir, 'command.js');
let COMMAND = require(commandJs);

//------------------------------------------

describe('*** diskusage.js ***', () => {
  let executor = COMMAND.LOCAL;
  let dirPath = rootDir;

  describe('ListAllItems(dirPath, executor)', () => {
    it('Returns error if dirpath is invalid.', () => {
      DISKUSAGE.ListAllItems(null, executor).then(items => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      DISKUSAGE.ListAllItems(dirPath, null).then(items => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an array of objects.', () => {
      DISKUSAGE.ListAllItems(dirPath, executor).then(items => {
        let isValid = Array.isArray(items);
        EXPECT(isValid).to.equal(true);
      }).catch(EXPECT(false));
    });
  });

  describe('ListVisibleItems(dirPath, executor)', () => {
    it('Returns error if dirpath is invalid.', () => {
      DISKUSAGE.ListVisibleItems(null, executor).then(items => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      DISKUSAGE.ListVisibleItems(dirPath, null).then(items => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an array of objects.', () => {
      DISKUSAGE.ListVisibleItems(dirPath, executor).then(items => {
        let isValid = Array.isArray(items);
        EXPECT(isValid).to.equal(true);
      }).catch(EXPECT(false));
    });
  });

  describe('ListHiddenItems(dirPath, executor)', () => {
    it('Returns error if dirpath is invalid.', () => {
      DISKUSAGE.ListHiddenItems(null, executor).then(items => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      DISKUSAGE.ListHiddenItems(dirPath, null).then(items => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an array of objects.', () => {
      DISKUSAGE.ListHiddenItems(dirPath, executor).then(items => {
        let isValid = Array.isArray(items);
        EXPECT(isValid).to.equal(true);
      }).catch(EXPECT(false));
    });
  });

  describe('DirSize(dirPath, executor)', () => {
    it('Returns error if dirpath is invalid.', () => {
      DISKUSAGE.DirSize(null, executor).then(items => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      DISKUSAGE.DirSize(dirPath, null).then(items => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns size.', () => {
      DISKUSAGE.DirSize(dirPath, executor).then(size => {
        let isValid = Number.isInteger(size);
        EXPECT(isValid).to.equal(true);
      }).catch(EXPECT(false));
    });
  });
});