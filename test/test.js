// MOCHA setup
let MOCHA = require('mocha');
let mocha = new MOCHA();
mocha.reporter('list').ui('bdd').ignoreLeaks();

//----------------------------------------------------
// DIRS
let PATH = require('path');
let rootDir = PATH.join(__dirname, '..');
let testDir = PATH.join(rootDir, 'test');
let testExecuteDir = PATH.join(testDir, 'execute');


// Add test files to run
mocha.addFile(PATH.join(testExecuteDir, 'test_execute.js'));


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