'use strict';
module.exports = function(app) {
  var leakageController = require('../../controllers/leakage/leakageController');

  // todoList Routes
  app.route('/leakage/init_info').get(leakageController.init_info);
  app.route('/leakage/delete').get(leakageController.delete_project);
  app.route('/leakage/hide').get(leakageController.hide_project);
  app.route('/leakage/tree/:release_id').get(leakageController.fetch_tree);
//   app.route('/leakage/fullchip/:project').get(leakageController.get_project_fullchip);
  app.route('/leakage/suggestions/:release_id').get(leakageController.fetch_instance_suggestions);
  app.route('/leakage/:project/cores').get(leakageController.project_cores);
  app.route('/leakage/:project/:core/rtls').get(leakageController.project_core_rtls);
  app.route('/leakage/:project/:core/:rtl/releases').get(leakageController.project_core_rtl_releases);
  app.route('/leakage/:project/:core/compare').get(leakageController.project_core_compare);
  app.route('/leakage/:release_id/').get(leakageController.leakage_info);


  app.route('/leakage/topHierarchy/:project/:core').get(leakageController.getTopHierarchy);



/*  app.route('/tasks/:taskId')
    .get(todoList.read_a_task)
    .put(todoList.update_a_task)
    .delete(todoList.delete_a_task);*/

};
