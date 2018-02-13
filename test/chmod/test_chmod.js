let EXPECT = require('chai').expect;

let _path = require('path');
let rootDir = _path.join(__dirname, '..', '..');

let chmodJs = _path.join(rootDir, 'chmod.js');
let CHMOD = require(chmodJs).Chmod;

let mkdirJs = _path.join(rootDir, 'mkdir.js');
let MKDIR = require(mkdirJs).Mkdir;

let removeJs = _path.join(rootDir, 'remove.js');
let REMOVE = require(removeJs).Remove;

//------------------------------------------

describe('*** chmod.js ***', () => {
  describe('Chmod', () => {
    let testDirPath = _path.join(rootDir, 'delete_this_test_dir');

    describe('UsingPermString(permStr, path)', () => {
      let validPermString = 'rwxrwxrwx';
      let invalidPermString = 'blah';

      it('Returns error if permStr is undefined.', () => {
        CHMOD.UsingPermString(null, testDirPath).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if permStr is invalid.', () => {
        CHMOD.UsingPermString(invalidPermString, testDirPath).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if path is undefined.', () => {
        CHMOD.UsingPermString(validPermString, null).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Actually changes permissions.', () => {
        MKDIR.Mkdirp(testDirPath).then(success => {
          CHMOD.UsingPermString(validPermString, testDirPath).then(success => {
            REMOVE.Directory(testDirPath).then(success => EXPECT(true))
              .catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      });
    });

    describe('UsingOctalString(octalStr, path)', () => {
      let validOctalStr = '777';
      let invalidOctalStr = '77A';

      it('Returns error if octalStr is undefined.', () => {
        CHMOD.UsingOctalString(null, testDirPath).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if octalStr is invalid.', () => {
        CHMOD.UsingPermString(invalidOctalStr, testDirPath).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if path is undefined.', () => {
        CHMOD.UsingOctalString(validOctalStr, null).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Actually changes permissions.', () => {
        MKDIR.Mkdirp(testDirPath).then(success => {
          CHMOD.UsingOctalString(validOctalStr, testDirPath).then(success => {
            REMOVE.Directory(testDirPath).then(success => EXPECT(true))
              .catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      });
    });

    describe('RemovePermissions(classes, types, path)', () => {
      let validClasses = 'ugo';
      let invalidClasses = 'abc';

      let validTypes = 'rwx';
      let invalidTypes = 'abc';

      it('Returns error if classes is undefined.', () => {
        CHMOD.RemovePermissions(null, validTypes, testDirPath).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if classes is invalid.', () => {
        CHMOD.RemovePermissions(invalidClasses, validTypes, testDirPath).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if types is undefined.', () => {
        CHMOD.RemovePermissions(validClasses, undefined, testDirPath).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if types is invalid.', () => {
        CHMOD.RemovePermissions(validClasses, invalidTypes, testDirPath).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if path is undefined.', () => {
        CHMOD.RemovePermissions(validClasses, validTypes, null).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Actually changes permissions.', () => {
        MKDIR.Mkdirp(testDirPath).then(success => {
          CHMOD.RemovePermissions(validClasses, validTypes, testDirPath).then(success => {
            REMOVE.Directory(testDirPath).then(success => EXPECT(true))
              .catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      });
    });

    describe('AddPermissions(classes, types, path)', () => {
      let validClasses = 'ugo';
      let invalidClasses = 'abc';

      let validTypes = 'rwx';
      let invalidTypes = 'abc';

      it('Returns error if classes is undefined.', () => {
        CHMOD.AddPermissions(null, validTypes, testDirPath).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if classes is invalid.', () => {
        CHMOD.AddPermissions(invalidClasses, validTypes, testDirPath).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if types is undefined.', () => {
        CHMOD.AddPermissions(validClasses, undefined, testDirPath).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if types is invalid.', () => {
        CHMOD.AddPermissions(validClasses, invalidTypes, testDirPath).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if path is undefined.', () => {
        CHMOD.AddPermissions(validClasses, validTypes, null).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Actually changes permissions.', () => {
        MKDIR.Mkdirp(testDirPath).then(success => {
          CHMOD.AddPermissions(validClasses, validTypes, testDirPath).then(success => {
            REMOVE.Directory(testDirPath).then(success => EXPECT(true))
              .catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      });
    });

    describe('SetPermissions(classes, types, path)', () => {
      let validClasses = 'ugo';
      let invalidClasses = 'abc';

      let validTypes = 'rwx';
      let invalidTypes = 'abc';

      it('Returns error if classes is undefined.', () => {
        CHMOD.SetPermissions(null, validTypes, testDirPath).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if classes is invalid.', () => {
        CHMOD.SetPermissions(invalidClasses, validTypes, testDirPath).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if types is undefined.', () => {
        CHMOD.SetPermissions(validClasses, undefined, testDirPath).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if types is invalid.', () => {
        CHMOD.SetPermissions(validClasses, invalidTypes, testDirPath).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if path is undefined.', () => {
        CHMOD.SetPermissions(validClasses, validTypes, null).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Actually changes permissions.', () => {
        MKDIR.Mkdirp(testDirPath).then(success => {
          CHMOD.SetPermissions(validClasses, validTypes, testDirPath).then(success => {
            REMOVE.Directory(testDirPath).then(success => EXPECT(true))
              .catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      });
    });
  });
});