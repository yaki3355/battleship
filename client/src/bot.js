import socket from "./socketConfig";
import utils from "./utils";
import Cell from "./cell";

const hitBot = (row, col, setTurn, setOpponentMatrix, setScore) => {
  socket.emit("hit bot", row, col, (cell, isGameOver) => {
    utils.hit(row, col, cell, isGameOver, setOpponentMatrix, setTurn, setScore);
  });
};

const setBotData = ({ matrixTrack, shipArr }) => {
  Cell.matrixTrack = matrixTrack;
  Cell.shipArr = shipArr;
};

const ce = new Cell();

const botHit = (setTurn, setMyMatrix, setScore) => {
  setTimeout(() => {
    const [row, col] = getRowCol();
    socket.emit("bot hit", row, col, (cell, isGameOver) => {
      if (!cell) return botHit(setTurn, setMyMatrix, setScore);
      setMyMatrix((prev) => utils.getUpdatedMatrix(prev, row, col, cell));
      if (!cell.ship) {
        ce.miss(row, col);
        return setTurn(true);
      }
      ce.hit(row, col);
      if (isGameOver) {
        return setScore((prev) => ({
          you: prev.you,
          opponent: prev.opponent + 1,
          lastWinner: "Bot",
        }));
      }
      botHit(setTurn, setMyMatrix, setScore);
    });
  }, 100);
};

const bot = {
  hitBot,
  botHit,
  setBotData,
};

export default bot;

const getRowCol = () => {
  if (ce.onShip()) return ce.nextCoordinates();

  const { nrow, ncol } = utils;

  let r = Math.floor(Math.random() * nrow);
  let c = Math.floor(Math.random() * ncol);

  for (; r < nrow; r = (r + 1) % nrow) {
    for (; c < ncol; ++c) {
      if (ce.find(r, c)) return [r, c];
    }
    c = 0;
  }
};
