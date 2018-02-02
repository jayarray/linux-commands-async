let EXPECT = require('chai').expect;
let PATH = require('path');
let EXECUTE = require(PATH.join(__dirname, '..', 'execute.js'));

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
        EXPECT(EXECUTE.Error.ArgsError(undefined)).to.equal('undefined');
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
      describe('Cmd error check:', () => {
        let validArgs = [];

        it(`Invalid cmd gives error.`, () => {
          let invalidCmd = null;
          let invalidType = EXECUTE.Error.StringError(invalidCmd);
          EXECUTE.Execute.Local(invalidCmd, validArgs).then(o => {
            EXPECT(o.error).not.equal(null);
          }).catch((e) => {
            EXPECT(e.error).to.equal(`cmd is ${invalidType}`); // ERROR EXPECTED
          });
        });

        it(`Valid cmd gives no error.`, () => {
          let validCmd = 'ls';
          EXECUTE.Execute.Local(validCmd, validArgs).then(o => {
            EXPECT(o.error).to.equal(null);
          }).catch((e) => {
            EXPECT(e.error).not.equal(null);
          });
        });
      });

      describe('Args error check', () => {
        let validCmd = 'ls';

        it(`Invalid args gives error.`, () => {
          let invalidArgs = null;
          let invalidType = EXECUTE.Error.ArgsError(invalidArgs);
          EXECUTE.Execute.Local(validCmd, invalidArgs).then(o => {
            EXPECT(o.error).not.equal(null);
          }).catch((e) => {
            EXPECT(e.error).to.equal(`args is ${invalidType}`); // ERROR EXPECTED
          });
        });

        it(`Valid args gives no error.`, () => {
          let validArgs = ['-l', '/path/to/file'];
          EXECUTE.Execute.Local(validCmd, validArgs).then(o => {
            EXPECT(o.error).to.equal(null);
          }).catch((e) => {
            EXPECT(e.error).to.equal(null); // NO ERROR EXPECTED
          });
        });
      });
    });

    describe('Remote(user, host, cmd)', () => {
      let validUser = 'user';
      let invalidUser = '';
      let validHost = 'host';
      let invalidHost = '';
      let validCmd = 'ls -l';
      let invalidCmd = '';

      describe('User error check:', () => {
        it(`Invalid user gives error.`, () => {
          let invalidType = EXECUTE.Error.StringError(invalidUser);
          EXECUTE.Execute.Local(invalidUser, validHost, validCmd).then(o => {
            EXPECT(o.error).not.equal(null);
          }).catch((e) => {
            EXPECT(e.error).to.equal(`user is ${invalidType}`); // ERROR EXPECTED
          });
        });

        it(`Valid user gives no error.`, () => {
          EXECUTE.Execute.Local(validUser, validHost, validCmd).then(o => {
            EXPECT(o.error).to.equal(null);
          }).catch((e) => {
            EXPECT(e.error).to.equal(null); // NO ERROR EXPECTED
          });
        });
      });

      describe('Host error check:', () => {
        it(`Invalid host gives error.`, () => {
          let invalidType = EXECUTE.Error.StringError(invalidUser);
          EXECUTE.Execute.Local(validUser, invalidHost, validCmd).then(o => {
            EXPECT(o.error).not.equal(null);
          }).catch((e) => {
            EXPECT(e.error).to.equal(`host is ${invalidType}`); // ERROR EXPECTED
          });
        });

        it(`Valid host gives no error.`, () => {
          EXECUTE.Execute.Local(validUser, validHost, validCmd).then(o => {
            EXPECT(o.error).to.equal(null);
          }).catch((e) => {
            EXPECT(e.error).to.equal(null); // NO ERROR EXPECTED
          });
        });
      });

      describe('Cmd error check:', () => {
        it(`Invalid cmd gives error.`, () => {
          let invalidType = EXECUTE.Error.StringError(invalidCmd);
          EXECUTE.Execute.Local(validUser, validHost, invalidCmd).then(o => {
            EXPECT(o.error).not.equal(null);
          }).catch((e) => {
            EXPECT(e.error).to.equal(`cmd is ${invalidType}`); // ERROR EXPECTED
          });
        });

        it(`Valid cmd gives no error.`, () => {
          EXECUTE.Execute.Local(validUser, validHost, validCmd).then(o => {
            EXPECT(o.error).to.equal(null);
          }).catch((e) => {
            EXPECT(e.error).to.equal(null); // NO ERROR EXPECTED
          });
        });
      });
    });
  });
});