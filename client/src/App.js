import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  Toolbar,
  Typography,
} from "@material-ui/core";
import DirectionsBoatIcon from "@material-ui/icons/DirectionsBoat";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import { useEffect, useState } from "react";

import Game from "./components/Game";
import Home from "./components/Home";
import socket from "./socketConfig";

function App() {
  const [gameId, setGameId] = useState();
  const [showGameId, setShowGameId] = useState();
  const [exitBtn, setExitBtn] = useState();

  useEffect(() => {
    return () => socket.disconnect();
  }, []);

  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <DirectionsBoatIcon />
          <Typography variant="h6">Battleship</Typography>
          {exitBtn && (
            <Button
              variant="contained"
              color="default"
              startIcon={<ExitToAppIcon />}
              style={{ marginLeft: "auto" }}
              onClick={() => setExitBtn()}
            >
              Exit
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <main>
        <div>
          <Container maxWidth="sm">
            <Typography
              variant="h2"
              align="center"
              color="textPrimary"
              gutterBottom
            >
              Battleship
            </Typography>
            {gameId && (
              <Typography
                variant="h5"
                align="center"
                color="textPrimary"
                gutterBottom
                style={{ visibility: showGameId ? "visible" : "hidden" }}
              >
                Game Id: {gameId}
              </Typography>
            )}
            <Box>
              <Router>
                <Switch>
                  <Route exact path="/">
                    <Home
                      setExitBtn={setExitBtn}
                      setShowGameId={setShowGameId}
                    />
                  </Route>
                  <Route exact path="/game">
                    <Game
                      setGameId={setGameId}
                      exitBtn={exitBtn}
                      setExitBtn={setExitBtn}
                      setShowGameId={setShowGameId}
                    />
                  </Route>
                </Switch>
              </Router>
            </Box>
          </Container>
        </div>
      </main>
    </>
  );
}

export default App;
