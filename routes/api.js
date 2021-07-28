'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  const validateCoordinate = coordinate => /^[A-I][1-9]$/.test(coordinate);
  const validateValue = value => /^[1-9]$/.test(value);
  const validateCheckInput = (inputObj) => {
    return [
      inputObj.puzzle || null,
      inputObj.coordinate ? 
      validateCoordinate(inputObj.coordinate) && inputObj.coordinate : null,
      inputObj.value ? 
      validateValue(inputObj.value) && inputObj.value : null
    ];
  }
  const validateTranslator = (validateResult) => {
    if (validateResult[0] === false) {
      return 'Expected puzzle to be 81 characters long';
    } else if (validateResult[1] === false) {
      return 'Invalid characters in puzzle';
    } else {
      return false;
    }
  }
  const sendErr = (msg) => {
    return res.json({ error: msg });
  }
  
  app.route('/api/check')
    .post((req, res) => {
      const checkedInput = validateCheckInput(req.body);
      if (checkedInput.includes(null)) {
        sendErr('Required field(s) missing');
        return;
      } 
      const [puzzle, coordinate, value] = [...checkedInput];
      if (!coordinate) {
        
      }
      const puzzleInvalid = validateTranslator(solver.validate(puzzle));
      if (puzzleInvalid) {
        sendErr(puzzleInvalid);
        return;
      }

    });
    
  app.route('/api/solve')
    .post((req, res) => {
      const puzzle = req.body.puzzle || null; 
      if (!req.body.puzzle) {
        sendErr('Required field missing');
      } else {
        const result = solver.solve(puzzle);
        if (!result) {
          sendErr('Puzzle cannot be solved')
        } else if (Array.isArray(result) && result.includes(false)) {
          sendErr(validateTranslator(result));
        } else {
          res.json({ solution: result });
        }
      }
    });
};
