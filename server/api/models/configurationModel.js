'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var release_db = require('../../released_db.js');

var configMetaSchema = new Schema({},{ collection : 'configuration' });

module.exports = release_db.model('configuration', configMetaSchema);
