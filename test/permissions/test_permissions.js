let EXPECT = require('chai').expect;

let _path = require('path');
let rootDir = _path.join(__dirname, '..', '..');

let permissionsJs = _path.join(rootDir, 'permissions.js');
let PERMISSIONS = require(permissionsJs);

//------------------------------------------

describe('*** permissions.js ***', () => {
  describe('Error', () => {
    describe('NullOrUndefined(o)', () => {
      it(`Returns 'undefined' if o is undefined.`, () => {
        EXPECT(PERMISSIONS.Error.NullOrUndefined(undefined)).to.equal('undefined');
      });

      it(`Returns 'null' if o is null.`, () => {
        EXPECT(PERMISSIONS.Error.NullOrUndefined(null)).to.equal('null');
      });

      it('Returns null if o is defined.', () => {
        EXPECT(PERMISSIONS.Error.NullOrUndefined(1)).to.equal(null);
        EXPECT(PERMISSIONS.Error.NullOrUndefined('Hai')).to.equal(null);
        EXPECT(PERMISSIONS.Error.NullOrUndefined([])).to.equal(null);
      });
    });

    describe('IntegerError(i)', () => {
      it(`Returns 'undefined' if i is undefined.`, () => {
        EXPECT(PERMISSIONS.Error.IntegerError(undefined)).to.equal('is undefined');
      });

      it(`Returns 'null' if i is null.`, () => {
        EXPECT(PERMISSIONS.Error.IntegerError(null)).to.equal('is null');
      });

      it(`Returns 'is not an integer' if i is not an integer type.`, () => {
        EXPECT(PERMISSIONS.Error.IntegerError('string')).to.equal('is not an integer');
        EXPECT(PERMISSIONS.Error.IntegerError([])).to.equal('is not an integer');
        EXPECT(PERMISSIONS.Error.IntegerError(true)).to.equal('is not an integer');
      });

      it(`Returns null if i is a valid integer between 0 and 7.`, () => {
        EXPECT(PERMISSIONS.Error.IntegerError(0)).to.equal('is not an integer');
        EXPECT(PERMISSIONS.Error.IntegerError(5 - 4)).to.equal('is not an integer');
        EXPECT(PERMISSIONS.Error.IntegerError(7)).to.equal('is not an integer');
      });

    });
  });

  describe('Permissions', () => {
    describe('Permissions(path)', () => {
      // TO DO
    });

    describe('CreatePermissionsObjectUsingPermissionsString(permStr)', () => {
      // TO DO
    });

    describe('IntToRwxObject(int)', () => {
      // TO DO
    });

    describe('CreatePermissionsObjectUsingOctalString(octalStr) ', () => {
      // TO DO
    });

    describe('Equal(p1, p2)', () => {
      // TO DO
    });

    describe('ObjectToOctalString(obj)', () => {
      // TO DO
    });

    describe('PermissionsStringToOctalString(permStr)', () => {
      // TO DO
    });

    describe('FileTypeName(char)', () => {
      // TO DO
    });

    describe('IsNonExecutableChar(c)', () => {
      // TO DO
    });

    describe('WillSetUidOrGuidOrStickybit(c)', () => {
      // TO DO
    });

    describe('CharValue(c)', () => {
      // TO DO
    });

    describe('CharIsValid(c)', () => {
      // TO DO
    });
  });
});