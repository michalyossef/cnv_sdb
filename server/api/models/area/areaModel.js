'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var release_db = require('../../../released_db.js');
var unrelease_db = require('../../../unreleased_db.js');


var area_hierarchy_schema = new Schema({
  release_id: String

},{ collection : 'area_hierarchy' });

module.exports = release_db.model('area_hierarchy', area_hierarchy_schema);



var area_release_schema = new Schema({
  isHide: Boolean,
  project: String,
  core: String,
  rtl_name: String,
  G_NAND_EQU_CELL: String,
  release_name: String

},{ collection : 'area_release' });

module.exports = release_db.model('area_release', area_release_schema);







var area_hierarchy_schema = new Schema({
  release_id: String

},{ collection : 'area_hierarchy_un' });

module.exports = unrelease_db.model('area_hierarchy_un', area_hierarchy_schema);



var area_release_schema = new Schema({
  isHide: Boolean,
  project: String,
  core: String,
  rtl_name: String,
  G_NAND_EQU_CELL: String,
  release_name: String

},{ collection : 'area_release_un' });

module.exports = unrelease_db.model('area_release_un', area_release_schema);






















