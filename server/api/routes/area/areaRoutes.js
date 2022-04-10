'use strict';
module.exports = function(app) {
  var areaController = require('../../controllers/area/areaController');

  // todoList Routes
  app.route('/area/init_info').get(areaController.init_info);
  app.route('/area/delete').get(areaController.delete_project);
  app.route('/area/hide').get(areaController.hide_project);
  app.route('/area/advancedCompare').get(areaController.advancedCompare);
  app.route('/area/selfAndchildrenInfo/:release_id').get(areaController.fetchSelfAndChildrenInfo);
  app.route('/area/tree/:release_id').get(areaController.fetch_tree);
  app.route('/area/fullchip/:project').get(areaController.get_project_fullchip);
  app.route('/area/suggestions/:release_id').get(areaController.fetch_instance_suggestions);
  app.route('/area/:project/cores').get(areaController.project_cores);
  app.route('/area/:project/:core/rtls').get(areaController.project_core_rtls);
  app.route('/area/:project/:core/:rtl/releases').get(areaController.project_core_rtl_releases);
  app.route('/area/:project/:core/compare').get(areaController.project_core_compare);
  app.route('/area/:release_id').get(areaController.area_info);


};
