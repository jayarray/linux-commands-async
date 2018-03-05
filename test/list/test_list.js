let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let listJs = PATH.join(rootDir, 'list.js');
let LIST = require(listJs);

let commandJs = PATH.join(rootDir, 'command.js');
let COMMAND = require(commandJs);

//------------------------------------------

describe('*** list.js ***', () => {
  let executor = COMMAND.LOCAL;
  let invalidPath = '';
  let validPath = rootDir;

  let validLsString = 'dr--r--r-- 1 root root 4096 Jan 1 14:30 file.txt';
  let invalidLsString = 'dr--r--r-- 1 root 4096 Jan 1 14:30 file.txt'; // Missing group name

  describe('AllFilenames(path, executor)', () => {
    it('Returns error if path is invalid.', () => {
      LIST.AllFilenames(invalidPath, executor).then(filenames => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      LIST.AllFilenames(validPath, null).then(filenames => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns array of filenames if path is valid.', () => {
      LIST.AllFilenames(validPath, executor).then(filenames => {
        EXPECT(Array.isArray(filenames) && filenames.length >= 0).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('VisibleFilenames(path, executor)', () => {
    it('Returns error if path is invalid.', () => {
      LIST.VisibleFilenames(invalidPath, executor).then(filenames => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      LIST.VisibleFilenames(validPath, null).then(filenames => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns array of filenames if path is valid.', () => {
      LIST.VisibleFilenames(validPath, executor).then(filenames => {
        EXPECT(Array.isArray(filenames) && filenames.length >= 0).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('HiddenFilenames(path, executor)', () => {
    it('Returns error if path is invalid.', () => {
      LIST.HiddenFilenames(invalidPath, executor).then(filenames => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      LIST.HiddenFilenames(validPath, null).then(filenames => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns array of filenames if path is valid.', () => {
      LIST.HiddenFilenames(validPath, executor).then(filenames => {
        EXPECT(Array.isArray(filenames) && filenames.length >= 0).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('FileInfo(path, executor)', () => {
    let filepath = PATH.join(rootDir, 'api.js');

    it('Returns error if path is invalid.', () => {
      LIST.FileInfo(invalidPath, executor).then(info => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      LIST.FileInfo(filepath, null).then(info => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an object if path is valid.', () => {
      LIST.FileInfo(filepath, executor).then(info => {
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

  describe('DirInfo(path, executor)', () => {
    it('Returns error if path is invalid.', () => {
      LIST.DirInfo(invalidPath, executor).then(info => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      LIST.DirInfo(validPath, null).then(info => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an object if path is valid.', () => {
      LIST.DirInfo(validPath, executor).then(info => {
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

  describe('Info(path, executor)', () => {
    it('Returns error if path is invalid.', () => {
      LIST.Info(invalidPath, executor).then(info => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      LIST.Info(validPath, null).then(info => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an object if path is valid.', () => {
      LIST.Info(validPath, executor).then(info => {
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

  describe('AllInfos(path, executor)', () => {
    it('Returns error if path is invalid.', () => {
      LIST.AllInfos(invalidPath, executor).then(infos => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      LIST.AllInfos(validPath, null).then(infos => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an array of objects if path is valid.', () => {
      LIST.AllInfos(validPath, executor).then(infos => {
        EXPECT(Array.isArray(infos) && infos.length >= 0).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('VisibleInfos(path, executor)', () => {
    it('Returns error if path is invalid.', () => {
      LIST.VisibleInfos(invalidPath, executor).then(infos => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      LIST.VisibleInfos(validPath, null).then(infos => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an array of objects if path is a directory.', () => {
      LIST.VisibleInfos(validPath, executor).then(infos => {
        EXPECT(Array.isArray(infos) && infos.length >= 0).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('HiddenInfos(path, executor)', () => {
    it('Returns error if path is invalid.', () => {
      LIST.HiddenInfos(invalidPath, executor).then(infos => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if path is invalid.', () => {
      LIST.HiddenInfos(validPath, null).then(infos => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an array of object if path is valid.', () => {
      LIST.HiddenInfos(validPath, executor).then(infos => {
        EXPECT(Array.isArray(infos) && infos.length >= 0).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });
});