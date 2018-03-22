let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let findJs = PATH.join(rootDir, 'find.js');
let FIND = require(findJs);

let commandJs = PATH.join(rootDir, 'command.js');
let COMMAND = require(commandJs);

//------------------------------------------

describe('*** find.js ***', () => {
  let executor = COMMAND.LOCAL;
  let dirPath = rootDir;
  let pattern = '*';
  let maxDepth = 1;

  describe('FilesByName(path, pattern, maxDepth) ', () => {
    it('Returns error if path is invalid.', () => {
      FIND.FilesByName(null, pattern, maxDepth).then(paths => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if pattern is invalid.', () => {
      FIND.FilesByName(dirPath, null, maxDepth).then(paths => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if maxDepth is invalid.', () => {
      FIND.FilesByName(dirPath, pattern, -1).then(paths => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns array if path, pattern, and maxDepth are valid.', () => {
      FIND.FilesByName(dirPath, pattern, maxDepth).then(paths => {
        let isValid = Array.isArray(paths);
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('FilesByContent(path, text, maxDepth)', () => {
    let text = 'EXECUTE';

    it('Returns error if path is invalid.', () => {
      FIND.FilesByContent(null, text, maxDepth).then(paths => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if text is invalid.', () => {
      FIND.FilesByContent(dirPath, null, maxDepth).then(paths => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if maxDepth is invalid.', () => {
      FIND.FilesByContent(dirPath, text, null).then(paths => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns array if path, text, and maxDepth are valid.', () => {
      FIND.FilesByContent(dirPath, text, maxDepth).then(paths => {
        let isValid = Array.isArray(paths);
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('FilesByUser(path, user, maxDepth)', () => {
    let user = 'root';

    it('Returns error if path is invalid.', () => {
      FIND.FilesByUser(null, user, maxDepth).then(paths => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if user is invalid.', () => {
      FIND.FilesByUser(dirPath, null, maxDepth).then(paths => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if maxDepth is invalid.', () => {
      FIND.FilesByUser(dirPath, user, null).then(paths => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns array if path, text, and maxDepth are valid.', () => {
      FIND.FilesByUser(dirPath, user, maxDepth).then(paths => {
        let isValid = Array.isArray(paths);
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('DirsByName(path, pattern, maxDepth)', () => {
    it('Returns error if path is invalid.', () => {
      FIND.DirsByName(null, pattern, maxDepth).then(paths => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if pattern is invalid.', () => {
      FIND.DirsByName(dirPath, null, maxDepth).then(paths => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if maxDepth is invalid.', () => {
      FIND.DirsByName(dirPath, pattern, -1).then(paths => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns array if path, pattern, and maxDepth are valid.', () => {
      FIND.DirsByName(dirPath, pattern, maxDepth).then(paths => {
        let isValid = Array.isArray(paths);
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('EmptyFiles(path, maxDepth)', () => {
    it('Returns error if path is invalid.', () => {
      FIND.EmptyFiles(null, maxDepth).then(paths => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if maxDepth is invalid.', () => {
      FIND.EmptyFiles(dirPath, -1).then(paths => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns array if path and maxDepth are valid.', () => {
      FIND.EmptyFiles(dirPath, maxDepth).then(paths => {
        let isValid = Array.isArray(paths);
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });

  describe('EmptyDirs(path, maxDepth)', () => {
    it('Returns error if path is invalid.', () => {
      FIND.EmptyDirs(null, maxDepth).then(paths => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns error if maxDepth is invalid.', () => {
      FIND.EmptyDirs(dirPath, -1).then(paths => EXPECT(false))
        .catch(error => EXPECT(error).to.not.equal(null));
    });

    it('Returns array if path and maxDepth are valid.', () => {
      FIND.EmptyDirs(dirPath, maxDepth).then(paths => {
        let isValid = Array.isArray(paths);
        EXPECT(isValid).to.equal(true);
      }).catch(error => EXPECT(false));
    });
  });
});