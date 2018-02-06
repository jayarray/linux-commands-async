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

let testExecuteDir = PATH.join(testDir, 'execute');
mocha.addFile(PATH.join(testExecuteDir, 'test_execute.js'));

let testTimestampDir = PATH.join(testDir, 'timestamp');
mocha.addFile(PATH.join(testTimestampDir, 'test_timestamp.js'));

let testPathDir = PATH.join(testDir, 'path');
mocha.addFile(PATH.join(testPathDir, 'test_path.js'));


let testLsDir = PATH.join(testDir, 'ls');
mocha.addFile(PATH.join(testLsDir, 'test_ls.js'));

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

importTest('execute.js', PATH.join(__dirname, '..', 'execute.js'));
importTest('timestamp.js', PATH.join(__dirname, '..', 'timestamp.js'));
importTest('path.js', PATH.join(__dirname, '..', 'path.js'));
importTest('ls.js', PATH.join(__dirname, '..', 'ls.js'));