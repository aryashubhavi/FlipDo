import React, { Component } from 'react';
import './header.css';
class LoginLogout extends Component {

  constructor(props) {
    super(props);

    this.isAuthenticated = this.props.isAuthenticated.bind(this);
    this.login = this.props.login.bind(this);
    this.logout = this.props.logout.bind(this);
  }

  isLoggedIn() {
    return this.isAuthenticated() && !!this.props.profile;
  }

  render() {
    const userDisplay = this.isLoggedIn() ? <div>
        <div className="navbar-item">
          <div className="dat-user-name">
            {this.props.profile.name}
          </div>
        </div>
      </div> : null;

    const loginLogoutButton = this.isLoggedIn()
      ? (
        <button className="button" onClick={this.logout}>
          Log Out
        </button>
      ) : (
        <button className="button" onClick={this.login}>
          Log In
        </button>
      );

    return (
      <div className="navbar-end">
        {userDisplay}
        <div className="navbar-item">
          {loginLogoutButton}
        </div>
      </div>
    )
  }
}

export default LoginLogout;
