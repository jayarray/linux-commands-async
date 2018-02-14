let EXPECT = require('chai').expect;

let PATH = require('path');
let rootDir = PATH.join(__dirname, '..', '..');

let findJs = PATH.join(rootDir, 'find.js');
let FIND = require(findJs).Find;

//------------------------------------------

describe('*** find.js ***', () => {
  describe('Find', () => {
    describe('Manual(path, args)', () => {
      
    });

    describe('FilesByPattern(path, pattern, maxDepth) ', () => {
      
    });

    describe('FilesByContent(path, text, maxDepth)', () => {
      
    });

    describe('FilesByUser(path, user, maxDepth)', () => {
      
    });

    describe('DirsByPattern(path, pattern, maxDepth)', () => {
      
    });

    describe('EmptyFiles(path, maxDepth)', () => {
      
    });

    describe('EmptyDirs(path, maxDepth)', () => {
      
    });
  });
});