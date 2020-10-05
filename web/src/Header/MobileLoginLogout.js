import React, { Component } from 'react';
import './header.css';
class MobileLoginLogout extends Component {

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
    const mobileLoginLogoutButton = this.isLoggedIn()
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
      <div>
        {mobileLoginLogoutButton}
      </div>
    )
  }
}

export default MobileLoginLogout;
