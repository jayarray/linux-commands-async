let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let timestampJs = PATH.join(rootDir, 'timestamp.js');
let TIMESTAMP = require(timestampJs);

let commandJs = PATH.join(rootDir, 'command.js');
let COMMAND = require(commandJs);

//------------------------------------------

describe('*** timestamp.js ***', () => {
  let executor = COMMAND.LOCAL;

  describe('Now(executor)', () => {
    it('Returns an object.', () => {
      TIMESTAMP.Now(executor).then(o => {
        let success = o != null && o !== undefined && o.epoch;
        EXPECT(success).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('Compare(t1, t2)', () => {
    it('Returns an integer indicating whether t1 is less than, greater than, or equal to t2.', () => {
      TIMESTAMP.Now(executor).then(t1 => {
        TIMESTAMP.Now(executor).then(t2 => {
          let compareValue = TIMESTAMP.Compare(t1, t2);
          let success = compareValue == -1 || compareValue == 0 || compareValue == 1;
          EXPECT(success).to.equal(true);
        }).catch(error => EXPECT(false));
      }).catch(error => EXPECT(false));
    });
  });

  describe('EpochSecondsToTimestamp(seconds, executor)', () => {
    it('Returns an object.', () => {
      TIMESTAMP.Now(executor).then(t => {
        TIMESTAMP.EpochSecondsToTimestamp(t.epoch, executor).then(o => {
          let success = o != null && o !== undefined && o.epoch;
          EXPECT(success).to.equal(true);
        }).catch(error => EXPECT(false));
      }).catch(error => EXPECT(false));
    });
  });
});