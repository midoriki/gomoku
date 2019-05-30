import React from 'react';
import io from 'socket.io-client';
import Controller from './components/Controller';
import './App.css';
import {SOCKET_IO_HOST} from './config'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      connected: false,
      socket: null
    }
    const context = this;
    const socket = io(SOCKET_IO_HOST);
    socket.on('connect', () => {
      context.setState({
        connected: true,
        socket: socket
      })
    })
    socket.on('disconnect', () => {
      context.setState({
        connected: false,
        socket: null
      })
    })
  }
  display = () => {
    const {connected, socket} = this.state;
    if (connected) {
      return <Controller socket={socket}></Controller>
    }
    return <div className="center">Connecting... Please wait</div>
  }
  render() {
    return (
      <div className="app">{this.display()}</div>
    );
  }
}

export default App;
