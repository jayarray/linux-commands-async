let EXPECT = require('chai').expect;

let _path = require('path');
let rootDir = _path.join(__dirname, '..', '..');

let userinfoJs = _path.join(rootDir, 'userinfo.js');
let USERINFO = require(userinfoJs).UserInfo;

//------------------------------------------

describe('*** userinfo.js ***', () => {
  describe('UserInfo', () => {
    describe('CurrentUser()', () => {
      it('Returns an object.', () => {
        USERINFO.CurrentUser().then(info => {
          EXPECT(info).to.not.equal(null);
        }).catch(error => EXPECT(false));
      });
    });

    describe('OtherUser(username)', () => {
      it('Returns an error if username is invalid.', () => {
        USERINFO.OtherUser('yourmom').then(info => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an object if username is valid.', () => {
        USERINFO.OtherUser('root').then(info => {
          EXPECT(info).to.not.equal(null);
        }).catch(error => EXPECT(false));
      });
    });
  });
});