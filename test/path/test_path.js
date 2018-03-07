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
  
  describe('Query(paths, executor)', () => {
    let validValues = ['f', 'd', 'dne', 'invalid'];

    it('Returns error if paths is invalid.', () => {
      PATH.Query(null, executor).then(dict => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if executor is invalid.', () => {
      PATH.Query([validPath], null).then(dict => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns an object (dict).', () => {
      PATH.Query([validPath], executor).then(dict => {
        let isValid = validValues.includes(dict[validPath]);
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
});