'use strict';
module.exports = function(app) {
  var powerController = require('../../controllers/power/powerController');

  // todoList Routes
//   app.route('/power/init_info').get(powerController.init_info);

  app.route('/power/init_info').get(powerController.init_info);
//   app.route('/power/new').get(powerController.create_power_release);
//   app.route('/power/exist').get(powerController.update_power_release);

  app.route('/power/delete').get(powerController.delete_project);

  app.route('/power/compare').post(powerController.fetch_compare_date);

  app.route('/power/multipleUnitsReleases').post(powerController.getMultipleUnits);




  app.route('/power/released/:project/:core/clusters').get(powerController.project_core_release);

  app.route('/power/released/:project/:core/:cluster/primitives').get(powerController.project_core_release_cluster);

  app.route('/power/released/:project/:core/:cluster/:primitive/rtls').get(powerController.project_core_release_cluster_primitive);


  app.route('/power/info/released/:project/:core/:cluster/:primitive/:rtl').get(powerController.getReleaseInfo);
  app.route('/power/info/unreleased/:project/:top/:tag/:runid').get(powerController.getUnReleaseInfo);




  app.route('/power/unreleased/:project/:top/tags').get(powerController.project_unit_tags);
  app.route('/power/unreleased/:project/:top/:tag/runids').get(powerController.project_unit_tag_runids);



  app.route('/power/runs/:project/:top').get(powerController.getAllRuns);
  app.route('/power/releases/:project/:core/:cluster').get(powerController.getAllReleases);


  app.route('/power/publish/:project/:core/info').get(powerController.getPossibleClusters);

  app.route('/power/publish/:project/:top/:tag/:runid').get(powerController.publish_release);


  app.route('/power/tree/search/:release_id').get(powerController.project_tree_fetch_search);
  app.route('/power/tree/:release_id').get(powerController.project_tree);
  app.route('/power/suggestions/:release_id').get(powerController.fetch_instance_suggestions);
  app.route('/power/regex/tree/').get(powerController.project_regex_tree);

  app.route('/power/regex/node/').get(powerController.project_regex_node);


  app.route('/power/unreleased/tree/search/:release_id').get(powerController.project_tree_fetch_search_unreleased);
  app.route('/power/unreleased/tree/:release_id').get(powerController.project_tree_unreleased);
  app.route('/power/unreleased/suggestions/:release_id').get(powerController.fetch_instance_suggestions_unreleased);



  app.route('/power/:project/:core/clusters').get(powerController.project_core_clusters_summary);
  app.route('/power/:project/:core/:cluster/:primitive/:rtl/calculatedUnits').get(powerController.getCalculatedUnits);



  app.route('/power/:project/:core/:cluster').get(powerController.cluster_primitives_info);
  app.route('/power/newReleases').get(powerController.create_new_releases);



  app.route('/power/:project/cores').get(powerController.project_cores);
  app.route('/power/:project/units').get(powerController.project_units);

  app.route('/power/:project/:core/rtls').get(powerController.project_core_rtls);
//   app.route('/power/:project/:core/new').get(powerController.get_project_primitives);
//   app.route('/power/:project/:core/exist').get(powerController.fetchPrimitivesInfo);





/*  app.route('/tasks/:taskId')
    .get(todoList.read_a_task)
    .put(todoList.update_a_task)
    .delete(todoList.delete_a_task);*/

};
