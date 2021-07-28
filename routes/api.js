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
  const createErr = msg => {
    return { error: msg };
  }
  
  app.route('/api/check')
    .post((req, res) => {
      const sendErr = msg => res.json(createErr(msg));
      const checkedInput = validateCheckInput(req.body);
      if (checkedInput.includes(null)) {
        sendErr('Required field(s) missing');
        return;
      } 

      const [puzzle, coordinate, value] = [...checkedInput];
      if (!coordinate) {
        sendErr('Invalid coordinate');
        return;
      } else if (!value) {
        sendErr('Invalid value');
        return;
      }

      const puzzleInvalid = validateTranslator(solver.validate(puzzle));
      if (puzzleInvalid) {
        sendErr(puzzleInvalid);
        return;
      }

      const conflicts = solver.checkAllPlacement(puzzle, 
        coordinate[0], coordinate[1], value);
      const conflictTemplate = ['row', 'column', 'region'];
      let result = {};
      if (conflicts.includes(false)) {
        result.valid = false;
        result.conflict = [];
        conflicts.forEach((x, i) => {
          if (!x) { result.conflict.push(conflictTemplate[i]) }
        })
      } else {
        result.valid = true;
      }
      res.json(result);
    });
    
  app.route('/api/solve')
    .post((req, res) => {
      const sendErr = msg => res.json(createErr(msg));
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
