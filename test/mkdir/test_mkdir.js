let EXPECT = require('chai').expect;

let _path = require('path');
let rootDir = _path.join(__dirname, '..', '..');

let mkdirJs = _path.join(rootDir, 'mkdir.js');
let MKDIR = require(mkdirJs).Mkdir;

let RIMRAF = require('rimraf');

//------------------------------------------

describe('*** mkdir.js ***', () => {
  describe('Mkdir', () => {
    let validPath = _path.join(rootDir, 'delete_me');

    describe('Mkdir(path)', () => {
      it('Returns an error if path is invalid.', () => {
        MKDIR.Mkdir('').then(success => EXPECT(false))
          .catch(error => EXPECT(true));
      });

      it('Actually creates a directory.', () => {
        MKDIR.Mkdir(validPath).then(bool => {
          RIMRAF(validPath, (err) => EXPECT(true));
        }).catch(error => EXPECT(false));
      });
    });

    describe('Mkdirp(path)', () => {
      it('Returns an error if path is invalid.', () => {
        MKDIR.Mkdirp(null).then(bool => EXPECT(false))
          .catch(error => EXPECT(true));
      });

      it('Actually creates a directory.', () => {
        MKDIR.Mkdirp(validPath).then(bool => {
          RIMRAF(validPath, (err) => EXPECT(true));
        }).catch(error => EXPECT(false));
      });
    });
  });
});