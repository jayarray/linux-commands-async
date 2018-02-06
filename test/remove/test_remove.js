let EXPECT = require('chai').expect;

let _path = require('path');
let rootDir = _path.join(__dirname, '..', '..');

let removeJs = _path.join(rootDir, 'remove.js');
let REMOVE = require(removeJs).Remove;

let FS = require('fs-extra');

//------------------------------------------

describe('*** remove.js ***', () => {
  describe('Remove', () => {
    describe('File(path)', () => {
      it('Returns an error if src or dest are invalid.', () => {
        REMOVE.File(undefined).then(bool => EXPECT(false))
          .catch(error => EXPECT(true));
      });

      it('Actually deletes file.', () => {
        let dest = _path.join(rootDir, 'delete_me.txt');

        // Write a test file
        let text = 'Delete me!';
        FS.writeFile(dest, text, (err) => {
          if (err)
            EXPECT(false);

          // Delete it
          REMOVE.File(dest).then(bool => {
            EXPECT(true);
          }).catch(error => EXPECT(false));
        });
      });
    });

    describe('Directory(path)', () => {
      it('Returns an error if src or dest are invalid.', () => {
        REMOVE.Directory(undefined).then(bool => EXPECT(false))
          .catch(error => EXPECT(true));
      });

      it('Actually deletes directory.', () => {
        let dest = _path.join(rootDir, 'delete_me');

        // Write a test dir
        FS.mkdir(dest, (err) => {
          if (err)
            EXPECT(false);

          // Delete it
          REMOVE.Directory(dest).then(bool => {
            EXPECT(true);
          }).catch(error => EXPECT(false));
        });
      });
    });
  });
});