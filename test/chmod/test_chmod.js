let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let chmodJs = PATH.join(rootDir, 'chmod.js');
let CHMOD = require(chmodJs);

let mkdirJs = PATH.join(rootDir, 'mkdir.js');
let MKDIR = require(mkdirJs);

let directoryJs = PATH.join(rootDir, 'directory.js');
let DIRECTORY = require(directoryJs);

let commandJs = PATH.join(rootDir, 'command.js');
let COMMAND = require(commandJs);

let permissionsJs = PATH.join(rootDir, 'permissions.js');
let PERMISSIONS = require(permissionsJs);

//------------------------------------------

describe('*** chmod.js ***', () => {
  let executor = COMMAND.LOCAL;
  let testDirPath = PATH.join(rootDir, 'delete_this_test_dir');
  let paths = [testDirPath];
  let isRecursive = false;

  describe('UsingPermString(permStr, paths, isRecursive, executor)', () => {
    let validPermString = 'r--------';
    let invalidPermString = 'rwxblah';

    it('Returns error if permStr is invalid.', () => {
      CHMOD.UsingPermString(invalidPermString, paths, isRecursive, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if paths is invalid.', () => {
      CHMOD.UsingPermString(validPermString, null, isRecursive, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      CHMOD.UsingPermString(validPermString, null, isRecursive, null).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Actually changes permissions.', () => {
      MKDIR.MakeDirectory(testDirPath, executor).then(success => {
        CHMOD.UsingPermString(validPermString, paths, isRecursive, executor).then(success => {
          PERMISSIONS.Permissions(testDirPath, executor).then(permsObj => {
            let success = validPermString == permsObj.permstr;
            DIRECTORY.Remove(testDirPath, executor).then(success => {
              EXPECT(success).to.equal(true);
            }).catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      }).catch(error => EXPECT(false));
    });
  });

  describe('UsingOctalString(octalStr, paths, isRecursive, executor)', () => {
    let validOctalStr = '777';
    let invalidOctalStr = '77A';

    it('Returns error if octalStr is invalid.', () => {
      CHMOD.UsingOctalString(invalidOctalStr, paths, isRecursive, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if paths is invalid.', () => {
      CHMOD.UsingOctalString(validOctalStr, null, isRecursive, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      CHMOD.UsingOctalString(validOctalStr, paths, isRecursive, null).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Actually changes permissions.', () => {
      MKDIR.MakeDirectory(testDirPath, executor).then(success => {
        CHMOD.UsingOctalString(validOctalStr, paths, isRecursive, executor).then(success => {
          PERMISSIONS.Permissions(testDirPath, executor).then(permsObj => {
            let success = validOctalStr == permsObj.octal.string;
            DIRECTORY.Remove(testDirPath, executor).then(success => {
              EXPECT(success).to.equal(true);
            }).catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      }).catch(error => EXPECT(false));
    });
  });

  describe('RemovePermissions(classes, types, paths, isRecursive, executor)', () => {
    let validClasses = 'ugo';
    let invalidClasses = 'abc';

    let validTypes = 'rwx';
    let invalidTypes = 'abc';

    let octalStr = '777';
    let expectedPermStr = '---------';

    it('Returns error if classes is invalid.', () => {
      CHMOD.RemovePermissions(invalidClasses, validTypes, paths, isRecursive, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if types is invalid.', () => {
      CHMOD.RemovePermissions(validClasses, invalidTypes, paths, isRecursive, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if paths is invalid.', () => {
      CHMOD.RemovePermissions(validClasses, validTypes, null, isRecursive, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      CHMOD.RemovePermissions(validClasses, validTypes, paths, isRecursive, null).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Actually changes permissions.', () => {
      MKDIR.MakeDirectory(testDirPath, executor).then(success => {
        CHMOD.UsingOctalString(octalStr, paths, isRecursive, executor).then(success => {
          CHMOD.RemovePermissions(validClasses, validTypes, paths, isRecursive, executor).then(success => {
            PERMISSIONS.Permissions(testDirPath, executor).then(permsObj => {
              let success = expectedPermStr == permsObj.string;
              DIRECTORY.Remove(testDirPath, executor).then(success => {
                EXPECT(success).to.equal(true);
              }).catch(error => EXPECT(false));
            }).catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      }).catch(error => EXPECT(false));
    });
  });

  describe('AddPermissions(classes, types, paths, isRecursive, executor)', () => {
    let validClasses = 'go';
    let invalidClasses = 'abc';

    let validTypes = 'rwx';
    let invalidTypes = 'abc';

    let octalStr = '700';
    let expectedPermStr = 'rwxrwxrwx';

    it('Returns error if classes is invalid.', () => {
      CHMOD.AddPermissions(invalidClasses, validTypes, paths, isRecursive, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if types is invalid.', () => {
      CHMOD.AddPermissions(validClasses, invalidTypes, paths, isRecursive, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if paths is invalid.', () => {
      CHMOD.AddPermissions(validClasses, validTypes, null, isRecursive, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      CHMOD.AddPermissions(validClasses, validTypes, paths, isRecursive, null).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Actually changes permissions.', () => {
      MKDIR.MakeDirectory(testDirPath, executor).then(success => {
        CHMOD.UsingOctalString(octalStr, paths, isRecursive, executor).then(success => {
          CHMOD.AddPermissions(validClasses, validTypes, paths, isRecursive, executor).then(success => {
            PERMISSIONS.Permissions(testDirPath, executor).then(permsObj => {
              let success = expectedPermStr == permsObj.string;
              DIRECTORY.Remove(testDirPath, executor).then(success => {
                EXPECT(success).to.equal(true);
              }).catch(error => EXPECT(false));
            }).catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      }).catch(error => EXPECT(false));
    });
  });

  describe('SetPermissions(classes, types, paths, isRecursive, executor)', () => {
    let validClasses = 'ugo';
    let invalidClasses = 'abc';

    let validTypes = 'r';
    let invalidTypes = 'abc';

    let expectedPermStr = 'r--r--r--';

    it('Returns error if classes is invalid.', () => {
      CHMOD.SetPermissions(invalidClasses, validTypes, paths, isRecursive, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if types is invalid.', () => {
      CHMOD.SetPermissions(validClasses, invalidTypes, paths, isRecursive, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if paths is invalid.', () => {
      CHMOD.SetPermissions(validClasses, validTypes, null, isRecursive, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      CHMOD.SetPermissions(validClasses, validTypes, paths, isRecursive, null).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Actually changes permissions.', () => {
      MKDIR.MakeDirectory(testDirPath, executor).then(success => {
        CHMOD.SetPermissions(validClasses, validTypes, paths, isRecursive, executor).then(success => {
          PERMISSIONS.Permissions(testDirPath, executor).then(permsObj => {
            let success = expectedPermStr == permsObj.string;
            DIRECTORY.Remove(testDirPath, executor).then(success => {
              EXPECT(success).to.equal(true);
            }).catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      }).catch(error => EXPECT(false));
    });
  });

  describe('Manual(args, executor)', () => {
    let validArgs = ['a=x', testDirPath];
    let invalidArgs = [0, { o: 'blah' }, [1, 2, 3]];

    let expectedPermStr = '--x--x--x';

    it('Returns error if args is invalid.', () => {
      CHMOD.Manual(invalidArgs, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      CHMOD.Manual(validArgs, null).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Actually changes permissions.', () => {
      MKDIR.MakeDirectory(testDirPath, executor).then(success => {
        CHMOD.Manual(validArgs, executor).then(success => {
          PERMISSIONS.Permissions(testDirPath, executor).then(permsObj => {
            let success = expectedPermStr == permsObj.string;
            DIRECTORY.Remove(testDirPath, executor).then(success => {
              EXPECT(success).to.equal(true);
            }).catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      }).catch(error => EXPECT(false));
    });
  });
});