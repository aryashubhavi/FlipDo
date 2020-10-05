import React, {Component} from 'react';
import "./ThoughtBubble.css";

class ThoughtBubble extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mobile: window.innerWidth < 1024,
      value: '',
      styleClass: 'thoughtText is-hidden',
      inputClass: 'add-padding',
      anotherThought: 'button is-info is-hidden',
      transformButton: "button is-info",
      processing: "is-hidden",
      userThoughtCount: 0
    };
    this.handleChange = this
        .handleChange
        .bind(this);
    this.transform = this
        .transform
        .bind(this);
    this.fetchThoughts = this
        .fetchThoughts
        .bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.showText = this.showText.bind(this);
    this.showInput = this.showInput.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
    setInterval(() => { this.fetchThoughts() }, 10000);
  }

  fetchThoughts() {
    let the_headers = Object.assign({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }, this.props.getAuthorizationHeader());
    if (this.props.profile !== null) {
      let request = new Request('/api/db/get-user-quotes', {
        method: 'POST',
        body: JSON.stringify({username: this.props.profile.nickname}),
        headers: the_headers
      });
      fetch(request).then((res) => res.json()).then((res) => {
        if (res.length !== this.state.userThoughtCount) {
          this.setState({userThoughtCount: res.length});
          this.props.reRenderHack();
        }
      })
    }
  }

  componentWillMount() {
    this.fetchThoughts();
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  updateDimensions() {
    if(window.innerWidth < 1024) {
      this.setState({mobile: true});
    } else {
      this.setState({mobile: false});
    }
  }

  handleChange(e) {
    this.setState({value: e.target.value})
  }

  nonEmptyThought() {
    return this.state.value.trim().length > 0;

  }

  handleClear (e) {
    this.setState({value: '', styleClass: "thougtText"})
  }

  showText(e) {
    console.log("we in this show text method yo");
    this.setState({
      value: this.state.value,
      styleClass: "thoughtText",
      inputClass: "is-hidden",
      anotherThought: 'button is-info',
      transformButton: 'button is-info is-hidden',
      processing: ''
    });
  }

  showInput(e) {
    e.preventDefault();
    this.setState({
      value: '',
      styleClass: "thoughtText is-hidden",
      inputClass: "add-padding",
      anotherThought: "button is-info is-hidden",
      transformButton: "button is-info",
      processing: 'is-hidden'
    });
  }

  transform() {
    if (this.props.isAuthenticated()) {
      let thought = this.state.value;
      const the_headers = Object.assign({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }, this.props.getAuthorizationHeader());
      console.log('we transformin "' + thought + '"');

      this.showText();

      let turk_request = new Request('/api/mturk/transform', {
        method: 'POST',
        body: JSON.stringify({thoughtText: thought}),
        headers: the_headers
      });

      fetch(turk_request).then((res) => res.json()).then((res) => {
        console.log('In callback after mturk api call');
        let HITs_Created = [];
        let that = this;
        res.forEach(item => {
          HITs_Created.push({
            'user_email': that.props.profile.email,
            'text': thought,
            'user_name': that.props.profile.nickname,
            'processing': true,
            'HITId': item.HITId,
            'HITTypeId': item.HITTypeId,
            'created': new Date()
          })
        });

        let db_request = new Request('/api/db/create-new-thought', {
          method: 'POST',
          body: JSON.stringify(HITs_Created),
          headers: the_headers
        });

        fetch(db_request).then((res) => res.json()).then((res) => {
          let mongoIdString = res._id;
          console.log(mongoIdString);
        }).catch(err => console.log(err))
      //
      }).catch(err => console.log(err))
    }
  }

  render() {
    if(this.state.mobile) {
      return (
        <div className="box dark is-centered container">
            <div className={this.state.inputClass} >
              <div className="field">
                <div className="control text-centered">
                  <textarea cols="12" rows="5" value={this.state.value}
                    disabled={this.props.isAuthenticated() ? "" : "true"}
                    onChange={this.handleChange}
                    className="textarea" type="text" onChange={this.handleChange}
                    placeholder={this.props.isAuthenticated() ? "Purge your thought" : "Login to purge a thought" }/>
                </div>
              </div>
            </div>
            <div className={this.state.styleClass}>{this.state.value}</div>
            <div className="control submit-for-cloud">
              <div className="submit-for-cloud-cell">
                <a className={this.state.transformButton} 
                   disabled={this.props.isAuthenticated() && this.nonEmptyThought() ? "" : "true"}
                   onClick={this.transform}>
                  
                  Transform
                </a>
                <a className={this.state.anotherThought} onClick={this.showInput}>
                  Add Another Thought
                </a>
                <div className={this.state.processing}>Your thought is processing...</div>
              </div>
            </div>
          </div>
      )

    } else {
      return (
          <div className="cloud">
            <div className="thought">
              <div className={this.state.inputClass}>
                <div className="field">
                  <div className="control text-centered">
                                  <textarea rows="5" cols="12" value={this.state.value}
                                            disabled={this.props.isAuthenticated() ? "" : "true"}
                                            onChange={this.handleChange}
                                            className="textarea"
                                            placeholder={this.props.isAuthenticated() ? "Purge your thought." : "Login to purge a thought."} />
                  </div>
                </div>
              </div>
              <div className={this.state.styleClass}>{this.state.value}</div>
              <div className="control submit-for-cloud">
                <div className="submit-for-cloud-cell">
                  <a className={this.state.transformButton}
                     disabled={this.props.isAuthenticated() && this.nonEmptyThought() ? "" : "true"}
                     onClick={this.transform}>
                    Transform
                  </a>
                  <a className={this.state.anotherThought} onClick={this.showInput}>
                    Add Another Thought
                  </a>
                  <div className={this.state.processing}>Your thought is processing...</div>
                  <div className={this.state.processing}>This may take a up to 30 minutes.
                    You will receive an email when your reformulations are ready</div>
                </div>
              </div>
            </div>
          </div>
      )
    }
  }
}

export default ThoughtBubble;
