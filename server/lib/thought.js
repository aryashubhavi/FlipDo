var _ = require('lodash');
class Thought {
  constructor(options) {
    this._neg_thought = options["neg_thought"];
    this._placeholder = options["pos_thought"];
    this._user_id = options["user_id"];
    this._HITs = options["HITs"];
    this._img_id = options["img_id"];
    this.user_email = options["user_email"];
    this.create_date = options["created"];
    this.skipped = options["skipped"];
  }
};

module.exports = Thought;
