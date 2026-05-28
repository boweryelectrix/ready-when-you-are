const ROWS = 6;
const COLS = 7;
const boardElement = document.getElementById('board');
const statusText = document.getElementById('status-text');
const currentPlayerChip = document.getElementById('current-player');
const restartBtn = document.getElementById('restart-btn');
const modeSelect = document.getElementById('mode-select');

let board = [];
let currentPlayer = 1;
let gameActive = true;
let vsComputer = false;

function createBoard() {
  boardElement.innerHTML = '';
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell';
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('click', () => handleCellClick(col));
      boardElement.appendChild(cell);
    }
  }
}

function updateUI() {
  const cells = boardElement.querySelectorAll('.cell');
  cells.forEach((cell) => {
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    const value = board[row][col];
    cell.dataset.player = value || '';
    cell.classList.toggle('filled', Boolean(value));
  });
  currentPlayerChip.style.background = currentPlayer === 1 ? 'linear-gradient(145deg, #ffb7d9, #d558a7)' : 'linear-gradient(145deg, #111111, #333333)';
  if (!gameActive) {
    return;
  }
  if (vsComputer && currentPlayer === 2) {
    statusText.textContent = 'Computer is thinking...';
  } else {
    statusText.textContent = `Player ${currentPlayer} (${currentPlayer === 1 ? 'Pink' : 'Black'})'s turn`;
  }
}

function handleCellClick(col) {
  if (!gameActive) {
    return;
  }
  if (vsComputer && currentPlayer === 2) {
    return;
  }
  for (let row = ROWS - 1; row >= 0; row -= 1) {
    if (board[row][col] === 0) {
      board[row][col] = currentPlayer;
      const winningLine = checkWin(row, col);
      if (winningLine) {
        gameActive = false;
        highlightWinningCells(winningLine);
        boardElement.classList.add('win');
        statusText.textContent = `Player ${currentPlayer} wins!`;
      } else if (board.flat().every((cell) => cell !== 0)) {
        gameActive = false;
        statusText.textContent = 'It’s a draw!';
      } else {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updateUI();
        if (vsComputer && currentPlayer === 2 && gameActive) {
          setTimeout(makeComputerMove, 400);
        }
      }
      updateUI();
      return;
    }
  }
  statusText.textContent = 'That column is full. Choose another one.';
}

function dropDisc(col) {
  for (let row = ROWS - 1; row >= 0; row -= 1) {
    if (board[row][col] === 0) {
      board[row][col] = currentPlayer;
      const winningLine = checkWin(row, col);
      if (winningLine) {
        gameActive = false;
        highlightWinningCells(winningLine);
        boardElement.classList.add('win');
        statusText.textContent = currentPlayer === 2 && vsComputer ? 'Computer wins!' : `Player ${currentPlayer} wins!`;
      } else if (board.flat().every((cell) => cell !== 0)) {
        gameActive = false;
        statusText.textContent = 'It’s a draw!';
      } else {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updateUI();
        if (vsComputer && currentPlayer === 2 && gameActive) {
          setTimeout(makeComputerMove, 400);
        }
      }
      updateUI();
      return;
    }
  }
}

function makeComputerMove() {
  if (!gameActive || currentPlayer !== 2) {
    return;
  }
  const validCols = Array.from({ length: COLS }, (_, index) => index).filter((col) => board[0][col] === 0);
  if (!validCols.length) {
    return;
  }
  const winningMove = findWinningMove(2);
  const blockMove = winningMove === null ? findWinningMove(1) : null;
  const chosenCol = winningMove ?? blockMove ?? validCols[Math.floor(Math.random() * validCols.length)];
  dropDisc(chosenCol);
}

function findWinningMove(player) {
  for (let col = 0; col < COLS; col += 1) {
    if (board[0][col] !== 0) {
      continue;
    }
    for (let row = ROWS - 1; row >= 0; row -= 1) {
      if (board[row][col] === 0) {
        board[row][col] = player;
        const winning = checkWinForPlayer(row, col, player);
        board[row][col] = 0;
        if (winning) {
          return col;
        }
        break;
      }
    }
  }
  return null;
}

function checkWinForPlayer(row, col, player) {
  return (
    checkDirectionForPlayer(row, col, 0, 1, player) ||
    checkDirectionForPlayer(row, col, 1, 0, player) ||
    checkDirectionForPlayer(row, col, 1, 1, player) ||
    checkDirectionForPlayer(row, col, 1, -1, player)
  );
}

function checkDirectionForPlayer(row, col, dRow, dCol, player) {
  const line = [{ row, col }];
  line.push(...countDiscsForPlayer(row, col, dRow, dCol, player));
  line.push(...countDiscsForPlayer(row, col, -dRow, -dCol, player));
  return line.length >= 4 ? line : null;
}

function countDiscsForPlayer(row, col, dRow, dCol, player) {
  let r = row + dRow;
  let c = col + dCol;
  const coordinates = [];
  while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
    coordinates.push({ row: r, col: c });
    r += dRow;
    c += dCol;
  }
  return coordinates;
}

function checkWin(row, col) {
  return (
    checkDirection(row, col, 0, 1) ||
    checkDirection(row, col, 1, 0) ||
    checkDirection(row, col, 1, 1) ||
    checkDirection(row, col, 1, -1)
  );
}

function checkDirection(row, col, dRow, dCol) {
  const line = [{ row, col }];
  line.push(...countDiscs(row, col, dRow, dCol));
  line.push(...countDiscs(row, col, -dRow, -dCol));
  return line.length >= 4 ? line : null;
}

function countDiscs(row, col, dRow, dCol) {
  let r = row + dRow;
  let c = col + dCol;
  const coordinates = [];
  while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === currentPlayer) {
    coordinates.push({ row: r, col: c });
    r += dRow;
    c += dCol;
  }
  return coordinates;
}

function highlightWinningCells(winningLine) {
  boardElement.querySelectorAll('.cell.winner').forEach((cell) => cell.classList.remove('winner'));
  winningLine.forEach(({ row, col }) => {
    const cell = boardElement.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
      cell.classList.add('winner');
    }
  });

}

function restartGame() {
  currentPlayer = 1;
  gameActive = true;
  vsComputer = modeSelect.value === 'computer';
  createBoard();
  statusText.textContent = 'Player 1 (Pink) starts';
  boardElement.classList.remove('win');
  boardElement.querySelectorAll('.cell.winner').forEach((cell) => cell.classList.remove('winner'));
  updateUI();
}

restartBtn.addEventListener('click', restartGame);
modeSelect.addEventListener('change', restartGame);
createBoard();
vsComputer = modeSelect.value === 'computer';
updateUI();
