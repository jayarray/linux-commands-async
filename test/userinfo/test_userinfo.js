let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let userinfoJs = PATH.join(rootDir, 'userinfo.js');
let USERINFO = require(userinfoJs);

let commandJs = PATH.join(rootDir, 'command.js');
let COMMAND = require(commandJs);

//------------------------------------------

describe('*** userinfo.js ***', () => {
  let executor = COMMAND.LOCAL;

  describe('WhoAmI(executor)', () => {
    it('Returns an object.', () => {
      USERINFO.WhoAmI(executor).then(name => {
        let isValid = name != null && name !== undefined && name != '';
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('CurrentUser(executor)', () => {
    it('Returns an object.', () => {
      USERINFO.CurrentUser(executor).then(info => {
        let isValid = info !== undefined && info != null && info.username;
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('OtherUser(username, executor)', () => {
    it('Returns an error if username is invalid.', () => {
      USERINFO.OtherUser('idontexist', executor).then(info => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an object if username is valid.', () => {
      USERINFO.OtherUser('root', executor).then(info => {
        let isValid = info !== undefined && info != null && info.username;
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });
});