'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var debug_db = require('../../../debug_db.js');
var released_db = require('../../../released_db.js');
var unreleased_db = require('../../../unreleased_db.js');


var timing_hierarchy_un_schema = new Schema({
  release_id: String

},{ collection : 'timing_hierarchy_un' });

module.exports = unreleased_db.model('timing_hierarchy_un', timing_hierarchy_un_schema);



var timing_release_un_schema = new Schema({
  isHide: Boolean,
  project: String,
  run_id: String,
  user: String,
  date: String,
  unit: String,
  stage: String

},{ collection : 'timing_release_un' });

module.exports = unreleased_db.model('timing_release_un', timing_release_un_schema);



var timing_hierarchy_schema = new Schema({
  release_id: String,
  extra_info: String

},{ collection : 'timing_hierarchy' });

module.exports = released_db.model('timing_hierarchy', timing_hierarchy_schema);



var timing_release_schema = new Schema({
  isHide: Boolean,
  project: String,
  core: String,
  rtl_name: String,
  release_name: String,
  report_type: String,
  scenario_name: String,
  delay_type: String

},{ collection : 'timing_release' });

module.exports = released_db.model('timing_release', timing_release_schema);







