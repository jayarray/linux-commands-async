let EXPECT = require('chai').expect;

let _path = require('path');
let rootDir = _path.join(__dirname, '..', '..');

let chownJs = _path.join(rootDir, 'chown.js');
let CHOWN = require(chownJs).Chown;

let mkdirJs = _path.join(rootDir, 'mkdir.js');
let MKDIR = require(mkdirJs).Mkdir;

let userinfoJs = _path.join(rootDir, 'userinfo.js');
let USERINFO = require(userinfoJs).UserInfo;

let adminJs = _path.join(rootDir, 'admin.js');
let ADMIN = require(adminJs).Admin;

let removeJs = _path.join(rootDir, 'remove.js');
let REMOVE = require(removeJs).Remove;

//------------------------------------------

describe('*** chown.js ***', () => {
  describe('Chown', () => {
    describe('Chown(path, uid, gid)', () => {
      let testDirPath = _path.join(rootDir, 'delete_this_test_dir');

      it('Returns error if path is invalid.', () => {
        CHOWN.Chown(undefined, 1000, 1000).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if path does not exist.', () => {
        CHOWN.Chown(testDirPath, 1000, 1000).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if uid is invalid.', () => {
        CHOWN.Chown(testDirPath, null, 1000).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if gid is invalid.', () => {
        CHOWN.Chown(testDirPath, 1000, null).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Actually changes permissions.', () => {
        MKDIR.Mkdirp(testDirPath).then(success => {
          USERINFO.CurrentUser().then(info => {
            let uid = info.uid;
            let gid = info.gid;
            let otherGid = info.groups.filter(group => group.gid != gid)[0].gid;

            CHOWN.Chown(testDirPath, uid, otherGid).then(success => {
              REMOVE.Directory(testDirPath).then(success => EXPECT(true))
                .catch(error => EXPECT(false));
            }).catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      });
    });
  });
});