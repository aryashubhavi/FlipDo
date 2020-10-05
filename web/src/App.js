import React, {Component} from 'react';
import {Route} from 'react-router-dom'

import {withAuth} from './Auth';

import Footer from './Footer';
import FrontPage from './FrontPage';
import Header from './Header';
import Community from './Community';
import Rate from './Rate';
import './App.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faAngleLeft, faAngleRight, faCircle, faStar, faStarHalf } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarEmpty } from '@fortawesome/pro-regular-svg-icons';
library.add(faAngleLeft, faAngleRight, faCircle, faStar, faStarHalf, faStarEmpty)

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      notification: "nortification is-hidden"
    }
    this.showNotification = this.showNotification.bind(this);
  }

  showNotification() {
      this.setState({notification: "nortification animateOpen"})
  }

  render() {
    return <div className="App hero parallax is-primary is-fullheight">
        <Header class="hero-header" {...this.props} />
        <Route exact path="/" render = {props => <FrontPage showNotification={this.showNotification} {...props} {...this.props} />} />
        <Route exact path="/community" render={props => <Community {...this.props} />} />
        <Route path="/rate" render = {props => <Rate {...props} {...this.props} />} />
        <Footer class="hero-footer" />
        <span className={this.state.notification}>Your thought has been transformed!</span>
      </div>;
  }
}

export default withAuth(App);