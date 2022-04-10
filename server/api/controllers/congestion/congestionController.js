'use strict';

var release_db = require('../../../released_db.js');
var unrelease_db = require('../../../unreleased_db.js');

var libs = require('../../../libs.js');


var maps_hierarchy = release_db.model('maps_hierarchy');
var maps_hierarchy_un = unrelease_db.model('maps_hierarchy_un');




const path = require('path');

var async = require('async');

var _ = require('lodash');


exports.getCongestion = function(req, res) {

  var db_hierarchy;

  if(req.query.releaseType == "released"){
    db_hierarchy = maps_hierarchy;
  }
  if(req.query.releaseType == "unreleased"){
    db_hierarchy = maps_hierarchy_un;
  }

//req.query.parent

  db_hierarchy.find({'release_id': req.params.release_id} , function(err, doc) {
    if (err){
      res.send(err);
      return;
    }
    res.json(doc);
  });

};
























