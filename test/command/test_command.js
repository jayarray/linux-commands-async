let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let commandJs = PATH.join(rootDir, 'command.js');
let COMMAND = require(commandJs);

//------------------------------------------

describe('*** command.js ***', () => {
  let cmd = 'echo';
  let args = [1];
  let cmdStr = 'echo 1';

  describe('LocalCommand', () => {
    describe('Execute(cmd, args)', () => {
      it(`Returns error if cmd is null.`, () => {
        COMMAND.LOCAL.Execute(null, args).then(o => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it(`Returns error if cmd is undefined.`, () => {
        COMMAND.LOCAL.Execute(undefined, args).then(o => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it(`Returns error if args is null.`, () => {
        COMMAND.LOCAL.Execute(cmd, null).then(o => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it(`Returns error if args is undefined.`, () => {
        COMMAND.LOCAL.Execute(cmd, undefined).then(o => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it(`Returns error if args is not an array.`, () => {
        COMMAND.LOCAL.Execute(cmd, 4).then(o => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it(`Returns an object if cmd and args are valid.`, () => {
        COMMAND.LOCAL.Execute(cmd, args).then(o => {
          let success = o.stderr && o.stdout && o.exitCode;
          EXPECT(success).to.equal(true);
        }).catch(error => EXPECT(false));
      });

      it(`Returns an object if cmdStr and args are valid (args is empty)`, () => {
        COMMAND.LOCAL.Execute(cmdStr, []).then(o => {
          let success = o.stderr && o.stdout && o.exitCode;
          EXPECT(success).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });
  });

  describe('RemoteCommand', () => {
    let user = 'user';
    let host = 'host';
    let remoteCommand = null;

    describe('Create(user, host)', () => {
      it('Returns error if user is invalid.', () => {
        COMMAND.CreateRemoteCommand(null, host).then(o => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if host is invalid.', () => {
        COMMAND.CreateRemoteCommand(user, '  ').then(o => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an object if user and host are valid.', () => {
        COMMAND.CreateRemoteCommand(user, host).then(o => {
          remoteCommand = o;
        }).catch(error => EXPECT(error).to.not.equal(null));
      });
    });

    describe('Execute(user, host)', () => {
      it(`Returns error if cmd is null.`, () => {
        remoteCommand.Execute(null, args).then(o => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it(`Returns error if cmd is undefined.`, () => {
        remoteCommand.Execute(undefined, args).then(o => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it(`Returns error if args is null.`, () => {
        remoteCommand.Execute(cmd, null).then(o => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it(`Returns error if args is undefined.`, () => {
        COMMAND.LOCAL.Execute(cmd, undefined).then(o => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it(`Returns error if args is not an array.`, () => {
        remoteCommand.Execute(cmd, 4).then(o => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it(`Returns an object if cmd and args are valid.`, () => {
        remoteCommand.Execute(cmd, args).then(o => {
          let success = o.stderr && o.stdout && o.exitCode;
          EXPECT(success).to.equal(true);
        }).catch(error => EXPECT(false));
      });

      it(`Returns an object if cmdStr and args are valid (args is empty)`, () => {
        remoteCommand.Execute(cmdStr, []).then(o => {
          let success = o.stderr && o.stdout && o.exitCode;
          EXPECT(success).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });
  });
});