'use strict';
module.exports = function(app) {
  var floorplanController = require('../../controllers/floorplan/floorplanController');

  // todoList Routes
//   app.route('/floorplan/').get(floorplanController.init_info);
  app.route('/floorplan/:release_id').get(floorplanController.floorplan_info);


};
