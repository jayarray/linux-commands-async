let EXPECT = require('chai').expect;

let _path = require('path');
let rootDir = _path.join(__dirname, '..', '..');

let pathJs = _path.join(rootDir, 'path.js');
let PATH = require(pathJs);

//------------------------------------------

describe('*** path.js ***', () => {
  describe('Error', () => {
    describe('NullOrUndefined(o)', () => {
      it(`Returns 'undefined' if o is undefined.`, () => {
        EXPECT(PATH.Error.NullOrUndefined(undefined)).to.equal('undefined');
      });

      it(`Returns 'null' if o is null.`, () => {
        EXPECT(PATH.Error.NullOrUndefined(null)).to.equal('null');
      });

      it('Returns null if o is defined.', () => {
        EXPECT(PATH.Error.NullOrUndefined(1)).to.equal(null);
        EXPECT(PATH.Error.NullOrUndefined('Hai')).to.equal(null);
        EXPECT(PATH.Error.NullOrUndefined([])).to.equal(null);
      });
    });

    describe('PathError(p)', () => {
      it(`Returns 'undefined' if p is undefined.`, () => {
        EXPECT(PATH.Error.PathError(undefined)).to.equal('undefined');
      });

      it(`Returns 'null' if p is null.`, () => {
        EXPECT(PATH.Error.PathError(null)).to.equal('null');
      });

      it(`Returns 'not a string' if p is not string type.`, () => {
        EXPECT(PATH.Error.PathError(1)).to.equal('not a string');
        EXPECT(PATH.Error.PathError([])).to.equal('not a string');
        EXPECT(PATH.Error.PathError(true)).to.equal('not a string');
      });

      it(`Returns 'empty' if p is empty.`, () => {
        EXPECT(PATH.Error.PathError('')).to.equal('empty');
      });

      it(`Returns 'whitespace' if p is all whitespace.`, () => {
        EXPECT(PATH.Error.PathError(' ')).to.equal('whitespace');
        EXPECT(PATH.Error.PathError('\t')).to.equal('whitespace');
        EXPECT(PATH.Error.PathError('\n  \t   ')).to.equal('whitespace');
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
            let invalidType = PATH.Error.PathError(invalidPath);
            EXPECT(error).to.equal(`Path is ${invalidType}`);
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
            let invalidType = PATH.Error.PathError(invalidPath);
            EXPECT(error).to.equal(`Path is ${invalidType}`);
          });
      });
    });

    describe('IsDir(path)', () => {
      it('Returns error if path is invalid.', () => {
        PATH.Path.IsDir(invalidPath).then(o => EXPECT(false))
          .catch(error => {
            let invalidType = PATH.Error.PathError(invalidPath);
            EXPECT(error).to.equal(`Path is ${invalidType}`);
          });
      });
    });

    describe('Filename(path)', () => {
      it('Returns error if path is invalid.', () => {
        let invalidType = PATH.Error.PathError(invalidPath);
        let o = PATH.Path.Filename(invalidPath);
        if (o.error)
          EXPECT(o.error).to.equal(`Path is ${invalidType}`);
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
        let invalidType = PATH.Error.PathError(invalidPath);
        let o = PATH.Path.Extension(invalidPath);
        if (o.error)
          EXPECT(o.error).to.equal(`Path is ${invalidType}`);
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
          EXPECT(o.error).to.equal(`Path is ${invalidType}`);
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
          EXPECT(o.error).to.equal(`Path is ${invalidType}`);
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
        let invalidType = PATH.Error.PathError(invalidPath);
        let o = PATH.Path.Escape(invalidPath);
        if (o.error)
          EXPECT(o.error).to.equal(`Path is ${invalidType}`);
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
        let invalidType = PATH.Error.PathError(invalidPath);
        let o = PATH.Path.ContainsWhitespace(invalidPath);
        if (o.error)
          EXPECT(o.error).to.equal(`Path is ${invalidType}`);
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