import React from 'react';
import Board from './Board';
import Popup from './Popup';
import UserList from './UserList';
import {getLocalItem, setLocalItem} from '../Utils';

class Controller extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gameStart: false,
      myUser: null,
      username: '',
      myTurn: 'x',
      currentTurn: 'x',
      xHistory: [],
      oHistory: [],
      message: '',
      users: [],
      registered: false,
      opponent: null,
      invite: null,
      winner: '',
      score: null
    }
    const context = this;
    const socket = this.props.socket;

    const currentUser = getLocalItem('user');

    if (currentUser) {
      socket.emit('re_connect', {
        user: JSON.parse(currentUser)
      })
    }
    
    socket.on('reconnect', data => {
      if (typeof data.user === 'undefined') {
        return;
      }
      context.setState({
        registered: true,
        username: data.user.username
      });
    })

    socket.on('users', data => {
      const username = context.state.username;
      const users = data.users;
      if (users) {
        context.setState({
          users: users.filter(u => u.username !== username),
          myUser: users.find(u => u.username === username)
        });
      }
    });

    socket.on('message', data => {
      context.setState({
        message: data.message
      });
      if (data.code === 'duplicated') {
        context.setState({
          username: '',
          registered: false
        });
      }
    });

    socket.on('accept', () => {
      context.toggleGame('x');
      socket.emit('accept', {
        type: 'inviter'
      });
    });

    socket.on('reject', () => {
      context.setState({
        message: "Opponent don't want to play with you",
        opponent: null
      });
    });

    socket.on('receive', data => {
      context.setState({
        invite: data.user,
        opponent: data.user
      });
      socket.emit('receive', data);
    });

    socket.on('move', data => {
      const coordinate = data.coordinate;
      context.updateMove(coordinate);
    });

    socket.on('quit', () => {
      context.quitGame();
      context.setState({
        winner: '',
        message: 'Opponent left'
      });
      socket.emit('opponent_quit');
    });

    socket.on('register_success', data => {
      const user = data.user;
      setLocalItem('user', user);
    })
  }

  updateScore = (winner) => {
    const {score, myUser, myTurn, opponent} = this.state;
    if (!opponent) {
      setTimeout(() => {
        this.updateScore();
      }, 1000);
    }
    let newScore = score;
    if (!score || typeof winner === 'undefined') {
      newScore = {};
      newScore[myUser.username] = 0;
      newScore[opponent.username] = 0;
    } else if (score) {
      if (winner === myTurn) {
        newScore[myUser.username] = newScore[myUser.username]+1;
      } else {
        newScore[opponent.username] = newScore[opponent.username]+1;
      }
    }
    this.setState({
      score: newScore
    })
  }

  handleQuitGame = () => {
    const socket = this.props.socket;
    socket.emit('quit');
    this.quitGame();
  }

  resetGame = () => {
    this.setState({
      oHistory: [],
      xHistory: []
    });
  }

  quitGame = () => {
    this.setState({
      winner: '',
      xHistory: [],
      oHistory: [],
      myTurn: '',
      currentTurn: 'x',
      gameStart: false,
      invite: null,
      opponent: null,
      score: null
    });
  }

  gameOver = coordinate => {
    const split = coordinate.map(value => {
      const split = value.split('-');
      return [parseInt(split[0]), parseInt(split[1])];
    })
    
    for (let value of split) {
      const x = value[0];
      const sameX = split.filter(obj => obj[0] === x);
  
      if (sameX.length >= 5) {
        const listY = sameX.map(v => v[1]).sort((a, b) => +a - +b);
        let result = false;
        listY.forEach((v, i) => {
          if (typeof listY[i + 4] !== 'undefined' && (listY[i + 4] - v === 4)) {
            result = true;
          }
        });
        if (result) {
          return result;
        }
      }
  
      const y = value[1];
      const sameY = split.filter(obj => obj[1] === y);
      if (sameY.length >= 5) {
        const listX = sameY.map(v => v[0]).sort((a, b) => +a - +b);
        let result = false;
        listX.forEach((v, i) => {
          if (typeof listX[i + 4] !== 'undefined' && (listX[i + 4] - v === 4)) {
            result = true;
          }
        });
        if (result) {
          return result;
        }
      }
    }
  
    for (let value of split) {
      const x = parseInt(value[0]);
      const y = parseInt(value[1]);
      const diagonal = [];
      for (let i = 1; i < 5; i++) {
        const search = split.filter(v => v[0] === (x + i) && v[1] === (y + i))
        if (search.length > 0) {
          diagonal.push(i);
        }
      }
      if (diagonal.length >= 4) {
        return true;
      }
    }
  
    for (let value of split) {
      const x = parseInt(value[0]);
      const y = parseInt(value[1]);
      const diagonal = [];
      for (let i = 1; i < 5; i++) {
        const search = split.filter(v => v[0] === (x - i) && v[1] === (y - i));
        if (search.length > 0) {
          diagonal.push(i);
        }
      }
      if (diagonal.length >= 4) {
        return true;
      }
    }
  
    for (let value of split) {
      const x = parseInt(value[0]);
      const y = parseInt(value[1]);
      const diagonal = [];
      for (let i = 1; i < 5; i++) {
        const search = split.filter(v => v[0] === (x + i) && v[1] === (y - i));
        if (search.length > 0) {
          diagonal.push(i);
        }
      }
      if (diagonal.length >= 4) {
        return true;
      }
    }
  
    for (let value of split) {
      const x = parseInt(value[0]);
      const y = parseInt(value[1]);
      const diagonal = [];
      for (let i = 1; i < 5; i++) {
        const search = split.filter(v => v[0] === (x - i) && v[1] === (y + i));
        if (search.length > 0) {
          diagonal.push(i);
        }
      }
      if (diagonal.length >= 4) {
        return true;
      }
    }
  
    return false;
  }

  gameCycle = () => {
    const { xHistory, oHistory, myTurn } = this.state;

    const isXWin = this.gameOver(xHistory);
    const isOWin = this.gameOver(oHistory);

    let message = '';

    if (isXWin) {
      message = myTurn === 'x' ? 'You won' : 'You lose';
    }

    if (isOWin) {
      message = myTurn === 'o' ? 'You won' : 'You lose';
    }

    if (isXWin || isOWin) {
      const winner = isXWin ? 'x' : 'o';
      this.updateScore(winner);
      message += '. Do you want to play again ?';
      this.setState({
        winner: message
      });
      this.resetGame();
    }
  }

  toggleGame = myTurn => {
    this.setState({
      winner: '',
      gameStart: true,
      myTurn: myTurn,
      oHistory: [],
      xHistory: [],
      score: null
    });
    this.updateScore();
  }

  handleChange = e => {
    e.preventDefault();
    if (e.target.value.length > 20) {
      return;
    }
    this.setState({ username: e.target.value });
  }

  handleEnter = e => {
    const socket = this.props.socket;
    const username = this.state.username;

    if (username.length < 3 || username.length > 20) {
      this.setState({
        message: 'Username length must be between 3 and 20'
      });
      return;
    }

    socket.emit('register', { username });
    this.setState({
      registered: true
    });
  }

  sendMove = coordinate => {
    const socket = this.props.socket;
    const { currentTurn, myTurn } = this.state;
    if (myTurn === currentTurn) {
      socket.emit('move', {
        coordinate: coordinate
      });
    }
    this.updateMove(coordinate);
  }

  updateMove = coordinate => {
    const { xHistory, oHistory, currentTurn } = this.state;

    if (currentTurn === 'x') {
      xHistory.push(coordinate);
      this.setState({ xHistory: xHistory, currentTurn: 'o' });
    } else {
      oHistory.push(coordinate);
      this.setState({ oHistory: oHistory, currentTurn: 'x' });
    }

    this.gameCycle();
  }

  displayWinner = () => {
    const winner = this.state.winner;
    if (winner !== '') {
      return (
        <Popup
          message={winner}
          cancel={this.handleQuitGame}
          callback={() => {
            this.setState({ winner: '' })
          }}
        />
      );
    }
    return '';
  }

  clearMessage = () => {
    this.setState({
      message: ''
    });
  }

  displayPopup = (callback, cancel) => {
    const message = this.state.message;
    if (message !== '') {
      return <Popup message={message} cancel={cancel} callback={callback} />;
    }
    return '';
  }

  handleInvite = user => {
    const { socket } = this.props;
    this.setState({
      opponent: user
    });
    socket.emit('send', {
      user: user
    });
  }

  acceptInvite = () => {
    const { socket } = this.props;
    const { invite } = this.state;
    this.toggleGame('o');
    socket.emit('accept', {
      type: 'invitee',
      user: invite
    });
  }

  rejectInvite = () => {
    const { socket } = this.props;
    const { invite } = this.state;
    this.setState({
      invite: null
    });
    socket.emit('reject', {
      user: invite
    });
  }

  displayInvite = () => {
    const { invite } = this.state;
    if (invite) {
      return (
        <Popup
          message={`${invite.username} want to play with you`}
          callback={this.acceptInvite}
          cancel={this.rejectInvite}
        />
      );
    }
    return '';
  }

  handleKeyUp = (e) => {
    if (e.keyCode === 13) {
      this.handleEnter();
    }
  }

  render() {
    const {
      registered,
      gameStart,
      username,
      myTurn,
      currentTurn,
      xHistory,
      oHistory,
      users,
      myUser,
      score
    } = this.state;

    if (gameStart) {
      return (
        <div>
          <Board
            myTurn={myTurn}
            currentTurn={currentTurn}
            xHistory={xHistory}
            oHistory={oHistory}
            updateMove={this.sendMove}
            quitGame={this.handleQuitGame}
            score={score}
          />
          {this.displayWinner()}
        </div>
      );
    } else {
      if (!registered) {
        return (
          <div className='register'>
            <div className='user-input'>
              <input
                className='input'
                type='text'
                placeholder='Enter your username'
                onChange={this.handleChange}
                onKeyUp={this.handleKeyUp}
                value={username || ''}
              />
              <button className='btn enter' onClick={this.handleEnter}>
                Go
              </button>
            </div>
            {this.displayPopup(this.clearMessage)}
          </div>
        );
      } else {
        return (
          <div className='lobby'>
            <div className='my-user'>
              Welcome, <span className="highlight">{myUser ? myUser.username : ''}</span>
            </div>
            <UserList invite={this.handleInvite} users={users} myUser={myUser}/>
            {this.displayPopup(this.clearMessage)}
            {this.displayInvite()}
          </div>
        );
      }
    }
  }
}

export default Controller;