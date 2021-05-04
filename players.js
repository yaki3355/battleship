const players = {};

const newGame = (socketId) => {
  return (players[socketId] = { gameId: rndStr() });
};

const join = (socketId, gameId) => {
  const c = countByGameId(gameId);

  if (c === 0) return `Game Id '${gameId}' not exists`;
  if (c >= 2) return "Room is full";

  players[socketId] = { gameId };
};

const leave = (socketId) => {
  delete players[socketId];
};

const getGameId = (socketId) => {
  return players[socketId]?.gameId;
};

const setIsReady = (socketId, bool) => {
  (players[socketId] || {}).isReady = bool;
};

const isOpponentReady = (socketId) => {
  return players[getOpponentSocketId(socketId)]?.isReady;
};

const setIsReadyOpponent = (socketId, bool) => {
  (players[getOpponentSocketId(socketId)] || {}).isReady = bool;
};

const amIReady = (socketId) => {
  return players[socketId].isReady;
};

const getOpponentSocketId = (socketId) => {
  const gameId = getGameId(socketId);
  return Object.keys(players).find(
    (k) => socketId !== k && gameId === getGameId(k)
  );
};

const setMatrix = (socketId, matrix) => {
  players[socketId].matrix = matrix;
};

const hit = (opponentSocketId, row, col) => {
  return hitUtil(opponentSocketId, row, col);
};

const hitBot = (socketId, row, col) => {
  const cell = players[socketId].matrixBot[row][col];
  if (cell.hit) return;
  cell.backgroundColor = cell.ship ? "red" : "grey";
  cell.hit = true;
  return cell;
};

const botHit = (socketId, row, col) => {
  return hitUtil(socketId, row, col);
};

const isGameOver = (opponentSocketId) => {
  return players[opponentSocketId].matrix.every((row) =>
    row.every((cell) => (cell.ship ? cell.hit : true))
  );
};

const isGameOverVsBot = (socketId) => {
  return players[socketId].matrixBot.every((row) =>
    row.every((cell) => (cell.ship ? cell.hit : true))
  );
};

const setMatrixBot = (socketId, matrixBot) => {
  players[socketId].matrixBot = matrixBot;
};

module.exports = {
  newGame,
  join,
  leave,
  getGameId,
  setIsReady,
  isOpponentReady,
  setIsReadyOpponent,
  amIReady,
  getOpponentSocketId,
  setMatrix,
  hit,
  isGameOver,
  setMatrixBot,
  hitBot,
  isGameOverVsBot,
  botHit,
};

const rndStr = () => Math.random().toString(36).substring(7);

const countByGameId = (gameId) =>
  Object.values(players).reduce((c, v) => c + (gameId === v.gameId), 0);

const hitUtil = (socketId, row, col) => {
  const cell = players[socketId].matrix[row][col];
  if (cell.hit) return;
  cell.backgroundColor = cell.ship ? "red" : "grey";
  cell.hit = true;
  return cell;
};
