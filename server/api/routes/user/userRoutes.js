'use strict';
module.exports = function(app) {
  var userController = require('../../controllers/user/userController');

  // todoList Routes
  app.route('/user/verify').get(userController.user_info);

  app.route('/user/settings').get(userController.get_user_settings);
  app.route('/user/settings').post(userController.save_user_settings);


};













