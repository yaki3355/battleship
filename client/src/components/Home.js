import { useHistory } from "react-router-dom";
import {
  TextField,
  Button,
  Container,
  CssBaseline,
  makeStyles,
  Grid,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { useState } from "react";

import socket from "../socketConfig";

const Home = ({ setExitBtn, setShowGameId }) => {
  const [gameId, setGameId] = useState("");
  const [alert, setAlert] = useState();
  const history = useHistory();
  const classes = useStyles();

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <form className={classes.form}>
          <Grid container spacing={2} style={{ marginTop: 10 }}>
            <Grid item xs={6}>
              <TextField
                variant="outlined"
                fullWidth
                label="Game Id"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                fullWidth
                label="Join"
                style={{ height: 55 }}
                onClick={() =>
                  join(gameId, history, setAlert, setExitBtn, setShowGameId)
                }
              >
                Join
              </Button>
            </Grid>
          </Grid>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.newGameBtn}
            onClick={() => newGame(history, setExitBtn, false, setShowGameId)}
          >
            New game
          </Button>
          <Button
            onClick={() => newGame(history, setExitBtn, true)}
            style={{
              marginTop: "6px",
              backgroundColor: "black",
              width: "inherit",
            }}
          >
            <i
              className="fas fa-robot"
              style={{ fontSize: "30px", color: "white" }}
            ></i>
          </Button>
        </form>
      </div>
      <div style={{ marginTop: "20px" }}>
        {alert && <Alert severity="error">{alert}</Alert>}
      </div>
    </Container>
  );
};

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  newGameBtn: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const newGame = (history, setExitBtn, vsBot, setShowGameId) => {
  socket.emit("new game", (gameId) => {
    setExitBtn(true);
    vsBot || setShowGameId(true);
    history.push({ pathname: "/game", gameId, vsBot });
  });
};

const join = (gameId, history, setAlert, setExitBtn, setShowGameId) => {
  socket.emit("join", gameId, (err, isOpponentReady) => {
    if (err) return setAlert(err);
    setExitBtn(true);
    setShowGameId(true);
    history.push({ pathname: "/game", gameId, isOpponentReady, vsBot: false });
  });
};

export default Home;
