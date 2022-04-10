'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var release_db = require('../../../released_db.js');
var unrelease_db = require('../../../unreleased_db.js');


var hierarchy_schema = new Schema({
  release_id: String

},{ collection : 'cell_dist_hierarchy' });

module.exports = release_db.model('cell_dist_hierarchy', hierarchy_schema);



var release_schema = new Schema({
  project: String,
  core: String,
  rtl_name: String,
  release_name: String

},{ collection : 'cell_dist_release' });

module.exports = release_db.model('cell_dist_release', release_schema);







var hierarchy_un_schema = new Schema({
  release_id: String

},{ collection : 'cell_dist_hierarchy_un' });

module.exports = unrelease_db.model('cell_dist_hierarchy_un', hierarchy_un_schema);



var release_un_schema = new Schema({
  project: String,
  core: String,
  rtl_name: String,
  release_name: String

},{ collection : 'cell_dist_release_un' });

module.exports = unrelease_db.model('cell_dist_release_un', release_un_schema);






















