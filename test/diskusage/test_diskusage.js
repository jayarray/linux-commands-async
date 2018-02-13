let EXPECT = require('chai').expect;

let _path = require('path');
let rootDir = _path.join(__dirname, '..', '..');

let diskusageJs = _path.join(rootDir, 'diskusage.js');
let DISKUSAGE = require(diskusageJs).DiskUsage;

//------------------------------------------

describe('*** diskusage.js ***', () => {
  describe('DiskUsage', () => {
    let dirPath = rootDir;

    describe('ListAllItems(dirPath)', () => {
      it('Returns error if dirpath is invalid.', () => {
        DISKUSAGE.ListAllItems(null).then(items => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an array if dirpath is valid.', () => {
        DISKUSAGE.ListAllItems(dirPath).then(items => {
          let isValid = Array.isArray(items);
          EXPECT(isValid).to.equal(true);
        }).catch(EXPECT(false));
      });
    });

    describe('ListVisibleItems(dirPath)', () => {
      it('Returns error if dirpath is invalid.', () => {
        DISKUSAGE.ListAllItems(null).then(items => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an array if dirpath is valid.', () => {
        DISKUSAGE.ListVisibleItems(dirPath).then(items => {
          let isValid = Array.isArray(items);
          EXPECT(isValid).to.equal(true);
        }).catch(EXPECT(false));
      });
    });

    describe('ListHiddenItems(dirPath)', () => {
      it('Returns error if dirpath is invalid.', () => {
        DISKUSAGE.ListHiddenItems(null).then(items => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an array if dirpath is valid.', () => {
        DISKUSAGE.ListHiddenItems(dirPath).then(items => {
          let isValid = Array.isArray(items);
          EXPECT(isValid).to.equal(true);
        }).catch(EXPECT(false));
      });
    });

    describe('DirSize(dirPath)', () => {
      it('Returns error if dirpath is invalid.', () => {
        DISKUSAGE.ListHiddenItems(null).then(items => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an array if dirpath is valid.', () => {
        DISKUSAGE.ListHiddenItems(dirPath).then(items => {
          let isValid = Array.isArray(items);
          EXPECT(isValid).to.equal(true);
        }).catch(EXPECT(false));
      });
    });
  });
});