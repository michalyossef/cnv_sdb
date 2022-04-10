'use strict';
module.exports = function(app) {
  var timingController = require('../../controllers/timing/timingController');

  // todoList Routes
  app.route('/timing/init_info').get(timingController.init_info);
  app.route('/timing/data/:release_id').get(timingController.getTimingInfo);
  app.route('/timing/filterOptions/:release_id').get(timingController.getTimingFilterOptions);

  app.route('/timing/reports').get(timingController.getTimingReports);
  app.route('/timing/delays').get(timingController.getTimingDelays);
  app.route('/timing/scenarios').get(timingController.getTimingScenarios);



  app.route('/timing/:project').get(timingController.getUnits);
  app.route('/timing/:project/:unit').get(timingController.getUsers);
  app.route('/timing/:project/:unit/:user').get(timingController.getRunids);
  app.route('/timing/:project/:unit/:user/:run_id').get(timingController.getStages);
  app.route('/timing/:project/:unit/:user/:run_id/:stage').get(timingController.getDates);


//   app.route('/timing/:project/:unit/:user/:run_id').get(timingController.getStages);




/*  app.route('/tasks/:taskId')
    .get(todoList.read_a_task)
    .put(todoList.update_a_task)
    .delete(todoList.delete_a_task);*/

};
