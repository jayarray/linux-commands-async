let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let bashscriptJs = PATH.join(rootDir, 'bashscript.js');
let BASHSCRIPT = require(bashscriptJs).BashScript;

let fileJs = PATH.join(rootDir, 'file.js');
let FILE = require(fileJs).File;

//------------------------------------------

describe('*** bashscript.js ***', () => {
  describe('BashScript', () => {
    let filepath = PATH.join(rootDir, 'delete_this_test_file.sh');
    let content = 'echo 1';

    describe('Create(path, content)', () => {
      it('Returns error if path is invalid.', () => {
        BASHSCRIPT.Create(null, content).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if content is invalid.', () => {
        BASHSCRIPT.Create(filepath, null).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Actually creates a file.', () => {
        BASHSCRIPT.Create(filepath, content).then(success => EXPECT(true))
          .catch(error => EXPECT(false));
      });
    });

    describe('Execute(path, content)', () => {
      it('Returns error if path is invalid.', () => {
        BASHSCRIPT.Execute(null, content).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if content is invalid.', () => {
        BASHSCRIPT.Execute(filepath, null).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Creates bash script, executes it, and cleans it up.', () => {
        BASHSCRIPT.Execute(filepath, content).then(output => EXPECT(true))
          .catch(error => EXPECT(false));
      });
    });
  });
});