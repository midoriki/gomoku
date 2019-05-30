import React from 'react';

class Piece extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hoverMark: ''
    }
  }
  handleClick = e => {
    if (this.props.mark !== '') {
      return;
    }
    this.props.move(this.props.identify);
  }
  handleMouseOver = e => {
    const { myTurn, currentTurn } = this.props;
    if (myTurn !== currentTurn) {
      return;
    }
    this.setState({ hoverMark: myTurn });
  }
  handleMouseOut = e => {
    this.setState({ hoverMark: '' });
  }
  render() {
    const mark = this.props.mark;
    const hoverMark = mark === '' ? this.state.hoverMark : '';
    return (
      <td
        id={this.props.identify}
        onClick={this.handleClick}
        className={`piece-${mark}${hoverMark !== '' ? ' hover' : ''}`}
        onMouseOver={this.handleMouseOver}
        onMouseOut={this.handleMouseOut}
      >
        {mark}
        {hoverMark}
      </td>
    );
  }
}

export default Piece;