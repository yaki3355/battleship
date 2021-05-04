import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Grid,
  IconButton,
  makeStyles,
  Tooltip,
  Typography,
} from "@material-ui/core";
import ShuffleIcon from "@material-ui/icons/Shuffle";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import Alert from "@material-ui/lab/Alert";

import Battlefield from "./Battlefield";
import socket from "../socketConfig";
import utils from "../utils";
import bot from "../bot";

const Game = ({ setGameId, exitBtn, setExitBtn, setShowGameId }) => {
  const history = useHistory();
  const { isOpponentReady, gameId, vsBot } = history.location;
  const classes = useStyles();
  const lineThrough = "line-through";
  const [ready, setReady] = useState({
    you: lineThrough,
    opponent: isOpponentReady || vsBot ? "" : lineThrough,
  });
  const [btnDisabled, setBtnDisabled] = useState();
  const [turn, setTurn] = useState();
  const [dialog, setDialog] = useState({ open: false, title: "" });
  const [score, setScore] = useState({ you: 0, opponent: 0 });
  const [myMatrix, setMyMatrix] = useState(utils.newBoard(true));
  const [opponentMatrix, setOpponentMatrix] = useState(utils.newBoard());
  const [joinAlert, setJoinAlert] = useState();

  useEffect(() => {
    if (!gameId) history.push("/");
    vsBot ? setGameId(" ") : setGameId(gameId);
    socket.on("ready", (amIReady, turn) => {
      setReady((prev) => ({ ...prev, opponent: "" }));
      if (amIReady) {
        setTurn(turn);
      }
    });
    socket.on("leave", () => {
      socket.emit("not ready");
      setReady({ you: lineThrough, opponent: lineThrough });
      setBtnDisabled();
      setTurn();
      setScore({ you: 0, opponent: 0 });
      setDialog({ open: true, title: `${vsBot ? "Bot" : "Opponent"} left` });
    });
    socket.emit("join alert");
    socket.on("join alert", () => {
      setJoinAlert(true);
      setTimeout(() => {
        setJoinAlert();
      }, 3000);
    });
    return () => {
      setGameId();
      setExitBtn();
      setShowGameId();
      socket.removeAllListeners();
      socket.emit("leave");
    };
  }, []);

  useEffect(() => {
    if (!exitBtn) history.push("/");
  }, [exitBtn]);

  useEffect(() => {
    bot.setBotData({
      matrixTrack: utils.newBoard(),
      shipArr: [...utils.shipArr],
    });
    if (!score.lastWinner) return;
    socket.emit("not ready");
    setReady({ you: lineThrough, opponent: vsBot ? "" : lineThrough });
    setDialog({ open: true, title: `${score.lastWinner} won` });
  }, [score]);

  const emitReady = () => {
    socket.emit(
      "ready",
      myMatrix,
      vsBot && utils.newBoard(true),
      (isOpponentReady, turn) => {
        setReady((prev) => ({ ...prev, you: "" }));
        setBtnDisabled(true);
        if (isOpponentReady || vsBot) {
          setTurn(turn);
        }
      }
    );
  };

  const dialogHandleClose = () => {
    setMyMatrix(utils.newBoard(true));
    setOpponentMatrix(utils.newBoard());
    setBtnDisabled();
    setTurn();
    setDialog({ open: false, title: "" });
  };

  return (
    <Grid container className={classes.root} spacing={2}>
      <Grid item xs={12}>
        <Grid container justify="center" spacing={10}>
          <Grid item>
            <Typography style={{ textDecoration: ready.you }}>Ready</Typography>
            <Typography>You ({score.you})</Typography>
            <Battlefield
              className={classes.battlefield}
              isMyBoard={true}
              matrix={myMatrix}
              setMyMatrix={setMyMatrix}
              setTurn={setTurn}
              setScore={setScore}
            />
            <Button
              variant="outlined"
              onClick={emitReady}
              disabled={btnDisabled}
            >
              Start
            </Button>
            <Tooltip title="New board">
              <IconButton
                color="primary"
                disabled={btnDisabled}
                onClick={() => setMyMatrix(utils.newBoard(true))}
              >
                <ShuffleIcon />
              </IconButton>
            </Tooltip>
          </Grid>
          {turn === true && <ArrowBackIcon className={classes.arrow} />}
          {turn === false && <ArrowForwardIcon className={classes.arrow} />}
          <Grid item>
            <Typography style={{ textDecoration: ready.opponent }}>
              Ready
            </Typography>
            <Typography>
              {vsBot ? "Bot" : "Opponent"} ({score.opponent})
            </Typography>
            <Battlefield
              className={classes.battlefield}
              turn={turn}
              setTurn={setTurn}
              matrix={opponentMatrix}
              setOpponentMatrix={setOpponentMatrix}
              setScore={setScore}
              vsBot={vsBot}
              setMyMatrix={setMyMatrix}
            />
            {joinAlert && <Alert severity="success">Opponent joined</Alert>}
          </Grid>
        </Grid>
      </Grid>
      <Dialog open={dialog.open} onClose={dialogHandleClose}>
        <DialogTitle>{dialog.title}</DialogTitle>
        <DialogActions>
          <Button onClick={dialogHandleClose} color="primary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    paddingTop: theme.spacing(4),
  },
  battlefield: {
    height: 140,
    width: 100,
  },
  arrow: {
    marginTop: "65px",
    position: "absolute",
  },
}));

export default Game;
