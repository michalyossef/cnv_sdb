'use strict';


var release_db = require('../../../released_db.js');
var unrelease_db = require('../../../unreleased_db.js');


var  cellMacro_hierarchy = release_db.model('cell_macro_hierarchy');
var  cellMacro_release = release_db.model('cell_macro_release');

var  cellMacro_hierarchy_un = unrelease_db.model('cell_macro_hierarchy_un');
var  cellMacro_release_un = unrelease_db.model('cell_macro_release_un');

var async = require('async');



exports.getInfo = function(req, res) {
  var db;
  if(req.query.releaseType == "released"){
    db = cellMacro_hierarchy;
  }
  if(req.query.releaseType == "unreleased"){
    db = cellMacro_hierarchy_un;
  }

  db.find({'release_id': req.params.release_id, isHide: {$ne: true}}, function(err, rows) {
    if (err){
      res.send(err);
      return;
    }
    res.json(rows);
  });
};























