let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let rsyncJs = PATH.join(rootDir, 'rsync.js');
let RSYNC = require(rsyncJs);

let commandJs = PATH.join(rootDir, 'command.js');
let COMMAND = require(commandJs);

//------------------------------------------

describe('*** rsync.js ***', () => {
  let executor = COMMAND.LOCAL;
  let user = 'user';
  let host = 'host';
  let src = '/path/to/src';
  let dest = '/path/to/dest';

  let args = ['-a', `${user}@${host}:${dest}`];

  describe('Rsync(user, host, src, dest, executor)', () => {
    it('Returns an error if user is invalid.', () => {
      RSYNC.Rsync(null, host, src, dest, executor).then(output => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an error if host is invalid.', () => {
      RSYNC.Rsync(user, null, src, dest, executor).then(output => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an error if src is invalid.', () => {
      RSYNC.Rsync(user, host, null, dest, executor).then(output => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an error if dest is invalid.', () => {
      RSYNC.Rsync(user, host, src, null, executor).then(output => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an error if executor is invalid.', () => {
      RSYNC.Rsync(user, host, src, dest, null).then(output => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });
  });

  describe('Update(user, host, src, dest, executor)', () => {
    it('Returns an error if user is invalid.', () => {
      RSYNC.Update(null, host, src, dest, executor).then(output => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an error if host is invalid.', () => {
      RSYNC.Update(user, null, src, dest, executor).then(output => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an error if src is invalid.', () => {
      RSYNC.Update(user, host, null, dest, executor).then(output => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an error if dest is invalid.', () => {
      RSYNC.Update(user, host, src, null, executor).then(output => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an error if executor is invalid.', () => {
      RSYNC.Update(user, host, src, dest, null).then(output => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });
  });

  describe('Match(user, host, src, dest, executor)', () => {
    it('Returns an error if user is invalid.', () => {
      RSYNC.Match(null, host, src, dest, executor).then(output => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an error if host is invalid.', () => {
      RSYNC.Match(user, null, src, dest, executor).then(output => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an error if src is invalid.', () => {
      RSYNC.Match(user, host, null, dest, executor).then(output => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an error if dest is invalid.', () => {
      RSYNC.Match(user, host, src, null, executor).then(output => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an error if executor is invalid.', () => {
      RSYNC.Match(user, host, src, dest, null).then(output => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });
  });

  describe('DryRun(args, executor)', () => {
    it('Returns an error if args is invalid.', () => {
      RSYNC.DryRun(null, executor).then(output => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an error if executor is invalid.', () => {
      RSYNC.DryRun(args, null).then(output => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });
  });
});