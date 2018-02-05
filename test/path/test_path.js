let EXPECT = require('chai').expect;

let _PATH = require('path');
let rootDir = _PATH.join(__dirname, '..', '..');

let pathJs = _PATH.join(rootDir, 'path.js');
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
        PATH.Path.Exists(invalidPath).then(o => {
          EXPECT(o.error).to.equal(null);
        }).catch((e) => {
          EXPECT(e.error).to.equal('Path is empty');
        });
      });

      it('Returns boolean value if path is valid.', () => {
        PATH.Path.Exists(validPath).then(o => {
          EXPECT(o.exists).to.equal(false);
        }).catch((e) => {
          EXPECT(e.error).to.equal(null);
        });
      });
    });

    describe('IsFile(path)', () => {
      it('Returns error if path is invalid.', () => {
        PATH.Path.IsFile(invalidPath).then(o => {
          EXPECT(o.error).to.equal(null);
        }).catch((e) => {
          EXPECT(e.error).to.not.equal(null);
        });
      });
    });

    describe('IsDir(path)', () => {
      it('Returns error if path is invalid.', () => {
        PATH.Path.IsDir(invalidPath).then(o => {
          EXPECT(o.error).to.equal(null);
        }).catch((e) => {
          EXPECT(e.error).to.not.equal(null);
        });
      });
    });

    describe('Filename(path)', () => {
      it('Returns error if path is invalid.', () => {
        let o = PATH.Path.Filename(invalidPath);
        EXPECT(o.error).to.not.equal(null);
      });

      it('Returns string if path is valid.', () => {
        let o = PATH.Path.Filename(validPath);
        EXPECT(o.name).to.equal('file.txt');
      });
    });

    describe('Extension(path)', () => {
      it('Returns error if path is invalid.', () => {
        let o = PATH.Path.Extension(invalidPath);
        EXPECT(o.error).to.not.equal(null);
      });

      it('Returns string if path is valid.', () => {
        let o = PATH.Path.Extension(validPath);
        EXPECT(o.extension).to.equal('txt');
      });
    });

    describe('ParentDirName(path)', () => {
      it('Returns error if path is invalid.', () => {
        let o = PATH.Path.ParentDirName(invalidPath);
        EXPECT(o.error).to.not.equal(null);
      });

      it('Returns string if path is valid.', () => {
        let o = PATH.Path.ParentDirName(validPath);
        EXPECT(o.name).to.equal('to');
      });
    });

    describe('ParentDir(path)', () => {
      it('Returns error if path is invalid.', () => {
        let o = PATH.Path.ParentDir(invalidPath);
        EXPECT(o.error).to.not.equal(null);
      });

      it('Returns string if path is valid.', () => {
        let o = PATH.Path.ParentDir(validPath);
        EXPECT(o.dir).to.equal('/path/to/');
      });
    });

    describe('Escape(path)', () => {
      it('Returns error if path is invalid.', () => {
        let o = PATH.Path.Escape(invalidPath);
        EXPECT(o.error).to.not.equal(null);
      });

      it('Returns string if path is valid.', () => {
        let o = PATH.Path.Escape(validPath);
        EXPECT(o.string).to.equal('/path/to/');
      });
    });

    describe('ContainsWhitespace(path)', () => {
      it('Returns error if path is invalid.', () => {
        let o = PATH.Path.ContainsWhitespace(invalidPath);
        EXPECT(o.error).to.not.equal(null);
      });

      it('Returns boolean if path is valid.', () => {
        let o = PATH.Path.ContainsWhitespacecape(validPath);
        EXPECT(o.hasWhitespace).to.equal(false);
      });
    });
  });
});