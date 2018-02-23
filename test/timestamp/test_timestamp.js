let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let timestampJs = PATH.join(rootDir, 'timestamp.js');
let TIMESTAMP = require(timestampJs).Timestamp;

//------------------------------------------

describe('*** timestamp.js ***', () => {
  describe('Timestamp', () => {
    let t = TIMESTAMP.Timestamp();

    describe('Timestamp()', () => {
      it('Returns an object.', () => {
        let success = t != null && !(t === undefined);
        EXPECT(success).to.equal(true);
      });
    });

    describe('MilitaryStringToMeridiemString(militaryTime)', () => {
      it('Returns an error if militaryTime is invalid.', () => {
        let results = TIMESTAMP.MilitaryStringToMeridiemString('');
        EXPECT(results.error).to.not.equal(null);
      });

      it('Returns a meridiem time string if militaryTime is valid.', () => {
        let results = TIMESTAMP.MilitaryStringToMeridiemString(t.militaryTime.string);
        EXPECT(results.string).to.equal(t.meridiemTime.string);
      });
    });

    describe('MeridiemToMilitaryTime(meridiemTime)', () => {
      it('Returns an error if meridiemTime is invalid.', () => {
        let results = TIMESTAMP.MeridiemToMilitaryTime('');
        EXPECT(results.error).to.not.equal(null);
      });

      it('Returns a military time string if meridiemTime is valid.', () => {
        let results = TIMESTAMP.MeridiemToMilitaryTime(t.meridiemTime.string);
        EXPECT(results.string).to.equal(t.militaryTime.string);
      });
    });

    describe('Difference(d1, d2)', () => {
      let d1 = { year: 2018, month: 1, day: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 };
      let d2 = { year: 2018, month: 1, day: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 100 };
      let difference = 100;

      it('Returns an error if d1 or d2 is invalid.', () => {
        let results = TIMESTAMP.Difference(null, d2);
        EXPECT(results.error).to.not.equal(null);
      });

      it('Returns an error if d1 or d2 is invalid.', () => {
        let results = TIMESTAMP.Difference(d1, undefined);
        EXPECT(results.error).to.not.equal(null);
      });

      it('Returns number of milliseconds if d1 and d2 are valid.', () => {
        let results = TIMESTAMP.Difference(d1, d2);
        EXPECT(results.milliseconds).to.equal(difference);
      });
    });
  });
});