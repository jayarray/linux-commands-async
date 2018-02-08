let EXPECT = require('chai').expect;

let _path = require('path');
let rootDir = _path.join(__dirname, '..', '..');

let rsyncJs = _path.join(rootDir, 'rsync.js');
let RSYNC = require(rsyncJs);

let FS = require('fs-extra');

//------------------------------------------

describe('*** rsync.js ***', () => {
  describe('Error', () => {
    describe('NullOrUndefined(o)', () => {
      // TO DO
    });

    describe('StringError(s)', () => {
      // TO DO
    });

    describe('FlagsError(flags)', () => {
      // TO DO
    });

    describe('OptionsError(options)', () => {
      // TO DO
    });
  });

  describe('Rsync', () => {
    describe('Rsync(user, host, src, dest)', () => {
      // TO DO
    });

    describe('Update(user, host, src, dest)', () => {
      // TO DO
    });

    describe('Match(user, host, src, dest)', () => {
      // TO DO
    });

    describe('Manual(user, host, src, dest)', () => {
      // TO DO
    });

    describe('DryRun(user, host, src, dest)', () => {
      // TO DO
    });
  });
});