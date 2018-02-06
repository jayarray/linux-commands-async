let EXPECT = require('chai').expect;

let _path = require('path');
let rootDir = _path.join(__dirname, '..', '..');

let copyJs = _path.join(rootDir, 'copy.js');
let COPY = require(copyJs);

//------------------------------------------

describe('*** copy.js ***', () => {
  describe('Copy', () => {
    describe('Copy(src, dest)', () => {
      let src = copyJs;
      let dest = _path.join(rootDir, 'delete_me.txt');

      it('Returns an error if src or dest are invalid.', () => {
        COPY.Copy.Copy(null, dest).then(bool => EXPECT(false))
          .catch(err => EXPECT(true));
      });

      it('Returns a boolean value if src and dest are valid.', () => {
        COPY.Copy.Copy(src, dest).then(bool => {
          FS.unlink(dest, (err) => {
            EXPECT(true);
          });
        }).catch(error => EXPECT(false));
      });
    });
  });
});