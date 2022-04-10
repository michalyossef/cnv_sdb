'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var release_db = require('../../../released_db.js');
var unrelease_db = require('../../../unreleased_db.js');

// var leakageMetaSchema = new Schema({
//   create_date : {
//     type : Date,
//     default : Date.now
//   }
// },{ collection : 'leakage' });
// 
// module.exports = mongoose.model('leakage', leakageMetaSchema);





var leakage_hierarchy_schema = new Schema({
  release_id: String

},{ collection : 'leakage_hierarchy' });

module.exports = release_db.model('leakage_hierarchy', leakage_hierarchy_schema);



var leakage_release_schema = new Schema({
  isHide: Boolean,
  project: String,
  core: String,
  rtl_name: String,
  release_name: String

},{ collection : 'leakage_release' });

module.exports = release_db.model('leakage_release', leakage_release_schema);






var leakage_hierarchy_schema = new Schema({
  release_id: String

},{ collection : 'leakage_hierarchy_un' });

module.exports = unrelease_db.model('leakage_hierarchy_un', leakage_hierarchy_schema);



var leakage_release_schema = new Schema({
  isHide: Boolean,
  project: String,
  core: String,
  rtl_name: String,
  release_name: String

},{ collection : 'leakage_release_un' });

module.exports = unrelease_db.model('leakage_release_un', leakage_release_schema);


















