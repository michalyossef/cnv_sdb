'use strict';
module.exports = function(app) {
  var congestionController = require('../../controllers/congestion/congestionController');

  // todoList Routes
//   app.route('/power/init_info').get(powerController.init_info);

  app.route('/congestion/:release_id').get(congestionController.getCongestion);


};
