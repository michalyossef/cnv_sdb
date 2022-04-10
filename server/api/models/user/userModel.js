'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var release_db = require('../../../released_db.js');


var users_schema = new Schema({
  username: String,
  info: Object,
  create_date: { type: Date, default: Date.now},

},{ collection : 'users' });

module.exports = release_db.model('users', users_schema);





var user_settings_schema = new Schema({
  username: String,
  settings: Object,
  create_date: { type: Date, default: Date.now},

},{ collection : 'user_settings' });

module.exports = release_db.model('user_settings', user_settings_schema);


















