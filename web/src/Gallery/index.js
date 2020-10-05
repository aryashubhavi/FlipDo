import React, {Component} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import './gallery.css';
import background1 from './background-1.jpg';
import background2 from './background-2.jpg';
import background3 from './background-3.jpg';
import background4 from './background-4.jpg';
import background5 from './background-5.jpg';
import background6 from './background-6.jpg';
import background7 from './background-7.jpg';
import background8 from './background-8.jpg';
import background9 from './background-9.jpg';
import background10 from './background-10.jpg';
import background11 from './background-11.jpg';

class Gallery extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showCarousel: window.innerWidth <= 1024,
      currentShownPage: 0,
      thoughts: [],
      totalPages: null
    }
    this.handleCardClick = this
        .handleCardClick
        .bind(this);
    this.swap = this
        .swap
        .bind(this);
    this.showNextPage = this.showNextPage.bind(this);
    this.showPreviousPage = this.showPreviousPage.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.reRenderState = false;
  }

  updateDimensions() {
    if(window.innerWidth > 1024) {
      this.setState({showCarousel: false});
    } else {
      this.setState({showCarousel: true});
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  componentWillMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
    this.fetchThoughts();
  }

  componentWillUpdate() {
    if (!this.reRenderState) {
      this.reRenderState = this.props.reRender;
      if (this.reRenderState) {
        this.props.stopReRendering();
        this.fetchThoughts();
      }
    }
  }

  fetchThoughts() {
    let the_headers = Object.assign({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }, this.props.getAuthorizationHeader());
    if (this.props.user != null) {
      let request = new Request('/api/db/get-user-quotes', {
        method: 'POST',
        body: JSON.stringify({username: this.props.user}),
        headers: the_headers
      });

      console.log(request);
      fetch(request).then((res) => res.json()).then((res) => {
        res.forEach((item) => {
          let maxHit = _.maxBy(item._HITs, (hit) => { return hit.rating; });
          if(maxHit === undefined) {
            maxHit = item._HITs[0];
          }

          item['_pos_thought'] = maxHit.positive_thought;
        });
        this.setState({
          thoughts: _.sortBy(res, 'create_date'),
          totalPages: res.length === 3.0 ? 0 : Math.ceil(res.length/3.0),
          lowerBound: 0,
          upperBound: 1
        });
        this.reRenderState = false;
      }).catch(err => console.log(err));
    }
  }

  showNextPage(gallery_template) {
    if(this.state.currentShownPage < (this.state.totalPages - 1)) {
      this.setState({currentShownPage: this.state.currentShownPage + 1})
    } else if(this.state.currentShownPage === (this.state.totalPages - 1)) {
      this.setState({currentShownPage: 0})
    }
    let upper_bound = 0;
    let lower_bound = 0;
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
    let current_page = 0;
    if(this.state.currentShownPage > 0) {
      this.setState({currentShownPage: (this.state.currentShownPage - 1)})
      current_page = this.state.currentShownPage - 1;
    } else if(this.state.currentShownPage === 0) {
      this.setState({currentShownPage: this.state.totalPages - 1})
      current_page = this.state.totalPages - 1
    }
    let upper_bound = 0;
    let lower_bound = 0;
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

  handleCardClick(e) {
    e.preventDefault();
    if (e.currentTarget.className.includes('flipped')) {
      e.currentTarget.className = "custom-card";
    } else {
      e.currentTarget.className = "custom-card flipped";
    }
  }

  bounce(element) {
    element
      .classList
      .remove("bounce");
    element
      .classList
      .add("bounce");
  }

  swap(e) {
    console.log('swap');
    e.stopPropagation();
    const the_headers = Object.assign({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }, this.props.getAuthorizationHeader());
    const img = e.currentTarget.parentElement.parentElement.parentElement.children[0];
    const id = img.children[0].attributes.thoughtid.value;
    let img_request = new Request('/api/db/swap-image', {
      method: 'POST',
      body: JSON.stringify({
        id: e.currentTarget.getAttribute('value')
      }),
      // this header sends the user token from auth0
      headers: the_headers
    });

    fetch(img_request).then((res) => res.json()).then((res) => {
      for(let i = 0; i < this.state.thoughts.length; i++) {
        if(this.state.thoughts[i]._id === id) {
          this.state.thoughts[i]._img_id = res._img_id;
        }
      }
      this.setState({thoughts: this.state.thoughts});
    }).catch(err => console.log(err));

    this.bounce(e.currentTarget);
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
    let gallery_template;
    let setsOfThree;
    let templates;
    if(this.state.showCarousel) {
      if(this.state.thoughts.length === 0) {
        return(
            <div/>
        );
      } else {
        setsOfThree = this.getThoughtsInSetsOfThree(this.state.thoughts);
        templates = [];
        for(var i = 0; i < setsOfThree.length; i++) {
          templates.push(setsOfThree[i].map((thought, i) => {
            return (
                <div className="column is-4" key={i}>
                  <div className="custom-card" key={i} onClick={this.handleCardClick}>
                    <figure className="front">
                      <img thoughtid={thought._id} src={this.getBackground(thought._img_id)} alt="front"/>
                      <div className="caption">
                        <h3 dangerouslySetInnerHTML={{__html: thought._pos_thought}}/>
                      </div>
                      <div className="share-social">
                        <i className="fa fa-image"
                           aria-hidden="true"
                          value={thought._id}
                           onClick={this.swap}/>
                      </div>
                    </figure>
                    <figure className="is-overlay back">
                      <img src={background11} alt="back"/>
                      <div className="caption">
                        <h3 className="negative" dangerouslySetInnerHTML={{ __html: thought._neg_thought }} />
                      </div>
                    </figure>
                  </div>
                </div>
            )
          }));
        }
        gallery_template = templates.map((template, i) => <div key={i} className="columns">
          {template}
        </div>);
        //const circles = this.getCircleIcons();
        const number = this.state.currentShownPage + 1;
        return (
            <div className="is-centered container">
              <div className="box dark carousel-container">
                <h2 className="title is-3 makeWhite has-text-centered" style={{"width": "100%"}}>Gallery of the Mind</h2>
                {gallery_template.slice(this.state.lowerBound, this.state.upperBound)}
                <div className="control-container">
                  <div className="page-controls"><FontAwesomeIcon onClick={this.showPreviousPage.bind(this, gallery_template)} className="pull-right" icon="angle-left" size="3x" /></div>
                  <div className="number">
                    {number}
                  </div>
                  <div className="page-controls"><FontAwesomeIcon onClick={this.showNextPage.bind(this, gallery_template)} className="pull-left" icon="angle-right" size="3x" /></div>
                </div>
              </div>
            </div>
        );
      }
    } else {
      if(this.state.thoughts.length === 0) {
        return(
            <div/>
        );
      } else {
        setsOfThree = this.getThoughtsInSetsOfThree(this.state.thoughts);
        templates = [];
        for (i = 0; i < setsOfThree.length; i++) {
          templates.push(setsOfThree[i].map((thought, i) => {
            return (
                <div className="column is-4" key={i}>
                  <div className="card-container">
                    <div className="custom-card" onClick={this.handleCardClick}>
                      <figure className="front">
                        <img thoughtid={thought._id} src={this.getBackground(thought._img_id)} alt="front"/>
                        <div className="caption">
                          <h3>{thought._pos_thought}</h3>
                        </div>
                        <div className="share-social">
                          <i className="fa fa-image"
                             aria-hidden="true"
                             value={thought._id}
                             onClick={this.swap}/>
                        </div>
                      </figure>
                      <figure className="is-overlay back">
                        <img src={background11} alt="back"/>
                        <div className="caption">
                          <h3 className="negative" dangerouslySetInnerHTML={{ __html: thought._neg_thought }} />
                        </div>
                      </figure>
                    </div>
                  </div>
                </div>
            );
          }));
        }
        gallery_template = templates.map((template, i) => <div key={i} className="columns">
          {template}
        </div>);
        return (
            <div className="box dark has-text-centered is-radiusless">
              <p>{this.props.shouldRerender}</p>
              <h2 className="card-header title is-3 has-text-centered">Gallery of the Mind</h2>
              <br/> {gallery_template}
            </div>
        );
      }
    }
  }
}

export default Gallery;
