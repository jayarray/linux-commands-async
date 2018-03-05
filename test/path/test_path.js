let EXPECT = require('chai').expect;

let _path = require('path');
let rootDir = _path.join(__dirname, '..', '..');

let pathJs = _path.join(rootDir, 'path.js');
let PATH = require(pathJs);

let commandJs = _path.join(rootDir, 'command.js');
let COMMAND = require(commandJs);

//------------------------------------------

describe('*** path.js ***', () => {
  let executor = COMMAND.LOCAL;
  let invalidPath = '';
  let validPath = rootDir;
  let validValues = ['f', 'd', 'dne', 'invalid'];

  describe('IsFileOrDirectoryDict(paths, executor)', () => {
    it('Returns error if paths is invalid.', () => {
      PATH.IsFileOrDirectoryDict(null, executor).then(dict => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      PATH.IsFileOrDirectoryDict([validPath], null).then(dict => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an object (dict).', () => {
      PATH.IsFileOrDirectoryDict([validPath], executor).then(dict => {
        let isValid = validValues.includes(dict[validPath]);
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('IsFileOrDir(path, executor)', () => {
    it('Returns error if path is invalid.', () => {
      PATH.IsFileOrDir(invalidPath, executor).then(o => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      PATH.IsFileOrDir(validPath, null).then(o => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns a string.', () => {
      PATH.IsFileOrDir(validPath, executor).then(o => {
        let isValid = validValues.includes(o);
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('Exists(path, executor)', () => {
    it('Returns error if path is invalid.', () => {
      PATH.Exists(invalidPath, executor).then(o => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      PATH.Exists(validPath, null).then(o => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns boolean value if path is valid.', () => {
      PATH.Exists(validPath, executor).then(o => {
        let isValid = o === true || o === false;
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('ExistsDict(paths, executor)', () => {
    it('Returns error if paths is invalid.', () => {
      PATH.ExistsDict(null, executor).then(dict => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      PATH.ExistsDict([validPath], null).then(dict => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns boolean value if path is valid.', () => {
      PATH.ExistsDict([validPath], executor).then(dict => {
        let isValid = dict[validPath] === true || dict[validPath] === false;
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('IsFile(path, executor)', () => {
    it('Returns error if path is invalid.', () => {
      PATH.IsFile(invalidPath, executor).then(o => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      PATH.IsFile(validPath, null).then(o => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns boolean value if path is valid.', () => {
      PATH.IsFile(validPath, executor).then(o => {
        let isValid = o === true || o === false;
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('IsFileDict(paths, executor)', () => {
    it('Returns error if paths is invalid.', () => {
      PATH.IsFileDict(null, executor).then(dict => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      PATH.IsFileDict([validPath], null).then(dict => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns boolean value if path is valid.', () => {
      PATH.IsFileDict([validPath], executor).then(dict => {
        let isValid = dict[validPath] === true || dict[validPath] === false;
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('IsDir(path)', () => {
    it('Returns error if path is invalid.', () => {
      PATH.IsDir(invalidPath, executor).then(o => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      PATH.IsDir(validPath, null).then(o => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns boolean value if path is valid.', () => {
      PATH.IsDir(validPath, executor).then(o => {
        let isValid = o === true || o === false;
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('IsDirDict(paths, executor)', () => {
    it('Returns error if paths is invalid.', () => {
      PATH.IsDirDict(null, executor).then(dict => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      PATH.IsDirDict([validPath], null).then(dict => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns boolean value if path is valid.', () => {
      PATH.IsDirDict([validPath], executor).then(dict => {
        let isValid = dict[validPath] === true || dict[validPath] === false;
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('Filename(path)', () => {
    it('Returns string if path is valid.', () => {
      let s = PATH.Filename(validPath);
      let isValid = s != null && s !== undefined;
      EXPECT(isValid).to.equal(true);
    });
  });

  describe('Extension(path)', () => {
    it('Returns string if path is valid.', () => {
      let s = PATH.Extension(validPath);
      let isValid = s != null && s !== undefined;
      EXPECT(isValid).to.equal(true);
    });
  });

  describe('ParentDirName(path)', () => {
    it('Returns string if path is valid.', () => {
      let s = PATH.ParentDirName(validPath);
      let isValid = s != null && s !== undefined;
      EXPECT(isValid).to.equal(true);
    });
  });

  describe('ParentDir(path)', () => {
    it('Returns string if path is valid.', () => {
      let s = PATH.ParentDir(validPath);
      let isValid = s != null && s !== undefined;
      EXPECT(isValid).to.equal(true);
    });
  });

  describe('Escape(path)', () => {
    it('Returns string if path is valid.', () => {
      let s = PATH.Escape(invalidPath);
      let isValid = s != null && s !== undefined;
      EXPECT(isValid).to.equal(true);
    });
  });

  describe('ContainsWhitespace(path)', () => {
    it('Returns boolean if path is valid.', () => {
      let s = PATH.ContainsWhitespace(validPath);
      let isValid = s != null && s !== undefined;
      EXPECT(isValid).to.equal(true);
    });
  });
});