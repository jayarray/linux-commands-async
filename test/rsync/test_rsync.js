let EXPECT = require('chai').expect;

let _path = require('path');
let rootDir = _path.join(__dirname, '..', '..');

let rsyncJs = _path.join(rootDir, 'rsync.js');
let MOVE = require(rsyncJs);

let FS = require('fs-extra');

//------------------------------------------

describe('*** move.js ***', () => {
  describe('Move', () => {
    describe('Move(path)', () => {
      it('Returns an error if path is invalid.', () => {
        MOVE.Move(undefined).then(success => EXPECT(false))
          .catch(error => EXPECT(true));
      });

      it('Actually moves a file.', () => {
        // Write a test file
        let src = _path.join(rootDir, 'delete_me.txt');
        let text = 'Delete me!';

        FS.writeFile(src, text, (err) => {
          if (err)
            EXPECT(false);

          // Move it
          let dest = _path.join(rootDir, 'delete_this_moved_file.txt');
          MOVE.Move(src, dest).then(bool => {
            // Delete it
            FS.unlink(dest, (err) => {
              EXPECT(true);
            });
          }).catch(error => EXPECT(false));
        });
      });
    });
  });
});