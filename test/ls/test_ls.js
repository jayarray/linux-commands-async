let EXPECT = require('chai').expect;

let _path = require('path');
let rootDir = _path.join(__dirname, '..', '..');

let lsJs = _path.join(rootDir, 'ls.js');
let LS = require(lsJs);

//------------------------------------------

describe('*** ls.js ***', () => {
  describe('Error', () => {
    describe('NullOrUndefined(o)', () => {
      it(`Returns 'undefined' if o is undefined.`, () => {
        EXPECT(LS.Error.NullOrUndefined(undefined)).to.equal('undefined');
      });

      it(`Returns 'null' if o is null.`, () => {
        EXPECT(LS.Error.NullOrUndefined(null)).to.equal('null');
      });

      it('Returns null if o is defined.', () => {
        EXPECT(LS.Error.NullOrUndefined(1)).to.equal(null);
        EXPECT(LS.Error.NullOrUndefined('Hai')).to.equal(null);
        EXPECT(LS.Error.NullOrUndefined([])).to.equal(null);
      });
    });

    describe('LsStringError(s)', () => {
      it(`Returns 'undefined' if s is undefined.`, () => {
        EXPECT(LS.Error.LsStringError(undefined)).to.equal('Ls string is undefined');
      });

      it(`Returns 'null' if s is null.`, () => {
        EXPECT(LS.Error.LsStringError(null)).to.equal('Ls string is null');
      });

      it(`Returns 'not a string' if s is not string type.`, () => {
        EXPECT(LS.Error.LsStringError(1)).to.equal('Ls string is not a string');
        EXPECT(LS.Error.LsStringError([])).to.equal('Ls string is not a string');
        EXPECT(LS.Error.LsStringError(true)).to.equal('Ls string is not a string');
      });

      it(`Returns 'empty' if s is empty.`, () => {
        EXPECT(LS.Error.LsStringError('')).to.equal('Ls string is empty');
      });

      it(`Returns 'whitespace' if s is all whitespace.`, () => {
        EXPECT(LS.Error.LsStringError(' ')).to.equal('Ls string is whitespace');
        EXPECT(LS.Error.LsStringError('\t')).to.equal('Ls string is whitespace');
        EXPECT(LS.Error.LsStringError('\n  \t   ')).to.equal('Ls string is whitespace');
      });

      it(`Returns error if s is not formatted correctly.`, () => {
        EXPECT(LS.Error.LsStringError('hai')).to.equal('Ls string is not formatted correctly');
        EXPECT(LS.Error.LsStringError('-r--r--r-- is invalid')).to.equal('Ls string is not formatted correctly');
        EXPECT(LS.Error.LsStringError('cr--r--r-- 1 root 4096 Jan 1 14:30 file.txt')).to.equal('Ls string is not formatted correctly');
      });

      it(`Returns null if s is formatted correctly.`, () => {
        EXPECT(LS.Error.LsStringError('-r--r--r-- 1 root root 4096 Jan 1 14:30 file.txt')).to.equal(null);
        EXPECT(LS.Error.LsStringError('cr--r--r-- 1 root root 4096 Jan 1 14:30 file.txt')).to.equal(null);
        EXPECT(LS.Error.LsStringError('dr--r--r-- 1 root root 4096 Jan 1 14:30 file.txt')).to.equal(null);
      });
    });
  });

  describe('Ls', () => {
    let invalidPath = '';
    let validPath = rootDir;

    let validLsString = 'dr--r--r-- 1 root root 4096 Jan 1 14:30 file.txt';
    let invalidLsString = 'dr--r--r-- 1 root 4096 Jan 1 14:30 file.txt'; // Missing group name

    describe('AllFilenames(path)', () => {
      it('Returns error if path is invalid.', () => {
        LS.Ls.AllFilenames(invalidPath).then(filenames => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns array of filenames if path is valid.', () => {
        LS.Ls.AllFilenames(validPath).then(filenames => {
          EXPECT(Array.isArray(filenames) && filenames.length >= 0).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });

    describe('VisibleFilenames(path)', () => {
      it('Returns error if path is invalid.', () => {
        LS.Ls.VisibleFilenames(invalidPath).then(filenames => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns array of filenames if path is valid.', () => {
        LS.Ls.VisibleFilenames(validPath).then(filenames => {
          EXPECT(Array.isArray(filenames) && filenames.length >= 0).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });

    describe('HiddenFilenames(path)', () => {
      it('Returns error if path is invalid.', () => {
        LS.Ls.HiddenFilenames(invalidPath).then(filenames => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns array of filenames if path is valid.', () => {
        LS.Ls.HiddenFilenames(validPath).then(filenames => {
          EXPECT(Array.isArray(filenames) && filenames.length >= 0).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });

    describe('FileInfo(path)', () => {
      it('Returns error if path is invalid.', () => {
        LS.Ls.FileInfo(invalidPath).then(info => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an object if path is valid.', () => {
        LS.Ls.FileInfo(validPath).then(info => {
          let ok = !(info.permstr === undefined) &&
            !(info.hardlinks === undefined) &&
            !(info.owner === undefined) &&
            !(info.group === undefined) &&
            !(info.size === undefined) &&
            !(info.name === undefined) &&
            !(info.filetype === undefined);
          EXPECT(ok).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });

    describe('DirInfo(path)', () => {
      it('Returns error if path is invalid.', () => {
        LS.Ls.DirInfo(invalidPath).then(info => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an object if path is valid.', () => {
        LS.Ls.DirInfo(validPath).then(info => {
          let ok = !(info.permstr === undefined) &&
            !(info.hardlinks === undefined) &&
            !(info.owner === undefined) &&
            !(info.group === undefined) &&
            !(info.size === undefined) &&
            !(info.name === undefined) &&
            !(info.filetype === undefined);
          EXPECT(ok).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });

    describe('Info(path)', () => {
      it('Returns error if path is invalid.', () => {
        LS.Ls.Info(invalidPath).then(info => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an object if path is valid.', () => {
        LS.Ls.Info(validPath).then(info => {
          let ok = !(info.permstr === undefined) &&
            !(info.hardlinks === undefined) &&
            !(info.owner === undefined) &&
            !(info.group === undefined) &&
            !(info.size === undefined) &&
            !(info.name === undefined) &&
            !(info.filetype === undefined);
          EXPECT(ok).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });

    describe('AllInfos(path)', () => {
      it('Returns error if path is invalid.', () => {
        LS.Ls.AllInfos(invalidPath).then(infos => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an array of objects if path is valid.', () => {
        LS.Ls.AllInfos(validPath).then(infos => {
          EXPECT(Array.isArray(infos) && infos.length >= 0).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });

    describe('VisibleInfos(path)', () => {
      it('Returns error if path is invalid.', () => {
        LS.Ls.VisibleInfos(invalidPath).then(infos => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an array of objects if path is valid.', () => {
        LS.Ls.VisibleInfos(validPath).then(infos => {
          EXPECT(Array.isArray(infos) && infos.length >= 0).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });

    describe('HiddenInfos(path)', () => {
      it('Returns error if path is invalid.', () => {
        LS.Ls.HiddenInfos(invalidPath).then(infos => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an array of object if path is valid.', () => {
        LS.Ls.HiddenInfos(validPath).then(infos => {
          EXPECT(Array.isArray(infos) && infos.length >= 0).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });

    describe('ParseLsString(string)', () => {
      it('Returns error if string is invalid.', () => {
        let results = LS.Ls.ParseLsString(invalidLsString);
        EXPECT(results.error).to.not.equal(null)
      });

      it('Returns an object if string is valid.', () => {
        let results = LS.Ls.ParseLsString(validLsString);
        let info = results.info;
        let ok = !(info.permstr === undefined) &&
          !(info.hardlinks === undefined) &&
          !(info.owner === undefined) &&
          !(info.group === undefined) &&
          !(info.size === undefined) &&
          !(info.name === undefined) &&
          !(info.filetype === undefined);
        EXPECT(ok).to.equal(true);
      });
    });
  });
});