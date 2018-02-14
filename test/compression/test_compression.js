let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let compressionJs = PATH.join(rootDir, 'compression.js');
let COMPRESSION = require(compressionJs);

let removeJs = PATH.join(rootDir, 'remove.js');
let REMOVE = require(removeJs).Remove;

let findJs = PATH.join(rootDir, 'find.js');
let FIND = require(findJs).Find;

//------------------------------------------

describe('*** compression.js ***', () => {
  let path = rootDir;
  let pattern = '*.js';
  let maxDepth = 1;

  let filePath = PATH.join(rootDir, 'README.md');
  let keepOriginal = true;

  let zipDest = PATH.join(rootDir, 'testZip.zip');
  let gzipDest = PATH.join(rootDir, 'testGzip.gz');
  let tarDest = PATH.join(rootDir, 'testTar.tar');

  describe('Zip', () => {
    describe('CompressFiles(sources, dest)', () => {
      it('Returns error if sources is invalid.', () => {
        COMPRESSION.Zip.CompressFiles(null, zipDest).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if dest is invalid.', () => {
        COMPRESSION.Zip.CompressFiles([], zipDest).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Actually compresses files.', () => {
        FIND.FilesByPattern(path, pattern, maxDepth).then(sources => {
          COMPRESSION.Zip.CompressFiles(sources, zipDest).then(success => {
            REMOVE.File(zipDest).then(success => EXPECT(true))
              .catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      });
    });

    describe('CompressDirs(sources, dest)', () => {
      it('Returns error if sources is invalid.', () => {
        COMPRESSION.Zip.CompressDirs(null, zipDest).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if dest is invalid.', () => {
        COMPRESSION.Zip.CompressDirs([], zipDest).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Actually compresses files.', () => {
        FIND.DirsByPattern(path, 'test', maxDepth).then(sources => {
          COMPRESSION.Zip.CompressDirs(sources, zipDest).then(success => {
            REMOVE.File(zipDest).then(success => EXPECT(true))
              .catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      });
    });

    describe('Decompress(src, dest)', () => {
      it('Returns error if sources is invalid.', () => {
        COMPRESSION.Zip.Decompress(null, zipDest).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if dest is invalid.', () => {
        COMPRESSION.Zip.Decompress([], zipDest).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });
    });
  });

  describe('Gzip', () => {
    describe('CompressFile(src, dest, keepOriginal)', () => {
      it('Returns error if src is invalid.', () => {
        COMPRESSION.Gzip.CompressFile(filePath, gzipDest, keepOriginal).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if dest is invalid.', () => {
        COMPRESSION.Gzip.CompressFile(filePath, null, keepOriginal).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if keepOriginal is invalid.', () => {
        COMPRESSION.Gzip.CompressFile(filePath, gzipDest, null).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Actually compresses files.', () => {
        FIND.FilesByPattern(path, pattern, maxDepth).then(sources => {
          COMPRESSION.Gzip.CompressFile(filePath, gzipDest, keepOriginal).then(success => {
            REMOVE.File(gzipDest).then(success => EXPECT(true))
              .catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      });
    });

    describe('Decompress(src, keepOriginal)', () => {
      it('Returns error if src is invalid.', () => {
        COMPRESSION.Gzip.Decompress(null, false).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if keepOriginal is invalid.', () => {
        COMPRESSION.Gzip.Decompress(gzipDest, null).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if dest is invalid.', () => {
        COMPRESSION.Gzip.Decompress(gzipDest, false).then(success => {
          REMOVE.File(filePath).then(success => EXPECT(true))
            .catch(error => EXPECT(false));
        }).catch(error => EXPECT(error).to.not.equal(null));
      });
    });
  });

  describe('Tar', () => {
    describe('Compress(src, dest)', () => {
      it('Returns error if src is invalid.', () => {
        COMPRESSION.Tar.Compress(null, tarDest).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if dest is invalid.', () => {
        COMPRESSION.Tar.Compress(filePath, null).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Actually compresses files.', () => {
        COMPRESSION.Tar.Compress(filePath, tarDest).then(success => {
          REMOVE.File(tarDest).then(success => EXPECT(true))
            .catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      });
    });

    describe('Decompress(src, dest)', () => {
      it('Returns error if sources is invalid.', () => {
        COMPRESSION.Zip.Decompress(null, tarDest).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns error if dest is invalid.', () => {
        COMPRESSION.Zip.Decompress(filePath, null).then(success => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Actually decompresses files.', () => {
        COMPRESSION.Tar.Compress(filePath, tarDest).then(success => {
          COMPRESSION.Tar.Decompress(tarDest, filePath).then(success => {
            REMOVE.File(filePath).then(success => EXPECT(true))
              .catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      });
    });
  });
});