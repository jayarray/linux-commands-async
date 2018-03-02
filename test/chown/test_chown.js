let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let chownJs = PATH.join(rootDir, 'chown.js');
let CHOWN = require(chownJs);

let mkdirJs = PATH.join(rootDir, 'mkdir.js');
let MKDIR = require(mkdirJs);

let directoryJs = PATH.join(rootDir, 'directory.js');
let DIRECTORY = require(directoryJs);

let adminJs = PATH.join(rootDir, 'admin.js');
let ADMIN = require(adminJs);

let userinfoJs = PATH.join(rootDir, 'userinfo.js');
let USERINFO = require(userinfoJs);

let removeJs = PATH.join(rootDir, 'remove.js');
let REMOVE = require(removeJs);

let commandJs = PATH.join(rootDir, 'command.js');
let COMMAND = require(commandJs);

let permissionsJs = PATH.join(rootDir, 'permissions.js');
let PERMISSIONS = require(permissionsJs);

//------------------------------------------

describe('*** chown.js ***', () => {
  let testDirPath = PATH.join(rootDir, 'delete_this_test_dir');
  let paths = [testDirPath];
  let newOwnerId = 1;
  let newGroupId = 1;
  let isRecursive = false;
  let executor = COMMAND.LOCAL;

  describe('ChangeOwner(paths, newOwnerId, isRecursive, executor)', () => {
    it('Returns error if paths is invalid.', () => {
      CHOWN.ChangeOwner(null, newOwnerId, isRecursive, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if newOwnerId is invalid.', () => {
      CHOWN.ChangeOwner(paths, null, isRecursive, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      CHOWN.ChangeOwner(paths, newOwnerId, isRecursive, null).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Actually changes owner.', () => {
      USERINFO.CurrentUser(executor).then(info => {
        let username = info.username;
        CHOWN.ChangeOwner(paths, username, isRecursive, executor).then(success => {
          PERMISSION.Permissions(testDirPath, executor).then(permsObj => {
            let successful = username == permsObj.owner;
            DIRECTORY.Remove(testDirPath, executor).then(success => {
              EXPECT(successful).to.equal(true);
            }).catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      }).catch(error => EXPECT(false));
    });
  });

  describe('ChangeGroup(paths, newGroupId, isRecursive, executor)', () => {
    it('Returns error if paths is invalid.', () => {
      CHOWN.ChangeOwner(null, newGroupId, isRecursive, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if newGroupId is invalid.', () => {
      CHOWN.ChangeOwner(paths, null, isRecursive, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      CHOWN.ChangeOwner(paths, newGroupId, isRecursive, null).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Actually changes group.', () => {
      USERINFO.CurrentUser(executor).then(info => {
        let groupId = info.groups[0].groupName;
        CHOWN.ChangeGroup(paths, groupId, isRecursive, executor).then(success => {
          PERMISSION.Permissions(testDirPath, executor).then(permsObj => {
            let successful = groupId == permsObj.group;
            DIRECTORY.Remove(testDirPath, executor).then(success => {
              EXPECT(successful).to.equal(true);
            }).catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      }).catch(error => EXPECT(false));
    });
  });

  describe('ChangeOwnerAndGroup(paths, newOwnerId, newGroupId, isRecursive, executor)', () => {
    it('Returns error if paths is invalid.', () => {
      CHOWN.ChangeOwner(null, newOwnerId, newGroupId, isRecursive, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if newOwnerId is invalid.', () => {
      CHOWN.ChangeOwner(paths, null, newGroupId, isRecursive, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if newGroupId is invalid.', () => {
      CHOWN.ChangeOwner(paths, newOwnerId, null, isRecursive, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      CHOWN.ChangeOwner(paths, newOwnerId, newGroupId, isRecursive, null).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Actually changes owner and group.', () => {
      USERINFO.CurrentUser(executor).then(info => {
        let groupName = info.groups[0].groupName;
        let username = info.username;
        CHOWN.ChangeGroup(paths, username, groupId, isRecursive, executor).then(success => {
          PERMISSION.Permissions(testDirPath, executor).then(permsObj => {
            let successful = groupName == permsObj.group && username == permsObj.owner;
            DIRECTORY.Remove(testDirPath, executor).then(success => {
              EXPECT(successful).to.equal(true);
            }).catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      }).catch(error => EXPECT(false));
    });
  });

  describe('Manual(args, executor)', () => {
    it('Returns error if args is invalid.', () => {
      CHOWN.ChangeOwner(null, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      CHOWN.ChangeOwner(paths, newOwnerId, newGroupId, isRecursive, null).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Actually changes owner and group.', () => {
      USERINFO.CurrentUser(executor).then(info => {
        let username = info.username;
        let args = [username, testDirPath];
        CHOWN.Manual(args, executor).then(success => {
          PERMISSION.Permissions(testDirPath, executor).then(permsObj => {
            let successful = username == permsObj.owner;
            DIRECTORY.Remove(testDirPath, executor).then(success => {
              EXPECT(successful).to.equal(true);
            }).catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      }).catch(error => EXPECT(false));
    });
  });
});