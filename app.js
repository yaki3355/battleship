const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const path = require("path");

require("./game")(io);

app.use(express.static(path.resolve("public")));

app.use((req, res) => {
  res.sendStatus(404);
});

app.use((err, req, res, next) => {
  console.log(`Internal error: ${err}`);
  res.sendStatus(500);
});

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`Listening on port ${port}`));
