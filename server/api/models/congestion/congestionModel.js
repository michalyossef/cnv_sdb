'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var release_db = require('../../../released_db.js');

var unrelease_db = require('../../../unreleased_db.js');




var maps_hierarchy = new Schema({
  release_id: String
}, {
  strictQuery: false,
  strict: false,
  collection : 'maps_hierarchy'
});

module.exports = release_db.model('maps_hierarchy', maps_hierarchy);



var maps_hierarchy_un = new Schema({
  release_id: String
},{  strictQuery: false,
  strict: false, collection : 'maps_hierarchy_un' });

module.exports = unrelease_db.model('maps_hierarchy_un', maps_hierarchy_un);















