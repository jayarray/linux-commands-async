let EXPECT = require('chai').expect;

let _path = require('path');
let rootDir = _path.join(__dirname, '..', '..');

let pathJs = _path.join(rootDir, 'path.js');
let PATH = require(pathJs);

//------------------------------------------

describe('*** path.js ***', () => {
  describe('Error', () => {
    describe('PathError(p)', () => {
      it(`Returns 'undefined' if p is undefined.`, () => {
        EXPECT(PATH.Error.PathError(undefined)).to.equal('Path is undefined');
      });

      it(`Returns 'null' if p is null.`, () => {
        EXPECT(PATH.Error.PathError(null)).to.equal('Path is null');
      });

      it(`Returns 'not a string' if p is not string type.`, () => {
        EXPECT(PATH.Error.PathError(1)).to.equal('Path is not a string');
        EXPECT(PATH.Error.PathError([])).to.equal('Path is not a string');
        EXPECT(PATH.Error.PathError(true)).to.equal('Path is not a string');
      });

      it(`Returns 'empty' if p is empty.`, () => {
        EXPECT(PATH.Error.PathError('')).to.equal('Path is empty');
      });

      it(`Returns 'whitespace' if p is all whitespace.`, () => {
        EXPECT(PATH.Error.PathError(' ')).to.equal('Path is whitespace');
        EXPECT(PATH.Error.PathError('\t')).to.equal('Path is whitespace');
        EXPECT(PATH.Error.PathError('\n  \t   ')).to.equal('Path is whitespace');
      });

      it(`Returns null if p is valid.`, () => {
        EXPECT(PATH.Error.PathError('hai')).to.equal(null);
        EXPECT(PATH.Error.PathError('   hai')).to.equal(null);
        EXPECT(PATH.Error.PathError('hai \t\n\t')).to.equal(null);
      });
    });
  });

  describe('Path', () => {
    let invalidPath = '';
    let validPath = '/path/to/file.txt';

    describe('Exists(path)', () => {
      it('Returns error if path is invalid.', () => {
        PATH.Path.Exists(invalidPath).then(o => EXPECT(false))
          .catch(error => {
            EXPECT(error).to.equal(`Path is empty`);
          });
      });

      it('Returns boolean value if path is valid.', () => {
        PATH.Path.Exists(validPath).then(o => EXPECT(true))
          .catch(error => EXPECT(false));
      });
    });

    describe('IsFile(path)', () => {
      it('Returns error if path is invalid.', () => {
        PATH.Path.IsFile(invalidPath).then(o => EXPECT(false))
          .catch(error => {
            EXPECT(error).to.equal(`Path is empty`);
          });
      });
    });

    describe('IsDir(path)', () => {
      it('Returns error if path is invalid.', () => {
        PATH.Path.IsDir(invalidPath).then(o => EXPECT(false))
          .catch(error => {
            EXPECT(error).to.equal(`Path is empty`);
          });
      });
    });

    describe('Filename(path)', () => {
      it('Returns error if path is invalid.', () => {
        let o = PATH.Path.Filename(invalidPath);
        if (o.error)
          EXPECT(o.error).to.equal(`Path is empty`);
        EXPECT(false);
      });

      it('Returns string if path is valid.', () => {
        let o = PATH.Path.Filename(validPath);
        if (o.error)
          EXPECT(false);
        EXPECT(o.name).to.equal('file.txt');
      });
    });

    describe('Extension(path)', () => {
      it('Returns error if path is invalid.', () => {
        let o = PATH.Path.Extension(invalidPath);
        if (o.error)
          EXPECT(o.error).to.equal(`Path is empty`);
        EXPECT(false);
      });

      it('Returns string if path is valid.', () => {
        let o = PATH.Path.Extension(validPath);
        if (o.error)
          EXPECT(false);
        EXPECT(o.extension).to.equal('.txt');
      });
    });

    describe('ParentDirName(path)', () => {
      it('Returns error if path is invalid.', () => {
        let invalidType = PATH.Error.PathError(invalidPath);
        let o = PATH.Path.ParentDirName(invalidPath);
        if (o.error)
          EXPECT(o.error).to.equal(`Path is empty`);
        EXPECT(false);
      });

      it('Returns string if path is valid.', () => {
        let o = PATH.Path.ParentDirName(validPath);
        if (o.error)
          EXPECT(false);
        EXPECT(o.name).to.equal('to');
      });
    });

    describe('ParentDir(path)', () => {
      it('Returns error if path is invalid.', () => {
        let invalidType = PATH.Error.PathError(invalidPath);
        let o = PATH.Path.ParentDir(invalidPath);
        if (o.error)
          EXPECT(o.error).to.equal(`Path is empty`);
        EXPECT(false);
      });

      it('Returns string if path is valid.', () => {
        let o = PATH.Path.ParentDir(validPath);
        if (o.error)
          EXPECT(false);
        EXPECT(o.dir).to.equal('/path/to');
      });
    });

    describe('Escape(path)', () => {
      it('Returns error if path is invalid.', () => {
        let o = PATH.Path.Escape(invalidPath);
        if (o.error)
          EXPECT(o.error).to.equal(`Path is empty`);
        EXPECT(false);
      });

      it('Returns string if path is valid.', () => {
        let o = PATH.Path.Escape(invalidPath);
        if (o.error)
          EXPECT(false);
        EXPECT(true);
      });
    });

    describe('ContainsWhitespace(path)', () => {
      it('Returns error if path is invalid.', () => {
        let o = PATH.Path.ContainsWhitespace(invalidPath);
        if (o.error)
          EXPECT(o.error).to.equal(`Path is empty`);
        EXPECT(false);
      });

      it('Returns boolean if path is valid.', () => {
        let o = PATH.Path.ContainsWhitespace(validPath);
        if (o.error)
          EXPECT(false);
        EXPECT(true);
      });
    });
  });
});