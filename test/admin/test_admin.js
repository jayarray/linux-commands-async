let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let adminJs = PATH.join(rootDir, 'admin.js');
let ADMIN = require(adminJs);

let commandJs = PATH.join(rootDir, 'command.js');
let COMMAND = require(commandJs);

//------------------------------------------

describe('*** admin.js ***', () => {
  let executor = COMMAND.LOCAL;

  describe('Groups(executor)', () => {
    it('Returns error if executor is invalid.', () => {
      ADMIN.Groups(null).then(groups => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an array of objects if executor is valid.', () => {
      ADMIN.Groups(executor).then(groups => {
        let isValid = Array.isArray(groups) && groups.length >= 1;
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('GetGroup(gid, executor)', () => {
    let gid = 0;

    it('Returns error if gid is invalid.', () => {
      ADMIN.GetGroup(null, executor).then(group => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      ADMIN.GetGroup(gid, null).then(group => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns obj if gid and executor are valid.', () => {
      ADMIN.GetGroup(gid, executor).then(group => EXPECT(group).to.not.equal(null))
        .catch(error => EXPECT(false));
    });
  });

  describe('Users(executor)', () => {
    it('Returns error if executor is invalid.', () => {
      ADMIN.Users(null).then(users => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an array of objects if executor is valid.', () => {
      ADMIN.Users(executor).then(users => {
        let isValid = Array.isArray(users) && users.length >= 1;
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('GetUser(uid, executor)', () => {
    let uid = 0;

    it('Returns error if uid is invalid.', () => {
      ADMIN.GetUser(null, executor).then(user => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      ADMIN.GetUser(uid, null).then(user => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns obj if uid and executor are valid.', () => {
      ADMIN.GetUser(uid, executor).then(user => EXPECT(group).to.not.equal(null))
        .catch(error => EXPECT(false));
    });
  });

  describe('Uptime(executor)', () => {
    it('Returns error if executor is invalid.', () => {
      ADMIN.Uptime(null).then(o => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an object if executor is valid.', () => {
      ADMIN.Uptime(executor).then(o => EXPECT(o).to.not.equal(null))
        .catch(error => EXPECT(false));
    });
  });

  describe('Processes(executor)', () => {
    it('Returns error if executor is invalid.', () => {
      ADMIN.Processes(null).then(arr => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an array of objects if executor is valid.', () => {
      ADMIN.Processes(executor).then(arr => EXPECT(o).to.not.equal(null))
        .catch(error => EXPECT(false));
    });
  });

  describe('GetProcess(pid, executor)', () => {
    let pid = 0;

    it('Returns error if pid is invalid.', () => {
      ADMIN.GetProcess(null, executor).then(user => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      ADMIN.GetProcess(pid, null).then(user => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns obj if pid and executor are valid.', () => {
      ADMIN.GetProcess(pid, executor).then(user => EXPECT(group).to.not.equal(null))
        .catch(error => EXPECT(false));
    });
  });

  describe('Kill(pid, executor)', () => {
    let pid = 0;

    it('Returns error if pid is invalid.', () => {
      ADMIN.Kill(null, executor).then(user => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      ADMIN.Kill(pid, null).then(user => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });
  });

  describe('MemoryCheck(executor)', () => {
    it('Returns error if executor is invalid.', () => {
      ADMIN.MemoryCheck(null).then(arr => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an array of objects if executor is valid.', () => {
      ADMIN.MemoryCheck(executor).then(arr => {
        let isValid = Array.isArray(arr) && arr.length >= 1;
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('TopProcesses(executor)', () => {
    it('Returns error if executor is invalid.', () => {
      ADMIN.TopProcesses(null).then(arr => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an array of objects if executor is valid.', () => {
      ADMIN.TopProcesses(executor).then(arr => {
        let isValid = Array.isArray(arr) && arr.length >= 1;
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('WhoIsLoggedIn(executor)', () => {
    it('Returns error if executor is invalid.', () => {
      ADMIN.WhoIsLoggedIn(null).then(arr => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an array of objects if executor is valid.', () => {
      ADMIN.WhoIsLoggedIn(executor).then(arr => {
        let isValid = Array.isArray(arr) && arr.length >= 1;
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('ListOpenFilesByUser(user, executor)', () => {
    let user = 'root';

    it('Returns error if user is invalid.', () => {
      ADMIN.ListOpenFilesByUser(null, executor).then(arr => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      ADMIN.ListOpenFilesByUser(user, null).then(arr => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an array of objects if user and executor are valid.', () => {
      ADMIN.ListOpenFilesByUser(user, executor).then(arr => {
        let isValid = Array.isArray(arr) && arr.length >= 1;
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('UserHasRootPermissions(uid, executor)', () => {
    let uid = 0;

    it('Returns error if uid is invalid.', () => {
      ADMIN.UserHasRootPermissions(null, executor).then(o => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      ADMIN.UserHasRootPermissions(uid, null).then(o => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns boolean if uid and executor are valid.', () => {
      ADMIN.UserHasRootPermissions(uid, executor).then(o => {
        let isValid = o === true || o === false;
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('UserCanChangeGroupOwnership(uid, desiredGid, executor)', () => {
    let uid = 0;
    let desiredGid = 1;

    it('Returns error if uid is invalid.', () => {
      ADMIN.UserCanChangeGroupOwnership(null, desiredGid, executor).then(o => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if desiredGid is invalid.', () => {
      ADMIN.UserCanChangeGroupOwnership(uid, null, executor).then(o => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      ADMIN.UserCanChangeGroupOwnership(uid, desiredGid, null).then(o => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns boolean if uid, desiredGid, and executor are valid.', () => {
      ADMIN.UserCanChangeGroupOwnership(uid, desiredGid, executor).then(o => {
        let isValid = o === true || o === false;
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('UserCanChangeUserOwnership(uid, executor)', () => {
    let uid = 0;

    it('Returns error if uid is invalid.', () => {
      ADMIN.UserCanChangeUserOwnership(null, executor).then(o => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      ADMIN.UserCanChangeUserOwnership(uid, null).then(o => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns boolean if uid and executor are valid.', () => {
      ADMIN.UserCanChangeUserOwnership(uid, executor).then(o => {
        let isValid = o === true || o === false;
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });
});