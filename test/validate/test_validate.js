let EXPECT = require('chai').expect;

let _path = require('path');
let rootDir = _path.join(__dirname, '..', '..');

let validateJs = _path.join(rootDir, 'validate.js');
let VALIDATE = require(validateJs);

//------------------------------------------

describe('*** validate.js ***', () => {

  describe('IsInstance(o)', () => {
    it('Returns error if o is null.', () => {
      let error = VALIDATE.IsInstance(null);
      EXPECT(error).to.not.equal(null);
    });

    it('Returns error if o is undefined.', () => {
      let error = VALIDATE.IsInstance(undefined);
      EXPECT(error).to.not.equal(null);
    });

    it('Returns null if o is neither null or undefined.', () => {
      let error = VALIDATE.IsInstance('');
      EXPECT(error).to.equal(null);
    });
  });

  describe('IsStringInput(s)', () => {
    it('Returns error if s is null.', () => {
      let error = VALIDATE.IsStringInput(null);
      EXPECT(error).to.not.equal(null);
    });

    it('Returns error if s is undefined.', () => {
      let error = VALIDATE.IsStringInput(undefined);
      EXPECT(error).to.not.equal(null);
    });

    it('Returns error if s is not a string.', () => {
      let error = VALIDATE.IsStringInput(1);
      EXPECT(error).to.not.equal(null);
    });

    it('Returns error if s is empty.', () => {
      let error = VALIDATE.IsStringInput('');
      EXPECT(error).to.not.equal(null);
    });

    it('Returns error if s is whitespace.', () => {
      let error = VALIDATE.IsStringInput('  ');
      EXPECT(error).to.not.equal(null);
    });

    it('Returns null if s is a non-empty string.', () => {
      let error = VALIDATE.IsStringInput('hi');
      EXPECT(error).to.equal(null);
    });
  });

  describe('IsNumber(n)', () => {
    it('Returns error if n is null.', () => {
      let error = VALIDATE.IsNumber(null);
      EXPECT(error).to.not.equal(null);
    });

    it('Returns error if n is undefined.', () => {
      let error = VALIDATE.IsNumber(undefined);
      EXPECT(error).to.not.equal(null);
    });

    it('Returns error if n is not a number.', () => {
      let error = VALIDATE.IsNumber('hi');
      EXPECT(error).to.not.equal(null);
    });

    it('Returns null if n is a number.', () => {
      let error = VALIDATE.IsNumber(2.5);
      EXPECT(error).to.equal(null);
    });
  });

  describe('IsInteger(n)', () => {
    it('Returns error if n is null.', () => {
      let error = VALIDATE.IsInteger(null);
      EXPECT(error).to.not.equal(null);
    });

    it('Returns error if n is undefined.', () => {
      let error = VALIDATE.IsInteger(undefined);
      EXPECT(error).to.not.equal(null);
    });

    it('Returns error if n is not an integer.', () => {
      let error = VALIDATE.IsInteger(2.5);
      EXPECT(error).to.not.equal(null);
    });

    it('Returns null if n is an integer.', () => {
      let error = VALIDATE.IsInteger(1);
      EXPECT(error).to.equal(null);
    });
  });

  describe('IsIntegerInRange(n, min, max)', () => {
    let min = 0;
    let max = 10;
    let tooSmall = -10;
    let tooBig = 30;
    let justRight = 5;

    describe('If min and max are defined', () => {
      it('Returns error if n < min.', () => {
        let error = VALIDATE.IsIntegerInRange(tooSmall, min, max);
        EXPECT(error).to.not.equal(null);
      });

      it('Returns error if n < min (min and max swapped).', () => {
        let error = VALIDATE.IsIntegerInRange(tooSmall, max, min);
        EXPECT(error).to.not.equal(null);
      });

      it('Returns error if n > max.', () => {
        let error = VALIDATE.IsIntegerInRange(tooBig, min, max);
        EXPECT(error).to.not.equal(null);
      });

      it('Returns error if n > max (min and max swapped).', () => {
        let error = VALIDATE.IsIntegerInRange(tooBig, max, min);
        EXPECT(error).to.not.equal(null);
      });

      it('Returns null if n is in range.', () => {
        let error = VALIDATE.IsIntegerInRange(justRight, min, max);
        EXPECT(error).to.equal(null);
      });

      it('Returns null if n is in range (min and max swapped).', () => {
        let error = VALIDATE.IsIntegerInRange(justRight, max, min);
        EXPECT(error).to.equal(null);
      });
    });

    describe('If only min is defined', () => {
      it('Returns error if n < min.', () => {
        let error = VALIDATE.IsIntegerInRange(tooSmall, min, null);
        EXPECT(error).to.not.equal(null);
      });

      it('Returns null if n is in range.', () => {
        let error = VALIDATE.IsIntegerInRange(justRight, min, null);
        EXPECT(error).to.equal(null);
      });
    });

    describe('If only max is defined', () => {
      it('Returns error if n > max.', () => {
        let error = VALIDATE.IsIntegerInRange(tooBig, null, max);
        EXPECT(error).to.not.equal(null);
      });

      it('Returns null if n is in range.', () => {
        let error = VALIDATE.IsIntegerInRange(justRight, null, max);
        EXPECT(error).to.equal(null);
      });
    });
  });

  describe('IsArray(o)', () => {
    it('Returns error if o is null.', () => {
      let error = VALIDATE.IsArray(null);
      EXPECT(error).to.not.equal(null);
    });

    it('Returns error if o is undefined.', () => {
      let error = VALIDATE.IsArray(undefined);
      EXPECT(error).to.not.equal(null);
    });

    it('Returns null if o is not an array.', () => {
      let error = VALIDATE.IsArray(3);
      EXPECT(error).to.not.equal(null);
    });

    it('Returns null if o is an array.', () => {
      let error = VALIDATE.IsArray([1, 2, 3]);
      EXPECT(error).to.equal(null);
    });
  });
});