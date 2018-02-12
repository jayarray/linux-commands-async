let EXPECT = require('chai').expect;

let _path = require('path');
let rootDir = _path.join(__dirname, '..', '..');

let rsyncJs = _path.join(rootDir, 'rsync.js');
let RSYNC = require(rsyncJs).Rsync;

let FS = require('fs-extra');

//------------------------------------------

describe('*** rsync.js ***', () => {
  describe('Rsync', () => {
    let user = 'user';
    let host = 'host';
    let src = '/path/to/src';
    let dest = '/path/to/dest';

    let flags = ['a', 'v'];
    let options = ['--size-only'];

    describe('Rsync(user, host, src, dest)', () => {
      it('Returns an error if user is invalid.', () => {
        RSYNC.Rsync(null, host, src, dest).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an error if host is invalid.', () => {
        RSYNC.Rsync(user, undefined, src, dest).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an error if src is invalid.', () => {
        RSYNC.Rsync(user, host, '', dest).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an error if dest is invalid.', () => {
        RSYNC.Rsync(user, host, src, 3).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });
    });

    describe('Update(user, host, src, dest)', () => {
      it('Returns an error if user is invalid.', () => {
        RSYNC.Update(null, host, src, dest).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an error if host is invalid.', () => {
        RSYNC.Update(user, undefined, src, dest).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an error if src is invalid.', () => {
        RSYNC.Update(user, host, '', dest).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an error if dest is invalid.', () => {
        RSYNC.Update(user, host, src, 3).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });
    });

    describe('Match(user, host, src, dest)', () => {
      it('Returns an error if user is invalid.', () => {
        RSYNC.Match(null, host, src, dest).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an error if host is invalid.', () => {
        RSYNC.Match(user, undefined, src, dest).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an error if src is invalid.', () => {
        RSYNC.Match(user, host, '', dest).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an error if dest is invalid.', () => {
        RSYNC.Match(user, host, src, 3).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });
    });

    describe('Manual(user, host, src, dest, flags, options)', () => {
      it('Returns an error if user is invalid.', () => {
        RSYNC.Manual(null, host, src, dest, flags, options).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an error if host is invalid.', () => {
        RSYNC.Manual(user, undefined, src, dest, flags, options).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an error if src is invalid.', () => {
        RSYNC.Manual(user, host, '', dest, flags, options).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an error if dest is invalid.', () => {
        RSYNC.Manual(user, host, src, 3, flags, options).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an error if flags is invalid.', () => {
        RSYNC.Manual(user, host, src, dest, null, options).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an error if options is invalid.', () => {
        RSYNC.Manual(user, host, src, dest, flags, null).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });
    });

    describe('DryRun(user, host, src, dest)', () => {
      it('Returns an error if user is invalid.', () => {
        RSYNC.DryRun(null, host, src, dest, flags, options).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an error if host is invalid.', () => {
        RSYNC.DryRun(user, undefined, src, dest, flags, options).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an error if src is invalid.', () => {
        RSYNC.DryRun(user, host, '', dest, flags, options).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an error if dest is invalid.', () => {
        RSYNC.DryRun(user, host, src, 3, flags, options).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an error if flags is invalid.', () => {
        RSYNC.DryRun(user, host, src, dest, null, options).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an error if options is invalid.', () => {
        RSYNC.DryRun(user, host, src, dest, flags, null).then(output => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });
    });
  });
});