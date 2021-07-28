class SudokuSolver {
  constructor(gridSide = 9) {
    this.GRID_SIDE = gridSide;
    this.REGION_SIDE = Math.floor(Math.sqrt(gridSide));
  }

  rowToIdx(char) {
    return typeof char === 'number' ?
    char : Number(char.charCodeAt() - 'A'.charCodeAt());
  }
  colToIdx(num) {
    return typeof num === 'number' ?
    num : Number(num - 1);
  }
  

  validate(puzzleString) {
    return [puzzleString.length === 81, /^[\d.]+$/.test(puzzleString)];
  }

  checkRowPlacement(puzzleString, row, column, value, verify = true) {
    const rowIdx = this.rowToIdx(row);
    const colIdx = this.colToIdx(column);
    const rowOfVal = rowIdx * this.GRID_SIDE;
    const rowEnd = (rowIdx + 1) * this.GRID_SIDE;
    const valPosition = rowOfVal + colIdx;
    const testVals = puzzleString.slice(rowOfVal, valPosition)
    .concat(puzzleString.slice(valPosition + 1, rowEnd));
    return verify ? !testVals.includes(String(value)) : testVals;
  }

  checkColPlacement(puzzleString, row, column, value, verify = true) {
    const rowIdx = this.rowToIdx(row);
    const colIdx = this.colToIdx(column);
    const rowOfVal = rowIdx * this.GRID_SIDE;
    const valPosition = rowOfVal + colIdx;
    let testVals = ""; 
    for (let i = 0, n = this.GRID_SIDE; i < n; i++) {
      let currIdx = i * this.GRID_SIDE + colIdx;
      testVals = currIdx === valPosition ? testVals :
      testVals.concat(puzzleString.charAt(currIdx));
    }
    return verify ? !testVals.includes(String(value)) : testVals;
  }

  checkRegionPlacement(puzzleString, row, column, value, verify = true) {
    const rowIdx = this.rowToIdx(row);
    const colIdx = this.colToIdx(column);
    const startRow = Math.floor(rowIdx / this.REGION_SIDE) * this.REGION_SIDE 
    * this.GRID_SIDE;
    const startCol = Math.floor(colIdx / this.REGION_SIDE) * this.REGION_SIDE;
    const rowOfVal = rowIdx * this.GRID_SIDE;
    const valPosition = rowOfVal + colIdx;
    let testVals = ""; 
    for (let i = 0, n = this.REGION_SIDE; i < n; i++) {
      for (let j = 0, m = this.REGION_SIDE; j < m; j++) {
        let currIdx = startRow + i * this.GRID_SIDE + startCol + j;
        testVals = currIdx === valPosition ? testVals :
        testVals.concat(puzzleString.charAt(currIdx));
      }
    }
    return verify ? !testVals.includes(String(value)) : testVals;
  }

  solve(puzzleString) {
    let valid = this.validate(puzzleString);
    if (valid.includes(false)) {
      return valid;
    }
    
    // need to use arrow function here up to initial Class method
    // in order to preserve Class context as "this"
    // to access other Class methods
    const checkNum = (puzzleString, row, column, value, verify = true) => {
      const args = [puzzleString, row, column, value, verify];
      return [
        this.checkRowPlacement(...args),
        this.checkColPlacement(...args),
        this.checkRegionPlacement(...args)
      ];
    }

    if (/^\d+$/.test(puzzleString)) {
      for (let idx = 0, n = puzzleString.length; idx < n; idx++) {
        let char = puzzleString[idx];
        const rowIdx = Math.floor(idx / this.GRID_SIDE);
        const colIdx = idx % this.GRID_SIDE;
        let result = checkNum(puzzleString, rowIdx, colIdx, char);
        if (result.includes(false)) {
          return false;
        }
      }
      return puzzleString;
    } else {
      // structure of each missing number shall be:
      // [ idx, [ possible numbers for the cell at that index... ] ] 
      let missingNums = [];
      
      let solvedString = puzzleString.slice();
      function updateSolved(idx, char) {
        solvedString = solvedString.slice(0, idx).concat(char)
        .concat(solvedString.slice(idx + 1));
      }
      
      // create restraints on possible values
      // and fill in trivial answers at the same time
      for (let idx = 0, n = puzzleString.length; idx < n; idx++) {
        let char = puzzleString[idx];
        if (char !== '.') {
          continue;
        } else {
          let currCell = [idx, []];
          const rowIdx = Math.floor(idx / 9);
          const colIdx = idx % 9;
          const result = checkNum(solvedString, rowIdx, colIdx, char, false).join('');
          for (let j = 1, m = 9; j <= m; j++) {
            if(!result.includes(String(j))) {
              currCell[1].push(String(j));
            }
          }
          if (currCell[1].length === 0) {
            return false;
          } else if (currCell[1].length === 1) {
            updateSolved(idx, currCell[1][0]);
          } else {
            missingNums.push(currCell);
          }
        }
      };

      // sort missingNums so can start trial and error with
      // cells that have the tightest constraints
      missingNums.sort((x, y) => {
        return x[1].length - y[1].length; 
      });

      // recursive function for trial and error and backtracking
      const checkCell = (missingIdx = 0) => { 
        if (missingIdx < 0) {
          return false;
        } else if (missingIdx === missingNums.length) {
          return /^\d{81}$/.test(solvedString) ? solvedString : false;
        } else {
          const currCell = missingNums[missingIdx];
          const puzzleIdx = currCell[0];
          const rowIdx = Math.floor(puzzleIdx / this.GRID_SIDE);
          const colIdx = puzzleIdx % this.GRID_SIDE;
          const tryNums = currCell[1];
          const puzzleVal = solvedString[puzzleIdx];
          const tryNumStartIdx = tryNums.indexOf(puzzleVal) + 1;
          for (let i = tryNumStartIdx, n = tryNums.length; i < n; i++) {
            let tryNum = tryNums[i];
            let result = checkNum(solvedString, rowIdx, colIdx, tryNum);
            if (result.includes(false)) {
              continue;
            } else {
              updateSolved(puzzleIdx, tryNum);
              return checkCell(missingIdx + 1);
            }
          }
          updateSolved(puzzleIdx, '.');
          return checkCell(missingIdx - 1);
        }
      }

      return checkCell(0);
    }
  }
}

module.exports = SudokuSolver;

