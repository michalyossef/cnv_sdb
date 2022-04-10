'use strict';


var release_db = require('../../../released_db.js');
var unrelease_db = require('../../../unreleased_db.js');
var debug_db = require('../../../debug_db.js');


var  floorplan_hierarchy = release_db.model('floorplan_hierarchy');
var  floorplan_release = release_db.model('floorplan_release');


var  floorplan_hierarchy_un = unrelease_db.model('floorplan_hierarchy_un');
var  floorplan_release_un = unrelease_db.model('floorplan_release_un');

// var  floorplan_hierarchy_un = debug_db.model('test_floorplan_full');



var async = require('async');


exports.floorplan_info = function(req, res) {

  var db_release;
  var db_hierarchy;

  if(req.query.releaseType == "released"){
    db_release = floorplan_release;
    db_hierarchy = floorplan_hierarchy;
  }
  if(req.query.releaseType == "unreleased"){
    db_release = floorplan_release_un;
    db_hierarchy = floorplan_hierarchy_un;
  }


  db_hierarchy.findOne({'release_id': req.params.release_id} , function(err, info) {
    res.json(info);
  });

};



































