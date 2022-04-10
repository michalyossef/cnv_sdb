'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var release_db = require('../../../released_db.js');



var project_configuration = new Schema({
  project: String,
  power_configuration: Object,
  changed_by: String,
  timestamp: { type: Date, default: Date.now}
}, {
  strictQuery: false,
  strict: false,
  collection : 'project_configuration'
});

module.exports = release_db.model('project_configuration', project_configuration);




var project_configuration_backup = new Schema({
  project: String,
  power_configuration: Object,
  changed_by: String,
  timestamp: { type: Date, default: Date.now},
}, {
  strictQuery: false,
  strict: false,
  collection : 'project_configuration_backup'
});

module.exports = release_db.model('project_configuration_backup', project_configuration_backup);










































