import { useEffect } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";

import socket from "../socketConfig";
import bot from "../bot";
import utils from "../utils";

export default function Battlefield({
  isMyBoard,
  turn,
  setTurn,
  matrix,
  setMyMatrix,
  setOpponentMatrix,
  setScore,
  vsBot,
}) {
  useEffect(() => {
    socket.on("hit", (row, col, cell, isGameOver) => {
      if (!isMyBoard || !cell) return;
      setMyMatrix((prev) => utils.getUpdatedMatrix(prev, row, col, cell));
      if (!cell.ship) return setTurn(true);
      if (isGameOver)
        setScore((prev) => ({
          you: prev.you,
          opponent: prev.opponent + 1,
          lastWinner: "Opponent",
        }));
    });
  }, []);

  useEffect(() => {
    if (vsBot && turn === false) bot.botHit(setTurn, setMyMatrix, setScore);
  }, [turn]);

  function RowShip({ row }) {
    return (
      <Row>
        <Col>
          {[...Array(utils.ncol)].map((_, col) => {
            const { backgroundColor, ship, hit } = matrix[row][col];
            return (
              <Button
                key={col}
                style={{
                  backgroundColor: backgroundColor,
                  borderWidth: "0.75px",
                  width: "22px",
                  height: "22px",
                }}
                onClick={() => {
                  if (isMyBoard || turn !== true) return;
                  if (vsBot)
                    return bot.hitBot(
                      row,
                      col,
                      setTurn,
                      setOpponentMatrix,
                      setScore
                    );
                  socket.emit("hit", row, col, (cell, isGameOver) => {
                    utils.hit(
                      row,
                      col,
                      cell,
                      isGameOver,
                      setOpponentMatrix,
                      setTurn,
                      setScore
                    );
                  });
                }}
              >
                {hit ? "X" : ship ? "*" : <>&nbsp;</>}
              </Button>
            );
          })}
        </Col>
      </Row>
    );
  }

  return (
    <Container>
      {[...Array(utils.nrow)].map((_, i) => {
        return <RowShip key={i} row={i} />;
      })}
    </Container>
  );
}
