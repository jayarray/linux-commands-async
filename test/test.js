let MOCHA = require('mocha');
let mocha = new MOCHA();
mocha.reporter('list').ui('bdd').ignoreLeaks();
mocha.addFile('./execute.js');

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

importTest('execute.js', './execute.js');
console.log('\n');