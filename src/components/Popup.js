import React from 'react'

class Popup extends React.Component {
  render() {
    const { message, callback, cancel } = this.props;
    return (
      <div className={`popup ${message !== '' ? 'enable' : ''}`}>
        <div className='content'>
          <div className='message'>{message}</div>
          <div className='action'>
            {typeof cancel !== 'undefined' ? (
              <button className='btn cancel' onClick={cancel}>
                No
              </button>
            ) : (
              ''
            )}
            <button className='btn' onClick={callback}>
              Ok
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Popup;