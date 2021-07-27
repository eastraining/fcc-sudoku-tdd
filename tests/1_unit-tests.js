const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
const puzzleStrings = require('../controllers/puzzle-strings.js');
let solver = new Solver();

suite('UnitTests', () => {

  suite('Tests for validate method', function() {
    // #1
    test('Logic handles a valid puzzle string of 81 characters', function() {
      assert.isOk(solver.validate(puzzleStrings[0][0]), '81-character string of 1-9 and . is ok');
    });
    // #2
    test('Logic handles a puzzle string with invalid characters', function() {
      assert.isNotOk(solver.validate(puzzleStrings[1][0].slice(0, 80).concat('a')), '81-character string which includes non 1-9 or . is not ok');
    });
    // #3
    test('Logic handles a puzzle string that is not 81 characters in length', function() {
      assert.isNotOk(solver.validate('123456.3345345...123'), 'Non-81-character string is not ok');
    });
  });

  suite('Tests for checkRowPlacement method', function() {
    // #4
    test('Logic handles a valid row placement', function() {
      assert.isOk(solver.checkRowPlacement())
    })
  })

});
