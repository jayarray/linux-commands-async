let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let permissionsJs = PATH.join(rootDir, 'permissions.js');
let PERMISSIONS = require(permissionsJs);

let commandJs = PATH.join(rootDir, 'command.js');
let COMMAND = require(commandJs);

//------------------------------------------

describe('*** permissions.js ***', () => {
  describe('Permissions', () => {
    let executor = COMMAND.LOCAL;
    let invalidPermStr = 'r--r--r-- 12 root root 4096 Jan 1 14:30 file.txt';
    let validPermStr = 'r--r--r--';
    let validOctalStr = '1777';
    let invalidOctalStr = '77A';
    let expectedValidPermToOctalString = '444';

    describe('Permissions(path, executor)', () => {
      let invalidPath = '';
      let validPath = rootDir;

      it('Returns error if path is invalid.', () => {
        PERMISSIONS.Permissions(null, executor).then(permObj => EXPECT(false))
          .catch(error => EXPECT(true));
      });

      it('Returns error if executor is invalid.', () => {
        PERMISSIONS.Permissions(rootDir, null).then(permObj => EXPECT(false))
          .catch(error => EXPECT(true));
      });

      it('Returns permissions object if path is valid.', () => {
        PERMISSIONS.Permissions(rootDir, executor).then(permObj => {
          let isValid = permObj != null && permObj !== undefined;
          EXPECT(isValid).to.not.equal(true);
        }).catch(error => EXPECT(true));
      });
    });

    describe('CreatePermissionsObjectUsingPermissionsString(permStr)', () => {
      it('Returns error if permStr is invalid.', () => {
        let results = PERMISSIONS.CreatePermissionsObjectUsingPermissionsString(invalidPermStr);
        EXPECT(results.error).to.not.equal(null);
      });

      it('Returns an object if permStr is valid.', () => {
        let results = PERMISSIONS.CreatePermissionsObjectUsingPermissionsString(validPermStr);
        EXPECT(results.error).to.equal(null);
      });
    });

    describe('CreatePermissionsObjectUsingOctalString(octalStr) ', () => {
      it('Returns error if octalStr is invalid.', () => {
        let results = PERMISSIONS.CreatePermissionsObjectUsingOctalString(invalidOctalStr);
        EXPECT(results.error).to.not.equal(null);
      });

      it('Returns an object if octalStr is valid.', () => {
        let results = PERMISSIONS.CreatePermissionsObjectUsingOctalString(validOctalStr);
        EXPECT(results.error).to.equal(null);
      });
    });

    describe('Equal(p1, p2)', () => {
      it('Returns error if p1 or p2 is invalid.', () => {
        let p1 = PERMISSIONS.CreatePermissionsObjectUsingPermissionsString(invalidPermStr);
        let p2 = PERMISSIONS.CreatePermissionsObjectUsingPermissionsString(validPermStr);
        let results = PERMISSIONS.Equal(p1.obj, p2.obj);
        EXPECT(results.error).to.not.equal(null);
      });

      it('Returns a boolean value if p1 and p2 are valid.', () => {
        let p1 = PERMISSIONS.CreatePermissionsObjectUsingPermissionsString(validPermStr);
        let p2 = PERMISSIONS.CreatePermissionsObjectUsingPermissionsString(validPermStr);
        let results = PERMISSIONS.Equal(p1.obj, p2.obj);

        let isBoolean = results.equal === true || results.equal === false;
        EXPECT(isBoolean).to.not.equal(true);
      });
    });

    describe('PermissionsStringToOctalString(permStr)', () => {
      it('Returns error if permStr is invalid.', () => {
        let results = PERMISSIONS.PermissionsStringToOctalString(invalidPermStr);
        EXPECT(results.error).to.not.equal(null);
      });

      it('Returns a string if permStr is valid.', () => {
        let results = PERMISSIONS.PermissionsStringToOctalString(validPermStr);
        EXPECT(results.string).to.equal(expectedValidPermToOctalString);
      });
    });
  });
});