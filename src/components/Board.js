import React from 'react';
import $ from 'jquery';
import Piece from './Piece';
import { GOMOKU_COLUMN, GOMOKU_ROW } from '../config';

class Board extends React.Component {
  componentDidMount = () => {
    const outerContent = $('#board');
    const innerContent = $('#gomoku');
   
    outerContent.scrollLeft( (innerContent.width() - outerContent.width()) / 2);
    window.scrollTo(0, ( window.innerHeight / 2 ));
  }
  move = identify => {
    const { myTurn, currentTurn } = this.props;

    if (myTurn !== currentTurn) {
      return;
    }

    this.props.updateMove(identify);
  }

  hasMark = identify => {
    const { xHistory, oHistory } = this.props;

    if (xHistory.indexOf(identify) >= 0) {
      return 'x';
    }
    if (oHistory.indexOf(identify) >= 0) {
      return 'o';
    }
    return '';
  }

  drawBoard = () => {
    const rowNumber = GOMOKU_ROW;
    const columnNumber = GOMOKU_COLUMN;
    let table = [];
    for (let i = 0; i < rowNumber; i++) {
      let children = [];
      for (let j = 0; j < columnNumber; j++) {
        const identify = `${i}-${j}`;
        children.push(
          <Piece
            key={identify}
            identify={identify}
            move={this.move}
            myTurn={this.props.myTurn}
            currentTurn={this.props.currentTurn}
            mark={this.hasMark(identify)}
          />
        );
      }
      table.push(<tr key={i}>{children}</tr>);
    }
    return table;
  }

  render() {
    const { myTurn, currentTurn, score } = this.props;
    return (
      <div id="board" className="board">
        <div className="control-board">
          <div className="turn">
            {myTurn === currentTurn ? 'You ' : 'Opponent '}
            go
          </div>
          <div className="score">
            <div className="point">{score ? Object.keys(score).map((k,i) =>
              score[k] + (i === 0 ? " - " : '')) : ''}
            </div>
          </div>
          <div className="action">
            <button className="btn" onClick={this.props.quitGame}>
              Quit
            </button>
          </div>
        </div>
        <table id="gomoku" className="gomoku">
          <tbody>{this.drawBoard()}</tbody>
        </table>
      </div>
    )
  }
}

export default Board;