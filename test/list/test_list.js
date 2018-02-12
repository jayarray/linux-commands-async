let EXPECT = require('chai').expect;

let _path = require('path');
let rootDir = _path.join(__dirname, '..', '..');

let listJs = _path.join(rootDir, 'list.js');
let LIST = require(listJs);

//------------------------------------------

describe('*** list.js ***', () => {
  describe('Ls', () => {
    let invalidPath = '';
    let validPath = rootDir;

    let validLsString = 'dr--r--r-- 1 root root 4096 Jan 1 14:30 file.txt';
    let invalidLsString = 'dr--r--r-- 1 root 4096 Jan 1 14:30 file.txt'; // Missing group name

    describe('AllFilenames(path)', () => {
      it('Returns error if path is invalid.', () => {
        LIST.List.AllFilenames(invalidPath).then(filenames => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns array of filenames if path is valid.', () => {
        LIST.List.AllFilenames(validPath).then(filenames => {
          EXPECT(Array.isArray(filenames) && filenames.length >= 0).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });

    describe('VisibleFilenames(path)', () => {
      it('Returns error if path is invalid.', () => {
        LIST.List.VisibleFilenames(invalidPath).then(filenames => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns array of filenames if path is valid.', () => {
        LIST.List.VisibleFilenames(validPath).then(filenames => {
          EXPECT(Array.isArray(filenames) && filenames.length >= 0).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });

    describe('HiddenFilenames(path)', () => {
      it('Returns error if path is invalid.', () => {
        LIST.List.HiddenFilenames(invalidPath).then(filenames => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns array of filenames if path is valid.', () => {
        LIST.List.HiddenFilenames(validPath).then(filenames => {
          EXPECT(Array.isArray(filenames) && filenames.length >= 0).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });

    describe('FileInfo(path)', () => {
      it('Returns error if path is invalid.', () => {
        LIST.List.FileInfo(invalidPath).then(info => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an object if path is valid.', () => {
        LIST.List.FileInfo(validPath).then(info => {
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
        LIST.List.DirInfo(invalidPath).then(info => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an object if path is valid.', () => {
        LIST.List.DirInfo(validPath).then(info => {
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
        LIST.List.Info(invalidPath).then(info => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an object if path is valid.', () => {
        LIST.List.Info(validPath).then(info => {
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
        LIST.List.AllInfos(invalidPath).then(infos => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an array of objects if path is valid.', () => {
        LIST.List.AllInfos(validPath).then(infos => {
          EXPECT(Array.isArray(infos) && infos.length >= 0).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });

    describe('VisibleInfos(path)', () => {
      it('Returns error if path is invalid.', () => {
        LIST.List.VisibleInfos(invalidPath).then(infos => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an array of objects if path is valid.', () => {
        LIST.List.VisibleInfos(validPath).then(infos => {
          EXPECT(Array.isArray(infos) && infos.length >= 0).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });

    describe('HiddenInfos(path)', () => {
      it('Returns error if path is invalid.', () => {
        LIST.List.HiddenInfos(invalidPath).then(infos => EXPECT(false))
          .catch(error => EXPECT(error).to.not.equal(null));
      });

      it('Returns an array of object if path is valid.', () => {
        LIST.List.HiddenInfos(validPath).then(infos => {
          EXPECT(Array.isArray(infos) && infos.length >= 0).to.equal(true);
        }).catch(error => EXPECT(false));
      });
    });

    describe('ParseLsString(string)', () => {
      it('Returns error if string is invalid.', () => {
        let results = LIST.List.ParseLsString(invalidLsString);
        EXPECT(results.error).to.not.equal(null)
      });

      it('Returns an object if string is valid.', () => {
        let results = LIST.List.ParseLsString(validLsString);
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