const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
import { puzzlesAndSolutions } from '../controllers/puzzle-strings.js';
let solver = new Solver();

suite('UnitTests', () => {

  suite('Tests for validate method', function() {
    // #1
    test('Logic handles a valid puzzle string of 81 characters', function() {
      assert.sameOrderedMembers(solver.validate(puzzlesAndSolutions[0][0]), [true, true]);
    });
    // #2
    test('Logic handles a puzzle string with invalid characters', function() {
      assert.sameOrderedMembers(solver.validate(puzzlesAndSolutions[1][0].slice(0, 80).concat('a')), [true, false]);
    });
    // #3
    test('Logic handles a puzzle string that is not 81 characters in length', function() {
      assert.sameOrderedMembers(solver.validate('123456.3345345...123'), [false, true]);
    });
  });

  suite('Tests for checkRowPlacement method', function() {
    // #4
    test('Logic handles a valid row placement', function() {
      assert.isOk(solver.checkRowPlacement(puzzlesAndSolutions[0][0], 'A', '2', '3'));
    });
    // #5
    test('Logic handles an invalid row placement', function() {
      assert.isNotOk(solver.checkRowPlacement(puzzlesAndSolutions[2][0], 'A', '1', '9'));
    });
  });

  suite('Tests for checkColPlacement method', function() {
    // #6
    test('Logic handles a valid column placement', function() {
      assert.isOk(solver.checkColPlacement(puzzlesAndSolutions[1][0], 'A', '3', '8'));
    });
    // #7
    test('Logic handles an invalid column placement', function() {
      assert.isNotOk(solver.checkColPlacement(puzzlesAndSolutions[0][0], 'A', '4', '3'));
    });
  });

  suite('Tests for checkRegionPlacement method', function() {
    // #8
    test('Logic handles a valid region (3x3 grid) placement', function() {
      assert.isOk(solver.checkRegionPlacement(puzzlesAndSolutions[4][0], 'A', '3', '7'));
    });
    // #9
    test('Logic handles an invalid region (3x3 grid) placement', function() {
      assert.isNotOk(solver.checkRegionPlacement(puzzlesAndSolutions[4][0], 'A', '3', '1'));
    });
  });

  suite('Tests for solve method', function() {
    // #10
    test('Valid puzzle strings pass the solver', function() {
      assert.equal(solver.solve(puzzlesAndSolutions[3][1]), puzzlesAndSolutions[3][1]);
    });
    // #11
    test('Invalid puzzle strings fail the solver', function() {
      assert.sameOrderedMembers(solver.solve(puzzlesAndSolutions[3][1].slice(0, 80).concat('a')), [true, false]);
    });
    // #12
    test('Solver returns the expected solution for an incomplete puzzle', 
    function() {
      assert.equal(solver.solve(puzzlesAndSolutions[3][0]), puzzlesAndSolutions[3][1]);
    }); 
  });
});
