let EXPECT = require('chai').expect;

let _path = require('path');
let rootDir = _path.join(__dirname, '..', '..');

let zipJs = _path.join(rootDir, 'zip.js');
let ZIP = require(zipJs);

let fileJs = _path.join(rootDir, 'file.js');
let FILE = require(fileJs);

let directoryJs = _path.join(rootDir, 'directory.js');
let DIRECTORY = require(directoryJs);

let findJs = _path.join(rootDir, 'find.js');
let FIND = require(findJs);

let commandJs = _path.join(rootDir, 'command.js');
let COMMAND = require(commandJs);

let pathJs = _path.join(rootDir, 'path.js');
let PATH = require(pathJs);

//------------------------------------------

describe('*** zip.js ***', () => {
  let path = rootDir;
  let pattern = '*.js';
  let maxDepth = 1;

  let executor = COMMAND.LOCAL;
  let src = _path.join(rootDir, 'README.md');
  let sources = [src];

  let zipDest = _path.join(rootDir, 'testZip.zip');
  let tarDest = _path.join(rootDir, 'testTar.tar');

  let testDir = _path.join(rootDir, 'delete_this_test_dir');
  let untarDest = _path.join(testDir, 'delete_this_untarred_test_dir');
  let unzipDest = _path.join(testDir, 'delete_this_unzipped_test_dir');

  describe('Files(sources, dest, executor)', () => {
    it('Returns error if sources are invalid.', () => {
      ZIP.Files(null, zipDest, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if dest is invalid.', () => {
      ZIP.Files(sources, null, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      ZIP.Files(sources, zipDest, null).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Actually zips files.', () => {
      ZIP.Files(sources, zipDest, executor).then(success => {
        PATH.Exists(zipDest, executor).then(exists => {
          if (!exists)
            EXPECT(false);
          else
            FILE.Remove(zipDest, executor).then(success => {
              EXPECT(true);
            }).catch(error => EXPECT(error).to.not.equal(null));
        }).catch(error => EXPECT(error).to.not.equal(null));
      }).catch(error => EXPECT(error).to.not.equal(null));
    });
  });

  describe('Directories(sources, dest, executor)', () => {
    it('Returns error if sources are invalid.', () => {
      ZIP.Directories(null, zipDest, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if dest is invalid.', () => {
      ZIP.Directories(sources, null, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      ZIP.Directories(sources, zipDest, null).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Actually zips directories.', () => {
      DIRECTORY.Create(testDir, executor).then(success => {
        ZIP.Directories([testDir], zipDest, executor).then(success => {
          PATH.Exists(zipDest, executor).then(exists => {
            if (!exists)
              EXPECT(false);
            else
              FILE.Remove(zipDest, executor).then(success => {
                DIRECTORY.Remove(testDir, executor).then(success => {
                  EXPECT(true);
                }).catch(error => EXPECT(error).to.not.equal(null));
              }).catch(error => EXPECT(error).to.not.equal(null));
          }).catch(error => EXPECT(error).to.not.equal(null));
        }).catch(error => EXPECT(error).to.not.equal(null));
      }).catch(error => EXPECT(error).to.not.equal(null));
    });
  });

  describe('Manual(args, executor)', () => {
    it('Returns error if args is invalid.', () => {
      ZIP.Manual(null, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      ZIP.Manual([], executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Actually zips using args.', () => {
      DIRECTORY.Create(testDir, executor).then(success => {
        ZIP.Manual(['-r', zipDest, testDir], executor).then(success => {
          PATH.Exists(zipDest, executor).then(exists => {
            if (!exists)
              EXPECT(false);
            else
              FILE.Remove(zipDest, executor).then(success => {
                DIRECTORY.Remove(testDir, executor).then(success => {
                  EXPECT(true);
                }).catch(error => EXPECT(error).to.not.equal(null));
              }).catch(error => EXPECT(error).to.not.equal(null));
          }).catch(error => EXPECT(error).to.not.equal(null));
        }).catch(error => EXPECT(error).to.not.equal(null));
      }).catch(error => EXPECT(error).to.not.equal(null));
    });
  });

  describe('Unzip(src, dest, executor)', () => {
    it('Returns error if src are invalid.', () => {
      ZIP.Unzip(null, zipDest, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if dest is invalid.', () => {
      ZIP.Unzip(src, null, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      ZIP.Unzip(sources, zipDest, null).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Actually unzips.', () => {
      DIRECTORY.Create(testDir, executor).then(success => {
        DIRECTORY.Create(unzipDest, executor).then(success => {
          ZIP.Directories([testDir], zipDest, executor).then(success => {
            PATH.Exists(zipDest, executor).then(exists => {
              if (!exists)
                EXPECT(false);
              else {
                ZIP.Unzip(zipDest, unzipDest, executor).then(success => {
                  DIRECTORY.Remove(testDir, executor).then(success => {
                    EXPECT(true);
                  }).catch(error => EXPECT(false));
                }).catch(error => EXPECT(false));
              }
            }).catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      }).catch(error => EXPECT(false));
    });
  });


  describe('UnzipManual(args, executor)', () => {
    it('Returns error if args are invalid.', () => {
      ZIP.UnzipManual(null, executor).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      ZIP.UnzipManual([], null).then(success => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Actually unzips.', () => {
      DIRECTORY.Create(testDir, executor).then(success => {
        DIRECTORY.Create(unzipDest, executor).then(success => {
          ZIP.Directories([testDir], zipDest, executor).then(success => {
            PATH.Exists(zipDest, executor).then(exists => {
              if (!exists)
                EXPECT(false);
              else {
                ZIP.UnzipManual([zipDest, '-d', unzipDest], executor).then(success => {
                  DIRECTORY.Remove(testDir, executor).then(success => {
                    EXPECT(true);
                  }).catch(error => EXPECT(false));
                }).catch(error => EXPECT(false));
              }
            }).catch(error => EXPECT(false));
          }).catch(error => EXPECT(false));
        }).catch(error => EXPECT(false));
      }).catch(error => EXPECT(false));
    });
  });
});