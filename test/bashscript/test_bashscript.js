let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let bashscriptJs = PATH.join(rootDir, 'bashscript.js');
let BASHSCRIPT = require(bashscriptJs);

let fileJs = PATH.join(rootDir, 'file.js');
let FILE = require(fileJs);

let commandJs = PATH.join(rootDir, 'command.js');
let COMMAND = require(commandJs);

//------------------------------------------

describe('*** bashscript.js ***', () => {
  let executor = COMMAND.LOCAL;

  describe('BashScript', () => {
    let filepath = PATH.join(rootDir, 'delete_this_test_file.sh');
    let content = 'echo 1';

    describe('Create(path, content, executor)', () => {
      it('Returns error if path is invalid.', () => {
        BASHSCRIPT.Create(null, content, executor).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if content is invalid.', () => {
        BASHSCRIPT.Create(filepath, null, executor).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if executor is invalid.', () => {
        BASHSCRIPT.Create(filepath, content, null).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Creates a file.', () => {
        BASHSCRIPT.Create(filepath, content, executor).then(success => {
          File.Remove(filepath, executor).then(success => {
            EXPECT(true);
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      });
    });


    describe('Execute(path, content, executor)', () => {
      it('Returns error if path is invalid.', () => {
        BASHSCRIPT.Execute(null, content, executor).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if content is invalid.', () => {
        BASHSCRIPT.Execute(filepath, null, executor).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if executor is invalid.', () => {
        BASHSCRIPT.Execute(filepath, content, null).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Creates, executes, and removes file.', () => {
        BASHSCRIPT.Execute(filepath, content, executor).then(success => EXPECT(true))
          .catch(error => EXPECT(false));
      });
    });
  });
});