let EXPECT = require('chai').expect;

let _path = require('path');
let rootDir = _path.join(__dirname, '..', '..');

let adminJs = _path.join(rootDir, 'admin.js');
let ADMIN = require(adminJs).Admin;

//------------------------------------------

describe('*** admin.js ***', () => {
  describe('Admin', () => {
    describe('Groups()', () => {
      it('Returns an array of objects.', () => {
        ADMIN.Groups().then(groups => {
          let isValid = Array.isArray(groups) && groups.length >= 1;
          EXPECT(isValid).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });

    describe('GroupExists(gid)', () => {
      it('Returns error if gid is invalid.', () => {
        ADMIN.GroupExists(null).then(exists => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns boolean if gid is valid.', () => {
        ADMIN.GroupExists('root').then(exists => {
          let isBoolean = exists === true || exists === false;
          EXPECT(isBoolean).to.equal(true);
        })
          .catch(error => EXPECT(error).to.not.equal(null));
      });
    });

    describe('Users()', () => {
      it('Returns an array of objects.', () => {
        ADMIN.Users().then(users => {
          let isValid = Array.isArray(users) && users.length >= 1;
          EXPECT(isValid).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });

    describe('UserExists(uid)', () => {
      it('Returns error if uid is invalid.', () => {
        ADMIN.UserExists(null).then(exists => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns boolean if gid is valid.', () => {
        ADMIN.UserExists('root').then(exists => {
          let isBoolean = exists === true || exists === false;
          EXPECT(isBoolean).to.equal(true);
        })
          .catch(error => EXPECT(error).to.not.equal(null));
      });
    });

    describe('Uptime()', () => {
      it('Returns an object.', () => {
        ADMIN.Uptime().then(obj => EXPECT(obj).to.not.equal(null))
          .catch(error => EXPECT(false));
      });
    });

    describe('Processes()', () => {
      it('Returns an array of objects.', () => {
        ADMIN.Processes().then(obj => {
          let isValid = Array.isArray(obj.processes) && obj.processes.length >= 1;
          EXPECT(isValid).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });

    describe('Kill(pid)', () => {
      it('Returns an error if pid is not defined.', () => {
        ADMIN.Kill(null).then(name => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an error if pid is not valid integer.', () => {
        ADMIN.Kill(-100).then(name => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });
    });

    describe('WhoAmI()', () => {
      it('Returns username as a string.', () => {
        ADMIN.WhoAmI().then(name => {
          let isValid = name && typeof name == 'string';
          EXPECT(isValid).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });

    describe('MemoryCheck()', () => {
      it('Returns an array of objects.', () => {
        ADMIN.MemoryCheck().then(objArray => {
          let isValid = Array.isArray(objArray) && objArray.length >= 2;
          EXPECT(isValid).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });

    describe('LoggedIn()', () => {
      it('Returns an array of objects.', () => {
        ADMIN.LoggedIn().then(objArray => {
          let isValid = Array.isArray(objArray) && objArray.length >= 0;
          EXPECT(isValid).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });
  });
});