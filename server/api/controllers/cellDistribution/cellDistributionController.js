'use strict';


var release_db = require('../../../released_db.js');
var unrelease_db = require('../../../unreleased_db.js');


var  cellDist_hierarchy = release_db.model('cell_dist_hierarchy');
var  cellDist_release = release_db.model('cell_dist_release');

var  cellDist_hierarchy_un = unrelease_db.model('cell_dist_hierarchy_un');
var  cellDist_release_un = unrelease_db.model('cell_dist_release_un');


var async = require('async');


exports.checkIfExists = function (req, res) {
    var project = ""; var core = ""; var rtl = ""; var release = ""; 
    if (validateInput(req.params.project)) { project = req.params.project }
    if (validateInput(req.params.core))    { core    = req.params.core }
    if (validateInput(req.params.rtl))     { rtl     = req.params.rtl }
    if (validateInput(req.params.release)) { release = req.params.release }

    cellDist_release.findOne({ 'project': project, 'core': core, 'rtl_name': rtl, 'release_name': release, isHide: { $ne: true } }, function(err, release) {
    if (err){
      res.send(err);
      return;
    }
    res.json(release);
    });
};


exports.getInfo = function(req, res) {
  var db;
  if(req.query.releaseType == "released"){
    db = cellDist_hierarchy;
  }
  if(req.query.releaseType == "unreleased"){
    db = cellDist_hierarchy_un;
  }
  var release_id = "";
  if (req.params.release_id != null) { release_id = req.params.release_id}
  db.find({'release_id': release_id, isHide: {$ne: true}}, function(err, rows) {
    if (err){
      res.send(err);
      return;
    }
    res.json(rows);
  });
};























