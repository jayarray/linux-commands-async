let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let executeJs = PATH.join(rootDir, 'execute.js');
let EXECUTE = require(executeJs);

//------------------------------------------

describe('*** execute.js ***', () => {
  describe('Execute', () => {
    describe('Local(cmd, args)', () => {
      let validCmd = 'echo';
      let invalidCmd = null;
      let validArgs = [1];
      let invalidArgs = null;

      describe('Cmd error check:', () => {
        it(`Invalid cmd gives error.`, () => {
          EXECUTE.Execute.Local(invalidCmd, validArgs).then(o => EXPECT(false))
            .catch(error => EXPECT(error).to.equal(`cmd is null`));
        });

        it(`Valid cmd gives no error.`, () => {
          EXECUTE.Execute.Local(validCmd, validArgs).then(o => EXPECT(true))
            .catch(error => EXPECT(false));
        });
      });

      describe('Args error check', () => {
        it(`Invalid args gives error.`, () => {
          EXECUTE.Execute.Local(validCmd, null).then(o => EXPECT(false))
            .catch(error => EXPECT(error).to.equal(`args is null`));
        });

        it(`Valid args gives no error.`, () => {
          EXECUTE.Execute.Local(validCmd, validArgs).then(o => EXPECT(true))
            .catch(error => EXPECT(false));
        });
      });

      describe('Returns expected object', () => {
        it(`Contains variables: stderr, stdout, exitCode.`, () => {
          EXECUTE.Execute.Local(validCmd, validArgs).then(o => {
            let containsAllVariables = !(o.stderr === undefined) && !(o.stdout === undefined) && !(o.exitCode === undefined);
            EXPECT(containsAllVariables).to.equal(true);
          }).catch(error => EXPECT(false));
        });
      });
    });

    describe('Remote(user, host, cmd)', () => {
      let validUser = 'user';
      let invalidUser = '';
      let validHost = 'host';
      let invalidHost = '';
      let validCmd = 'echo 1';
      let invalidCmd = '';

      describe('User error check:', () => {
        it(`Invalid user gives error.`, () => {
          EXECUTE.Execute.Remote(invalidUser, validHost, validCmd).then(o => EXPECT(false))
            .catch(error => EXPECT(error).to.equal(`user is empty`));
        });

        it(`Valid user gives no error.`, () => {
          EXECUTE.Execute.Remote(validUser, validHost, validCmd).then(o => EXPECT(true))
            .catch(error => EXPECT(false));
        });
      });

      describe('Host error check:', () => {
        it(`Invalid host gives error.`, () => {
          EXECUTE.Execute.Remote(validUser, invalidHost, validCmd).then(o => EXPECT(false))
            .catch(error => EXPECT(error).to.equal(`host is empty`));
        });

        it(`Valid host gives no error.`, () => {
          EXECUTE.Execute.Remote(validUser, validHost, validCmd).then(o => EXPECT(true))
            .catch(error => EXPECT(false));
        });
      });

      describe('Cmd error check:', () => {
        it(`Invalid cmd gives error.`, () => {
          EXECUTE.Execute.Remote(validUser, validHost, invalidCmd).then(o => EXPECT(false))
            .catch(error => EXPECT(error).to.equal(`cmd is empty`));
        });

        it(`Valid cmd gives no error.`, () => {
          EXECUTE.Execute.Remote(validUser, validHost, validCmd).then(o => EXPECT(o.error).to.equal(null))
            .catch(error => EXPECT(false));
        });
      });

      describe('Returns expected object', () => {
        it(`Contains variables: stderr, stdout, exitCode.`, () => {
          EXECUTE.Execute.Remote(validUser, validHost, validCmd).then(o => {
            let containsAllVariables = !(o.stderr === undefined) && !(o.stdout === undefined) && !(o.exitCode === undefined);
            EXPECT(containsAllVariables).to.equal(true);
          }).catch(error => EXPECT(error).to.equal(null));
        });
      });
    });
  });
});