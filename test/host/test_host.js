let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let hostJs = PATH.join(rootDir, 'host.js');
let HOST = require(hostJs);

let commandJs = PATH.join(rootDir, 'command.js');
let COMMAND = require(commandJs);

//------------------------------------------

describe('*** host.js ***', () => {
  let executor = COMMAND.LOCAL;

  describe('Info(executor)', () => {
    let filepath = 'delete_me.txt';

    it('Returns an error if executor is invalid.', () => {
      HOST.Info(null).then(bool => EXPECT(false))
        .catch(error => EXPECT(true));
    });

    it('Returns an object with host info.', () => {
      HOST.Info(executor).then(info => {
        let isValid = info.hostname && info.ipaddress;
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });
});