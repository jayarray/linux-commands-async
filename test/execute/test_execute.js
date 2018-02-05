let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let executeJs = PATH.join(rootDir, 'execute.js');
let EXECUTE = require(executeJs);

//------------------------------------------

describe('*** execute.js ***', () => {
  describe('Error', () => {
    describe('NullOrUndefined(o)', () => {
      it(`Returns 'undefined' if o is undefined.`, () => {
        EXPECT(EXECUTE.Error.NullOrUndefined(undefined)).to.equal('undefined');
      });

      it(`Returns 'null' if o is null.`, () => {
        EXPECT(EXECUTE.Error.NullOrUndefined(null)).to.equal('null');
      });

      it('Returns null if o is defined.', () => {
        EXPECT(EXECUTE.Error.NullOrUndefined(1)).to.equal(null);
        EXPECT(EXECUTE.Error.NullOrUndefined('Hai')).to.equal(null);
        EXPECT(EXECUTE.Error.NullOrUndefined([])).to.equal(null);
      });
    });

    describe('StringError(s)', () => {
      it(`Returns 'undefined' if s is undefined.`, () => {
        EXPECT(EXECUTE.Error.StringError(undefined)).to.equal('undefined');
      });

      it(`Returns 'null' if s is null.`, () => {
        EXPECT(EXECUTE.Error.StringError(null)).to.equal('null');
      });

      it(`Returns 'not a string' if s is not string type.`, () => {
        EXPECT(EXECUTE.Error.StringError(1)).to.equal('not a string');
        EXPECT(EXECUTE.Error.StringError([])).to.equal('not a string');
        EXPECT(EXECUTE.Error.StringError(true)).to.equal('not a string');
      });

      it(`Returns 'empty' if s is empty.`, () => {
        EXPECT(EXECUTE.Error.StringError('')).to.equal('empty');
      });

      it(`Returns 'whitespace' if s is all whitespace.`, () => {
        EXPECT(EXECUTE.Error.StringError(' ')).to.equal('whitespace');
        EXPECT(EXECUTE.Error.StringError('\t')).to.equal('whitespace');
        EXPECT(EXECUTE.Error.StringError('\n  \t   ')).to.equal('whitespace');
      });

      it(`Returns null if s is valid.`, () => {
        EXPECT(EXECUTE.Error.StringError('hai')).to.equal(null);
        EXPECT(EXECUTE.Error.StringError('   hai')).to.equal(null);
        EXPECT(EXECUTE.Error.StringError('hai \t\n\t')).to.equal(null);
      });
    });

    describe('ArgsError(args)', () => {
      it(`Returns 'undefined' if args is undefined.`, () => {
        EXPECT(EXECUTE.Error.ArgsError(undefined)).to.equal('undefined');
      });

      it(`Returns 'null' if args is null.`, () => {
        EXPECT(EXECUTE.Error.ArgsError(null)).to.equal('null');
      });

      it(`Returns 'not an array' if args is not an array.`, () => {
        EXPECT(EXECUTE.Error.ArgsError(2)).to.equal('not an array');
        EXPECT(EXECUTE.Error.ArgsError('string')).to.equal('not an array');
      });

      it(`Returns null if args is valid.`, () => {
        EXPECT(EXECUTE.Error.ArgsError([])).to.equal(null);
        EXPECT(EXECUTE.Error.ArgsError([null, undefined])).to.equal(null);
        EXPECT(EXECUTE.Error.ArgsError([1, 2, 3])).to.equal(null);
        EXPECT(EXECUTE.Error.ArgsError([1, 'string', null])).to.equal(null);
      });
    });
  });

  describe('Execute', () => {
    describe('Local(cmd, args)', () => {
      let validCmd = 'echo';
      let invalidCmd = null;
      let validArgs = [1];
      let invalidArgs = null;

      describe('Cmd error check:', () => {
        it(`Invalid cmd gives error.`, () => {
          let invalidType = EXECUTE.Error.StringError(invalidCmd);
          EXECUTE.Execute.Local(invalidCmd, validArgs).then(o => EXPECT(false))
            .catch(error => EXPECT(error).to.equal(`cmd is ${invalidType}`));
        });

        it(`Valid cmd gives no error.`, () => {
          EXECUTE.Execute.Local(validCmd, validArgs).then(o => EXPECT(true))
            .catch(error => EXPECT(false));
        });
      });

      describe('Args error check', () => {
        it(`Invalid args gives error.`, () => {
          let invalidType = EXECUTE.Error.ArgsError(invalidArgs);
          EXECUTE.Execute.Local(validCmd, invalidArgs).then(o => EXPECT(false))
            .catch(error => EXPECT(error).to.equal(`args is ${invalidType}`));
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
          let invalidType = EXECUTE.Error.StringError(invalidUser);
          EXECUTE.Execute.Remote(invalidUser, validHost, validCmd).then(o => EXPECT(false))
            .catch(error => EXPECT(e.error).to.equal(`user is ${invalidType}`));
        });

        it(`Valid user gives no error.`, () => {
          EXECUTE.Execute.Remote(validUser, validHost, validCmd).then(o => EXPECT(true))
            .catch(error => EXPECT(false));
        });
      });

      describe('Host error check:', () => {
        it(`Invalid host gives error.`, () => {
          let invalidType = EXECUTE.Error.StringError(invalidHost);
          EXECUTE.Execute.Remote(validUser, invalidHost, validCmd).then(o => EXPECT(false))
            .catch(error => EXPECT(e.error).to.equal(`host is ${invalidType}`));
        });

        it(`Valid host gives no error.`, () => {
          EXECUTE.Execute.Remote(validUser, validHost, validCmd).then(o => EXPECT(true))
            .catch(error => EXPECT(false));
        });
      });

      describe('Cmd error check:', () => {
        it(`Invalid cmd gives error.`, () => {
          let invalidType = EXECUTE.Error.StringError(invalidCmd);
          EXECUTE.Execute.Remote(validUser, validHost, invalidCmd).then(o => EXPECT(false))
            .catch(error => EXPECT(e.error).to.equal(`cmd is ${invalidType}`));
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