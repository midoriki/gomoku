import React from 'react';
import User from './User';

class UserList extends React.Component {
  invite = data => {
    this.props.invite(data);
  }

  render() {
    const { users, myUser } = this.props;
    return (
      <div className='user-list'>
        <div>Online users</div>
        <div className='user-table'>
          <table>
            <tbody>
              {users.length <= 0 ?
                <tr><td className="info">No one is online</td></tr> :
                users.map((u, i) => (
                  <User
                    canInvite={(myUser && myUser.status === 'waiting') ? true : false}
                    key={i}
                    invite={this.invite}
                    user={u}
                  />
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default UserList;