// MOCHA setup
let MOCHA = require('mocha');
let mocha = new MOCHA();
mocha.reporter('list').ui('bdd').ignoreLeaks();

//----------------------------------------------------
// DIRS
let PATH = require('path');
let rootDir = PATH.join(__dirname, '..');
let testDir = PATH.join(rootDir, 'test');

//----------------------------------------------------
// Add test files to run

/*
let testExecuteDir = PATH.join(testDir, 'execute');
mocha.addFile(PATH.join(testExecuteDir, 'test_execute.js'));*/

/*
let testTimestampDir = PATH.join(testDir, 'timestamp');
mocha.addFile(PATH.join(testTimestampDir, 'test_timestamp.js'));*/

/*
let testPathDir = PATH.join(testDir, 'path');
mocha.addFile(PATH.join(testPathDir, 'test_path.js'));*/

/*
let testListDir = PATH.join(testDir, 'list');
mocha.addFile(PATH.join(testListDir, 'test_list.js'));*/

/*
let testPermissionsDir = PATH.join(testDir, 'permissions');
mocha.addFile(PATH.join(testPermissionsDir, 'test_permissions.js'));*/

/*let testCopyDir = PATH.join(testDir, 'copy');
mocha.addFile(PATH.join(testCopyDir, 'test_copy.js'));*/

/*
let testRemoveDir = PATH.join(testDir, 'remove');
mocha.addFile(PATH.join(testRemoveDir, 'test_remove.js'));*/

/*
let testMkdirDir = PATH.join(testDir, 'mkdir');
mocha.addFile(PATH.join(testMkdirDir, 'test_mkdir.js'));*/

/*
let testMoveDir = PATH.join(testDir, 'move');
mocha.addFile(PATH.join(testMoveDir, 'test_move.js'));*/

/*
let testRsyncDir = PATH.join(testDir, 'rsync');
mocha.addFile(PATH.join(testRsyncDir, 'test_rsync.js'));*/

/*
let testAdminDir = PATH.join(testDir, 'admin');
mocha.addFile(PATH.join(testAdminDir, 'test_admin.js'));*/

/*
let testUserinfoDir = PATH.join(testDir, 'userinfo');
mocha.addFile(PATH.join(testUserinfoDir, 'test_userinfo.js'));*/

/*
let testChownDir = PATH.join(testDir, 'chown');
mocha.addFile(PATH.join(testChownDir, 'test_chown.js'));*/

/*
let testChmodDir = PATH.join(testDir, 'chmod');
mocha.addFile(PATH.join(testChmodDir, 'test_chmod.js'));*/

/*
let testRenameDir = PATH.join(testDir, 'rename');
mocha.addFile(PATH.join(testRenameDir, 'test_rename.js'));*/

/*
let testDiskusageDir = PATH.join(testDir, 'diskusage');
mocha.addFile(PATH.join(testDiskusageDir, 'test_diskusage.js'));*/

let testFileDir = PATH.join(testDir, 'file');
mocha.addFile(PATH.join(testFileDir, 'test_file.js'));

let runner = mocha.run(() => { });

//-------------------------------
// HELPER

function importTest(name, path) {
  describe(name, () => {
    require(path);
  });
}

//-------------------------------
// TESTS

//importTest('execute.js', PATH.join(rootDir, 'execute.js'));
//importTest('timestamp.js', PATH.join(rootDir, 'timestamp.js'));
//importTest('path.js', PATH.join(rootDir, 'path.js'));
//importTest('list.js', PATH.join(rootDir, 'list.js'));
//importTest('permissions.js', PATH.join(rootDir, 'permissions.js'));
//importTest('copy.js', PATH.join(rootDir, 'copy.js'));
//importTest('remove.js', PATH.join(rootDir, 'remove.js'));
//importTest('mkdir.js', PATH.join(rootDir, 'mkdir.js'));
//importTest('move.js', PATH.join(rootDir, 'move.js'));
//importTest('rsync.js', PATH.join(rootDir, 'rsync.js'));
//importTest('admin.js', PATH.join(rootDir, 'admin.js'));
//importTest('userinfo.js', PATH.join(rootDir, 'userinfo.js'));
//importTest('chown.js', PATH.join(rootDir, 'chown.js'));
//importTest('chmod.js', PATH.join(rootDir, 'chmod.js'));
//importTest('rename.js', PATH.join(rootDir, 'rename.js'));
//importTest('diskusage.js', PATH.join(rootDir, 'diskusage.js'));
importTest('file.js', PATH.join(rootDir, 'file.js'));