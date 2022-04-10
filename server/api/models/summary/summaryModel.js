'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var debug_db = require('../../../debug_db.js');

var released_db = require('../../../released_db.js');
var unreleased_db = require('../../../unreleased_db.js');


var summary_hierarchy_un_schema = new Schema({
  release_id: String

},{ collection : 'summary_hierarchy_un' });

module.exports = unreleased_db.model('summary_hierarchy_un', summary_hierarchy_un_schema);



var summary_release_un_schema = new Schema({
  isHide: Boolean,
  project: String,
  run_id: String,
  user: String,
  date: String,
  unit: String,
  stage: String

},{ collection : 'summary_release_un' });

module.exports = unreleased_db.model('summary_release_un', summary_release_un_schema);



var summary_hierarchy_schema = new Schema({
  release_id: String

},{ collection : 'summary_hierarchy' });

module.exports = released_db.model('summary_hierarchy', summary_hierarchy_schema);



var summary_release_schema = new Schema({
  isHide: Boolean,
  project: String,
  core: String,
  rtl_name: String,
  release_name: String

},{ collection : 'summary_release' });

module.exports = released_db.model('summary_release', summary_release_schema);



var summary_qor_hierarchy_schema = new Schema({
  release_id: String

},{ collection : 'qor_hierarchy' });

module.exports = released_db.model('qor_hierarchy', summary_qor_hierarchy_schema);

var summary_qor_hierarchy_un_schema = new Schema({
  release_id: String

},{ collection : 'qor_hierarchy_un' });

module.exports = unreleased_db.model('qor_hierarchy_un', summary_qor_hierarchy_un_schema);


var check_timing_hierarchy_schema = new Schema({
  release_id: String

},{ collection : 'check_timing_hierarchy' });

module.exports = released_db.model('check_timing_hierarchy', check_timing_hierarchy_schema);

var check_timing_hierarchy_un_schema = new Schema({
  release_id: String

},{ collection : 'check_timing_hierarchy_un' });

module.exports = unreleased_db.model('check_timing_hierarchy_un', check_timing_hierarchy_un_schema);


var compile_check_design_hierarchy_schema = new Schema({
  release_id: String

},{ collection : 'compile_check_design_hierarchy' });

module.exports = released_db.model('compile_check_design_hierarchy', compile_check_design_hierarchy_schema);

var compile_check_design_hierarchy_un_schema = new Schema({
  release_id: String

},{ collection : 'compile_check_design_hierarchy_un' });

module.exports = unreleased_db.model('compile_check_design_hierarchy_un', compile_check_design_hierarchy_un_schema);


var mv_drc_hierarchy_schema = new Schema({
  release_id: String

},{ collection : 'mv_drc_hierarchy' });

module.exports = released_db.model('mv_drc_hierarchy', mv_drc_hierarchy_schema);

var mv_drc_hierarchy_un_schema = new Schema({
  release_id: String

},{ collection : 'mv_drc_hierarchy_un' });

module.exports = unreleased_db.model('mv_drc_hierarchy_un', mv_drc_hierarchy_un_schema);



