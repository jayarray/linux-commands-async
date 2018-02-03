let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let timestampJs = PATH.join(rootDir, 'timestamp.js');
let TIMESTAMP = require(timestampJs);

//------------------------------------------

describe('*** timestamp.js ***', () => {
  describe('Error', () => {
    describe('NullOrUndefined(o)', () => {
      it(`Returns 'undefined' if o is undefined.`, () => {
        EXPECT(TIMESTAMP.Error.NullOrUndefined(undefined)).to.equal('undefined');
      });

      it(`Returns 'null' if o is null.`, () => {
        EXPECT(TIMESTAMP.Error.NullOrUndefined(null)).to.equal('null');
      });

      it('Returns null if o is defined.', () => {
        EXPECT(TIMESTAMP.Error.NullOrUndefined(1)).to.equal(null);
        EXPECT(TIMESTAMP.Error.NullOrUndefined('Hai')).to.equal(null);
        EXPECT(TIMESTAMP.Error.NullOrUndefined([])).to.equal(null);
      });
    });

    describe('StringError(s)', () => {
      it(`Returns 'undefined' if s is undefined.`, () => {
        EXPECT(TIMESTAMP.Error.StringError(undefined)).to.equal('undefined');
      });

      it(`Returns 'null' if s is null.`, () => {
        EXPECT(TIMESTAMP.Error.StringError(null)).to.equal('null');
      });

      it(`Returns 'not a string' if s is not string type.`, () => {
        EXPECT(TIMESTAMP.Error.StringError(1)).to.equal('not a string');
        EXPECT(TIMESTAMP.Error.StringError([])).to.equal('not a string');
        EXPECT(TIMESTAMP.Error.StringError(true)).to.equal('not a string');
      });

      it(`Returns 'empty' if s is empty.`, () => {
        EXPECT(TIMESTAMP.Error.StringError('')).to.equal('empty');
      });

      it(`Returns 'whitespace' if s is all whitespace.`, () => {
        EXPECT(TIMESTAMP.Error.StringError(' ')).to.equal('whitespace');
        EXPECT(TIMESTAMP.Error.StringError('\t')).to.equal('whitespace');
        EXPECT(TIMESTAMP.Error.StringError('\n  \t   ')).to.equal('whitespace');
      });

      it(`Returns null if s is valid.`, () => {
        EXPECT(TIMESTAMP.Error.StringError('hai')).to.equal(null);
        EXPECT(TIMESTAMP.Error.StringError('   hai')).to.equal(null);
        EXPECT(TIMESTAMP.Error.StringError('hai \t\n\t')).to.equal(null);
      });
    });

    describe('MeridiemTimeStringError(string)', () => { // CONT HERE
      it(`Reports undefined strings.`, () => {
        let error = EXECUTE.Error.MeridiemTimeStringError(undefined);
        EXPECT(error).to.equal('Time string is undefined');
      });

      it(`Returns null strings.`, () => {
        let error = EXECUTE.Error.MeridiemTimeStringError(null);
        EXPECT(error).to.equal('Time string is undefined');
      });

      it(`Reports invalid values.`, () => {
        EXPECT(EXECUTE.Error.MeridiemTimeStringError('X:00:00 AM')).to.equal('Hours do not resolve to an integer');
        EXPECT(EXECUTE.Error.MeridiemTimeStringError('15:00:00 AM')).to.equal('Hours must be between 1 and 12');

        EXPECT(EXECUTE.Error.MeridiemTimeStringError('10:X:00 AM')).to.equal('Minutes do not resolve to an integer');
        EXPECT(EXECUTE.Error.MeridiemTimeStringError('10:65:00 AM')).to.equal('Minutes must be between 0 and 59');

        EXPECT(EXECUTE.Error.MeridiemTimeStringError('10:00:X AM')).to.equal('Seconds do not resolve to an integer');
        EXPECT(EXECUTE.Error.MeridiemTimeStringError('10:00:65 AM')).to.equal('Seconds must be between 0 and 59');

        EXPECT(EXECUTE.Error.MeridiemTimeStringError('10:00:00 CA')).to.equal('Suffix (AM|PM) is not formatted correctly');
        EXPECT(EXECUTE.Error.MeridiemTimeStringError('10:65:00 AM')).to.equal('Minutes must be between 0 and 59');
      });

      it(`Returns null if no errors detected.`, () => {
        EXPECT(EXECUTE.Error.MeridiemTimeStringError('10:00:00 AM')).to.equal(null);
        EXPECT(EXECUTE.Error.MeridiemTimeStringError('10:30:00 AM')).to.equal(null);
        EXPECT(EXECUTE.Error.MeridiemTimeStringError('10:00:30 AM')).to.equal(null);
        EXPECT(EXECUTE.Error.MeridiemTimeStringError('10:00:00 PM')).to.equal(null);
      });
    });
  });
});