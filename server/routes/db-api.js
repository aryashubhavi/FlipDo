var express = require('express');
var router = express.Router();
var Thought = require('../lib/thought.js');
var ObjectId = require('mongodb').ObjectID;
var _ = require('lodash');

const checkJwt = require('../auth').checkJwt;
const fetch = require('node-fetch');

router.post("/create-new-thought", checkJwt, function (req, res, next) {
  console.log("IN CREATE NEW THOUGHT.");
  let img_id = Math.floor(Math.random() * 10) + 1;
  console.log("Image Id is: " + img_id);

  let new_today = new Date(Date.now());
  let date_string = new_today.getMonth() + 1 + "/" + new_today.getDate() + "/" + new_today.getFullYear();
  let default_pos_thought = "(... transformation in progress ...)";
  var HITs = req.body.map((item) => ({HITId: item.HITId, processing: true}));
  console.log("Request info: " + req.body[0]);
  let newThought = new Thought({
    "neg_thought": req.body[0].text,
    "pos_thought": default_pos_thought,
    "user_id": req.body[0].user_name,
    "HITs": HITs,
    "img_id": img_id,
    "user_email": req.body[0].user_email,
    "created": req.body[0].created,
    "skipped": false
  });
  console.log(newThought);

  req
    .db
    .collection("thoughts")
    .insertOne(newThought)
    .then(function (result) {
      console.log("In unprotected db callback");
      console.log(result.ops[0]);
      res
        .status(200)
        .send(result.ops[0]);
    }, error => {
      console.log("error");
    })
    .catch(function (error) {
      throw error;
    });
  req.db.collection('users')
     .update(
       {"user_id": {$eq: req.body[0].username }},
       {$setOnInsert: {"user_id": req.body[0].user_name }},
       {upsert: true});
});

router.get('/get-thoughts', checkJwt, function(req, res, next) {
  if(req.query.HITIds) {
    const ids = req.query.HITIds.split(",");
    req.db.collection('thoughts')
        .find({_HITs: {$elemMatch: {HITId: { $in: ids } }}})
        .toArray(function(err, results) {
          res.json(results.reverse());
        })
  } else {
    console.log("In /get-thoughts");
    req.db.collection('thoughts')
        .find({_user_id: req.query.user_id, _HITs: { $elemMatch: {"processing": false}}})
        .toArray(function(err, results) {
          let resultsWithAllHitsRespondedTo = results.filter((item) => {
            let numHitsRespondedTo = _.reduce(item._HITs, (sum, hit) => {
              return (hit.processing === false) ? (sum + 1) : sum;
            }, 0);
            return numHitsRespondedTo === 3;
          });
          let resultsReadyForRating;
          if (!req.query.showAll) {
              resultsReadyForRating = resultsWithAllHitsRespondedTo.filter((item) => {
              let numHitsRated = _.reduce(item._HITs, (sum, hit) => {
                return (hit.rating !== null) ? (sum + 1) : sum;
              }, 0);
              return numHitsRated < 3;
            });
          } else {
            resultsReadyForRating = resultsWithAllHitsRespondedTo;
          }
          res.json(resultsReadyForRating.reverse());
        });
  }
});

router.get('/get-ratings', checkJwt, function(req, res, next) {
  req.db.collection('ratings').find().toArray((err, ratings) => {
    res.json(ratings[0]);
  });
});

router.get('/get-user', checkJwt, function(req, res, next) {
  req.db.collection('users')
      .find({"user_id": {$eq: req.query.username}})
      .toArray((err, users) => {
        res.json(users[0])
      });
});

// Gets rating skip count for the user in the last ten thoughts
router.get("/last-ten-skip-count/user/:user_name", checkJwt, function (req, res, next) {
  let user_id = req.params.user_name;
  
  req.db.collection('thoughts')
    .find({ _user_id: user_id, skipped: true })
    .sort({ "create_date": -1 })
    .limit(10)
    .toArray().then((result) => {
      let skip_count = 0
      if (result.length) {
          skip_count = result.length;
      }

      res.status(200).send({
        skipCount: skip_count
      });
    }
  );
});

// Gets rating skip count for the user in the last fifty thoughts
router.get("/last-fifty-skip-count/user/:user_name", checkJwt, function (req, res, next) {
  let user_id = req.params.user_name;

  req.db.collection('thoughts')
    .find({_user_id: user_id, skipped: true })
    .sort({ "create_date": -1 })
    .limit(50)
    .toArray().then((result) => {
      res.status(200).send({
        skipCount: result.length
      });
  });
});

router.post('/set-reason', checkJwt, function(req, res, next) {
  req.db.collection('thoughts')
      .update(
          {_id: ObjectId(req.body.thoughtId), "_HITs.HITId": req.body.hitId},
          {$set: {"_HITs.$.reason": req.body.reason}}).then((result) => {
           res.status(200);
  });
});

router.post('/skip-feedback', checkJwt, function(req, res, next) {
  req.db.collection('thoughts')
      .update(
          {_id: ObjectId(req.body.thoughtId), "_HITs.HITId": req.body.hitId},
          {$set: {"skipped": true}}).then((result) => { res.status(200); }
      );
});

router.post('/set-rating', checkJwt, function(req, res, next) {
  console.log("In set rating");
  req.db.collection('thoughts')
      .find({_id: ObjectId(req.body.thoughtId), "_HITs.HITId": req.body.hitId})
      .toArray((error, data) => {
       let thought = data[0];
        req.db.collection('ratings').find({}).toArray((error, results) => {
          for(let i = 0; i < results[0].starRatings.length; i++) {
            if(results[0].starRatings[i].numStars === req.body.rating) {
              for(let j = 0; j < thought._HITs.length; j++) {
                if(thought._HITs[j].HITId === req.body.hitId) {
                  if(thought._HITs[j].rating === null) {
                    var rating = results[0].starRatings[i];
                    rating.count += 1;
                  } else {
                    rating = results[0].starRatings[i];
                    rating.count += 1;
                    var collection = _.filter(results[0].starRatings, (item) => {
                      return item.numStars === thought._HITs[j].rating;
                    });
                    var oldRating = collection[0];
                    oldRating.count -= 1;
                  }
                }
              }
            }
          }
          if(rating) {
            req.db.collection('ratings')
                .update(
                    {"starRatings": {$elemMatch: {numStars: {$eq: req.body.rating}}}},
                    {$set: {"starRatings.$.count": rating.count}}).then((result) => {
            });
          }
          if(oldRating) {
            req.db.collection('ratings').update(
                {"starRatings": {$elemMatch: {numStars: {$eq: oldRating.numStars}}}},
                {$set: {"starRatings.$.count": oldRating.count}}).then((result) => {
                  console.log("Old Rating decremented");
            });
          }
          req.db.collection('thoughts')
              .update(
                  {_id: ObjectId(req.body.thoughtId), "_HITs.HITId": req.body.hitId},
                  {$set: {
                      "_HITs.$.rating": req.body.rating
                    }})
              .then((result) => {
                res.status(200).send({
                  thoughtId: req.body.thoughtId,
                  hitId: req.body.hitId,
                  rating: req.body.rating
                });
              });
        });
  });
});

router.post('/get-user-quotes', checkJwt, function (req, res, next) {
  console.log("In get user quotes");
  let user_id = req.body.username;
  console.log(user_id);
  req
    .db
    .collection('thoughts')
    .find({"_user_id": user_id, _HITs: {$elemMatch: {"processing": false}}})
      .toArray(function(err, results) {
        let resultsWithAllHitsRespondedTo = results.filter((item) => {
          let numHitsRespondedTo = _.reduce(item._HITs, (sum, hit) => {
            return (hit.processing === false) ? (sum + 1) : sum;
          }, 0);
          return numHitsRespondedTo === 3;
        });
        res.json(resultsWithAllHitsRespondedTo.reverse())
      });
});

router.post('/swap-image', checkJwt, function (req, res, next) {
  console.log("swap-image:req.body._HITId: " + req.body.id);
  let new_img_id = Math.floor(Math.random() * 10) + 1;

  req
    .db
    .collection('thoughts')
    .updateOne({
      _id: ObjectId(req.body.id)
    }, {
      $set: {
        _img_id: new_img_id
      }
    })
    .then((result) => {
      console.log(result)
      res
        .status(200)
        .send({_img_id: new_img_id});
    })
});

router.get('/get-community-quotes', function (req, res, next) {
  req.db.collection('thoughts')
     .find({_HITs: {$elemMatch: {positive_thought: {$ne: null}}}})
     .toArray((err, results) => {
       res.json(results.reverse())
     })
});

router.post('/get-processing-HITs', function (req, res, next) {
  let user = req.body.username;
  console.log(user);
  console.log('in db get-processing-HITs');
  let HITIds = [];
  req
    .db
    .collection('thoughts')
    .find({_HITs: {$elemMatch: {processing: true}}, _user_id: user})
    .toArray(function (err, results) {
      _.forEach(results, (result => {
        var ids = result._HITs.map((hit) => { return hit.HITId });
        for(var i=0; i < ids.length; i++) {
          HITIds.push(ids[i]);
        }
      }));
      res
        .status(200)
        .send(HITIds);
    });
});


router.post('/update-processed-HIT', function (req, res, next) {
  console.log('in db update-processed-HIT');
  let HIT_updates = req.body;
  console.log(HIT_updates);
  var promises = [];
  _.forEach(HIT_updates, function (HIT_update) {
    var id = ObjectId(HIT_update.id)
    promises.push(req
      .db
      .collection('thoughts')
      .update(
        {_id: id, "_HITs.HITId": HIT_update.HITId},
        {$set: {
          "_HITs.$.processing": false,
          "_HITs.$.positive_thought": HIT_update.positive_thought,
          "_HITs.$.rating": null
        }}));
  });
  Promise.all(promises).then(results => {
    res.json({message: 'Excellent'});
  });
});

router.get('/community-thoughts', function (req, res, next) {
  console.log('in db community-thoughts');

  let db_ids = [];
  req
    .db
    .collection('thoughts')
    .find({_community: true})
    .toArray(function (err, results) {
      _.forEach(results, (result => {
        db_ids.push(result._id);
      }));
      res
        .status(200)
        .send(db_ids);
    });
});

module.exports = router;
