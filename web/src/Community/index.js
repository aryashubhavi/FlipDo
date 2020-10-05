import React, {Component} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './community.css';
import background1 from '../Gallery/background-1.jpg';
import background2 from '../Gallery/background-2.jpg';
import background3 from '../Gallery/background-3.jpg';
import background4 from '../Gallery/background-4.jpg';
import background5 from '../Gallery/background-5.jpg';
import background6 from '../Gallery/background-6.jpg';
import background7 from '../Gallery/background-7.jpg';
import background8 from '../Gallery/background-8.jpg';
import background9 from '../Gallery/background-9.jpg';
import background10 from '../Gallery/background-10.jpg';

var share = require('social-share');

class Community extends Component {

  constructor(props) {
    super(props);
    this.state = {
      thoughts: [],
      showCarousel: window.innerWidth > 1024 ? false : true,
      currentShownPage: 0,
      totalPages: null,
    }
    this.handleTwitterClick = this
        .handleTwitterClick
        .bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
  }

  updateDimensions() {
    if(window.innerWidth > 1024) {
      this.setState({showCarousel: false});
    } else {
      this.setState({showCarousel: true});
    }
  }

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  componentWillMount() {
    this.fetchThoughts();
  }

  fetchThoughts() {
    fetch('/api/db/get-community-quotes').then((res) => res.json()).then((res) => {
      console.log(res);
      res.forEach((item) => {
        for(var i = 0; i < item._HITs.length; i++) {
          if(item._HITs[i].positive_thought !== undefined
              && item._pos_thought === undefined) {
            item['_pos_thought'] = item._HITs[i].positive_thought;
          }
        }
      });
      this.setState({
        thoughts: res,
        totalPages: res.length === 3.0 ? 0 :Math.ceil(res.length/3.0),
        lowerBound: 0,
        upperBound: 1
      });
    }).catch(err => {
      console.log(err)
    });
  }

  handleTwitterClick(e) {
    console.log("child click");
    e.stopPropagation();
    var url = share('twitter', {
      title: e
          .currentTarget
          .getAttribute('value')
    });
    window.open(url, "_blank");
  }

  getBackground(img_id) {
    switch (img_id) {
      case 1:
        return background1;
      case 2:
        return background2;
      case 3:
        return background3;
      case 4:
        return background4;
      case 5:
        return background5;
      case 6:
        return background6;
      case 7:
        return background7;
      case 8:
        return background8;
      case 9:
        return background9;
      case 10:
        return background10;
      default:
        return background1;
    }
  }

  showNextPage(gallery_template) {
    if(this.state.currentShownPage < (this.state.totalPages - 1)) {
      this.setState({currentShownPage: this.state.currentShownPage + 1})
    } else if(this.state.currentShownPage === (this.state.totalPages - 1)) {
      this.setState({currentShownPage: 0})
    }
    var upper_bound = 0;
    var lower_bound = 0;
    if(this.state.upperBound === gallery_template.length) {
      this.setState({lowerBound: 0});
      this.setState({upperBound: 1});
    } else {
      upper_bound = (this.state.upperBound > gallery_template.length) ? gallery_template.length : this.state.upperBound + 1;
      lower_bound = upper_bound -1;
      this.setState({lowerBound: lower_bound});
      this.setState({upperBound: upper_bound});
    }
  }

  showPreviousPage(gallery_template) {
    var current_page = 0;
    if(this.state.currentShownPage > 0) {
      this.setState({currentShownPage: (this.state.currentShownPage - 1)})
      current_page = this.state.currentShownPage - 1;
    } else if(this.state.currentShownPage === 0) {
      this.setState({currentShownPage: this.state.totalPages - 1})
      current_page = this.state.totalPages - 1
    }
    var upper_bound = 0;
    var lower_bound = 0;
    if(current_page === (this.state.totalPages - 1)) {
      upper_bound = gallery_template.length;
      lower_bound = upper_bound - 1;
      this.setState({upperBound: upper_bound});
      this.setState({lowerBound: lower_bound});
    } else {
      upper_bound = this.state.upperBound - 1;
      lower_bound = upper_bound - 1;
      this.setState({upperBound: upper_bound});
      this.setState({lowerBound: lower_bound});
    }
  }


  getCircleIcons() {
    var circles = [];
    for(var i = 0; i < this.state.totalPages; i++) {
      var currentColor = this.state.currentShownPage === i ? "#000000" : "#FFFFFF"
      circles.push((<FontAwesomeIcon key={i} className="circles" style={{color: currentColor}} icon="circle" />));
    }
    return ( <div className="circles-container">{circles}</div> )
  }

  getThoughtsInSetsOfThree(thoughts) {
    let setsOfThree = [];
    let i = 0;
    while (i < this.state.thoughts.length) {
      setsOfThree.push(this.state.thoughts.slice(i, i + 3));
      i += 3
    }
    return setsOfThree;
  }

  render() {
    if(this.state.showCarousel) {
      var setsOfThree = this.getThoughtsInSetsOfThree(this.state.thoughts);
      var templates = []
      for(var i = 0; i < setsOfThree.length; i++) {
        templates.push(setsOfThree[i].map((thought, i) => {
          return (
              <div className="column is-4" key={i}>
                <div className="custom-card" key={i}>
                  <figure className="front">
                    <img src={this.getBackground(thought._img_id)} alt="front"/>
                    <div className="caption">
                      <h3 dangerouslySetInnerHTML={{__html: thought._HITs[0].positive_thought}}/>
                    </div>
                  </figure>
                </div>
              </div>
          )
        }));
      }
      var gallery_template = templates.map((template, i) => <div key={i} className="columns">
        {template}
      </div>);
      var circles = this.getCircleIcons();
      return (
          <div className="is-centered container">
            <div className="box dark carousel-container">
              <h2 className="title is-3 makeWhite has-text-centered" style={{"width": "100%"}}>Community Inspirations</h2>
              {gallery_template.slice(this.state.lowerBound, this.state.upperBound)}
              <div className="control-container">
                <div className="page-controls left"><FontAwesomeIcon onClick={this.showPreviousPage.bind(this, gallery_template)} className="pull-right" icon="angle-left" size="3x" /></div>
                {circles}
                <div className="page-controls right"><FontAwesomeIcon onClick={this.showNextPage.bind(this, gallery_template)} className="pull-left" icon="angle-right" size="3x" /></div>
              </div>
            </div>
          </div>
      );
    } else {
      setsOfThree = this.getThoughtsInSetsOfThree(this.state.thoughts);
      templates = [];
      for (i = 0; i < setsOfThree.length; i++) {
        templates.push(setsOfThree[i].map((thought, i) => {
          return (
              <div className="column is-4">
                <div className="card-container">
                  <div className="custom-card">
                    <figure className="front">
                      <img src={this.getBackground(thought._img_id)} alt="front"/>
                      <div className="caption">
                        <h3 dangerouslySetInnerHTML={{ __html: thought._pos_thought }}></h3>
                      </div>
                    </figure>
                  </div>
                </div>
              </div>
          );
        }));
      }
      gallery_template = templates.map((template, i) => <div key={i.toString()} className="columns">
        {template}
      </div>);
      return (
          <div>
            <div className="makeWhite has-text-centered container">
              &nbsp;
            </div>
            <div className="box dark has-text-centered container">
              <h2 className="title is-3">Community Inspirations</h2>
              <br/> {gallery_template}
            </div>
          </div>
      );
    }
  }
}

export default Community;
