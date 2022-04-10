'use strict';
module.exports = function(app) {
  var summaryController = require('../../controllers/summary/summaryController');

  // todoList Routes
  app.route('/summary/init_info').get(summaryController.init_info);
  app.route('/summary/data/:release_id').get(summaryController.getSummaryInfo);


  app.route('/summary/qor/:release_id').get(summaryController.getSummaryQor);
  app.route('/summary/check_design/:release_id').get(summaryController.getSummaryCheckDesign);
  app.route('/summary/check_timing/:release_id').get(summaryController.getSummaryCheckTiming);
  app.route('/summary/mv_drc/:release_id').get(summaryController.getSummaryMvDrc);


  app.route('/summary/:project').get(summaryController.getUnits);
  app.route('/summary/:project/:unit').get(summaryController.getUsers);
  app.route('/summary/:project/:unit/:user').get(summaryController.getRunids);
  app.route('/summary/:project/:unit/:user/:run_id').get(summaryController.getStages);
  app.route('/summary/:project/:unit/:user/:run_id/:stage').get(summaryController.getDates);




/*  app.route('/tasks/:taskId')
    .get(todoList.read_a_task)
    .put(todoList.update_a_task)
    .delete(todoList.delete_a_task);*/

};
