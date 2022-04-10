'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var release_db = require('../../../released_db.js');
var unrelease_db = require('../../../unreleased_db.js');


var debug_db = require('../../../debug_db.js');


var floorplan_hierarchy_schema = new Schema({
  release_id: String

},{ collection : 'floorplan_hierarchy' });

module.exports = release_db.model('floorplan_hierarchy', floorplan_hierarchy_schema);



var floorplan_release_schema = new Schema({
  isHide: Boolean,
  project: String,
  core: String,
  rtl_name: String,
  release_name: String

},{ collection : 'floorplan_release' });

module.exports = release_db.model('floorplan_release', floorplan_release_schema);




var floorplan_hierarchy_schema = new Schema({
  release_id: String

},{ collection : 'floorplan_hierarchy_un' });

module.exports = unrelease_db.model('floorplan_hierarchy_un', floorplan_hierarchy_schema);



var floorplan_release_schema = new Schema({
  isHide: Boolean,
  project: String,
  core: String,
  rtl_name: String,
  release_name: String

},{ collection : 'floorplan_release_un' });

module.exports = unrelease_db.model('floorplan_release_un', floorplan_release_schema);





var floorplan_hierarchy_schema = new Schema({
  release_id: String

},{ collection : 'test_floorplan_full' });

module.exports = debug_db.model('test_floorplan_full', floorplan_hierarchy_schema);



















