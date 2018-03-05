let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let pingJs = PATH.join(rootDir, 'ping.js');
let PING = require(pingJs);

let commandJs = PATH.join(rootDir, 'command.js');
let COMMAND = require(commandJs);

let hostJs = PATH.join(rootDir, 'host.js');
let HOST = require(hostJs);

//------------------------------------------

describe('*** ping.js ***', () => {
  let executor = COMMAND.LOCAL;
  let host = 'placeholder';

  describe('IsReachable(host, executor)', () => {
    it('Returns error if host is invalid.', () => {
      PING.IsReachable(null, executor).then(boolean => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      PING.IsReachable(host, null).then(boolean => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns a boolean value after ping completes.', () => {
      HOST.Info(executor).then(info => {
        PING.IsReachable(info.hostname, executor).then(boolean => {
          let isValid = boolean === false || boolean === true;
          EXPECT(isValid).to.equal(true);
        }).catch(error => EXPECT(false));
      }).catch(error => EXPECT(false));
    });
  });
});