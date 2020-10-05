import React, { Component } from 'react';
//import { Link } from 'react-router-dom'
import LoginLogout from './LoginLogout';
import MobileLoginLogout from './MobileLoginLogout';
import './header.css';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      width: window.innerWidth
    }
    this.showBurgerMenu.bind(this)
    this.updateDimensions.bind(this)
  }

  updateDimensions() {
    if(this.state.isOpen && window.innerWidth > 1024) {
      this.setState({isOpen: false});
    }
  }

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  showBurgerMenu() {
    this.state.isOpen
      ? this.setState({isOpen: false})
      : this.setState({isOpen: true})
  }

  render() {
    return (
      <div>
          <nav className="navbar">
            <div className="navbar-brand">
              <div className="brand">
                <a className="navbar-item title is-3" href="/">
                  Flip*Doubt
                </a>
              </div>
              <div className={this.state.isOpen ? "burger dark": "burger"}>
                <a role="button" onClick={() => this.showBurgerMenu() }
                  className="navbar-burger is-flex-touch"  aria-label="menu" aria-expanded="false">
                  <span aria-hidden="true"></span>
                  <span aria-hidden="true"></span>
                  <span aria-hidden="true"></span>
                </a>
              </div>
            </div>
            <section className={this.state.isOpen ? 'open': 'closed'}>
              <div className="level make-full-width">
                <div className="columns is-flex-touch dark make-full-width is-marginless">
                  <div className="column">
                    <div className="link-wrapper">
                      <a href="/">Home</a>
                    </div>
                  </div>
                  <div className="column">
                    <div className="link-wrapper">
                      <a href="/rate">Rate</a>
                    </div>
                  </div>
                  <div className="column">
                      <MobileLoginLogout {...this.props} />
                  </div>
                </div>
              </div>
            </section>
            <div className="navbar-right navbar-menu navbar-end">
              <a className="navbar-item" href="/">
                Home
              </a>
              <a className="navbar-item" href="/rate">
                Rate
              </a>
              <span className="navbar-item">
                <LoginLogout {...this.props} />
              </span>
            </div>
          </nav>
      </div>
    )
  }
}

export default Header;
