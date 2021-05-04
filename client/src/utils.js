const getUpdatedMatrix = (matrix, row, col, cell) => {
  const mat = [...matrix];
  mat[row] = [...mat[row]];
  mat[row][col] = cell;
  return mat;
};

const hit = (
  row,
  col,
  cell,
  isGameOver,
  setOpponentMatrix,
  setTurn,
  setScore
) => {
  if (!cell) return;
  setOpponentMatrix((prev) => getUpdatedMatrix(prev, row, col, cell));
  if (!cell.ship) return setTurn(false);
  if (isGameOver)
    setScore((prev) => ({
      you: prev.you + 1,
      opponent: prev.opponent,
      lastWinner: "You",
    }));
};

const nrow = 10;
const ncol = 10;
const shipArr = [5, 4, 3, 3, 2];

const newBoard = (ships) => {
  const matrix = [...Array(nrow)].map((row) =>
    [...Array(ncol)].map((col) => ({
      backgroundColor: "#03cffc",
      ship: false,
      hit: false,
    }))
  );
  return ships ? newBoardUtil(matrix) : matrix;
};

const shuffleArr = (arr) => {
  const len = arr.length;

  for (let i = 0, to = len - 1; i < to; ++i) {
    const r = Math.floor(Math.random() * (arr.length - i - 1)) + i + 1;
    const temp = arr[i];
    arr[i] = arr[r];
    arr[r] = temp;
  }

  return arr;
};

const utils = {
  getUpdatedMatrix,
  hit,
  newBoard,
  shipArr,
  nrow,
  ncol,
  shuffleArr,
};

export default utils;

const newBoardUtil = (matrix) => {
  shipArr.forEach((len) => {
    newBoardUtilPositions(matrix, len);
  });

  return matrix;
};

const newBoardUtilPositions = (matrix, len) => {
  while (true) {
    const i = Math.floor(Math.random() * nrow);
    const j = Math.floor(Math.random() * ncol);
    const direction = shuffleArr([
      [-1, 0],
      [0, 1],
      [1, 0],
      [0, -1],
    ]).find((dir) =>
      [...Array(len)].every((_, idx) =>
        is9Clear(matrix, i + dir[0] * idx, j + dir[1] * idx)
      )
    );
    if (!direction) continue;
    [...Array(len)].forEach(
      (_, idx) =>
        (matrix[i + direction[0] * idx][j + direction[1] * idx].ship = true)
    );
    break;
  }
};

const is9Clear = (matrix, row, col) => {
  return (
    row >= 0 &&
    row < matrix.length &&
    col >= 0 &&
    col < matrix[row].length &&
    !matrix[row][col].ship &&
    [
      [-1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
      [1, 0],
      [1, -1],
      [0, -1],
      [-1, -1],
    ].every((dir) => {
      const i = row + dir[0];
      const j = col + dir[1];
      return (
        i < 0 ||
        j < 0 ||
        i >= matrix.length ||
        j >= matrix[i].length ||
        !matrix[i][j].ship
      );
    })
  );
};
