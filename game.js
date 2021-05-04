const players = require("./players");

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("new game", (cb) => {
      const { gameId } = players.newGame(socket.id);
      socket.join(gameId);
      cb(gameId);
    });

    socket.on("join", (gameId, cb) => {
      const err = players.join(socket.id, gameId);
      if (!err) socket.join(gameId);
      cb(err, players.isOpponentReady(socket.id));
    });

    socket.on("join alert", () => {
      io.to(players.getOpponentSocketId(socket.id)).emit("join alert");
    });

    socket.on("ready", (matrix, matrixBot, cb) => {
      players.setIsReady(socket.id, true);
      players.setMatrix(socket.id, matrix);
      players.setMatrixBot(socket.id, matrixBot);
      const isOpponentReady = players.isOpponentReady(socket.id);
      const meFirst = Math.random() < 0.5;
      socket.broadcast
        .to(players.getGameId(socket.id))
        .emit("ready", isOpponentReady, !meFirst);
      cb(isOpponentReady, meFirst);
    });

    socket.on("not ready", () => {
      players.setIsReady(socket.id, false);
    });

    socket.on("hit", (row, col, cb) => {
      const opponentSocketId = players.getOpponentSocketId(socket.id);
      const cell = players.hit(opponentSocketId, row, col);
      const isGameOver =
        cell && cell.ship && players.isGameOver(opponentSocketId);
      io.to(opponentSocketId).emit("hit", row, col, cell, isGameOver);
      cb(cell, isGameOver);
    });

    socket.on("hit bot", (row, col, cb) => {
      const cell = players.hitBot(socket.id, row, col);
      const isGameOverVsBot =
        cell && cell.ship && players.isGameOverVsBot(socket.id);
      cb(cell, isGameOverVsBot);
    });

    socket.on("bot hit", (row, col, cb) => {
      const cell = players.botHit(socket.id, row, col);
      const isGameOver = cell && cell.ship && players.isGameOver(socket.id);
      cb(cell, isGameOver);
    });

    socket.on("leave", () => {
      leave(socket);
    });

    socket.on("disconnect", () => {
      leave(socket);
    });
  });
};

const leave = (socket) => {
  const gameId = players.getGameId(socket.id);
  players.leave(socket.id);
  socket.broadcast.to(gameId).emit("leave");
  socket.leave(gameId);
};
