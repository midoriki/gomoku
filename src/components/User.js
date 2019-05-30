import React from 'react';

class User extends React.Component {
  invite = e => {
    e.preventDefault();

    const { user } = this.props;
    this.props.invite(user);
  }

  renderAction = () => {
    const canInvite = this.props.canInvite;
    if (canInvite) {
      return (<button className="link-button" onClick={this.invite}>invite</button>)
    }
    return '';
  }

  render() {
    const { user } = this.props;
    return (
      <tr>
        <td className='user'>{user.username}</td>
        <td className='action'>
          {user.status !== 'waiting' ? (
            user.status
          ) : this.renderAction()}
        </td>
      </tr>
    )
  }
}

export default User;