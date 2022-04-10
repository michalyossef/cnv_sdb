'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var release_db = require('../../../released_db.js');

var unrelease_db = require('../../../unreleased_db.js');


// var power_primitives_schema = new Schema({
//   project: String,
//   core: String,
//   clusters: Array,
//   instancePaths: Object,
//   primitives: Array,
//   projectPowerInfo: Object
// 
// },{ collection : 'power_primitive' });
// 
// module.exports = release_db.model('power_primitive', power_primitives_schema);
// 
// 
// var power_primitives_metadata_schema = new Schema({
//   project: String,
//   core: String,
//   primitiveName: String,
//   meta: Object
// 
// },{ collection : 'power_primitive_metadata' });
// 
// module.exports = release_db.model('power_primitive_metadata', power_primitives_metadata_schema);
// 
// 
// var target_schema = new Schema({
//   project: String,
//   core: String,
//   cluster: String,
//   primitive: String,
//   value: Number
// },{ collection : 'power_target' });
// 
// module.exports = release_db.model('power_target', target_schema);


//The csv script, will insert to power_release, and power collection (it will have special field such as isCsv to know it is clickable.) and the csv lines will be included in power_hierarchy



var power_releases_schema = new Schema({
  project: String,
  core: String,
  cluster: String,
  rtl_name: String,
  source: String
  
},{ collection : 'power_release' });

module.exports = release_db.model('power_release', power_releases_schema);



var power_schema = new Schema({
  project: String,
  core: String,
  cluster: String,
  rtl_name: String,
  primitive: String,
  isCsv: Boolean,
  value: Number,
  source: String

},{ collection : 'power' });

module.exports = release_db.model('power', power_schema);




//project|core|cluster|primitive
var power_hierarchy = new Schema({
  release_id: String
}, {
  strictQuery: false,
  strict: false,
  collection : 'power_hierarchy'
});

module.exports = release_db.model('power_hierarchy', power_hierarchy);






var power_unreleases_schema = new Schema({
  project: String,
  top: String,
  tag: String,
  run_id: String
  
},{ collection : 'power_release_un' });

module.exports = unrelease_db.model('power_release_un', power_unreleases_schema);

//project|unit|tag|run_id
var power_hierarchy_unrelease = new Schema({
  release_id: String
},{  strictQuery: false,
  strict: false, collection : 'power_hierarchy_un' });

module.exports = unrelease_db.model('power_hierarchy_un', power_hierarchy_unrelease);















