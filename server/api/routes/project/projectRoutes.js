'use strict';
module.exports = function(app) {
  var projectController = require('../../controllers/project/projectController');

  // todoList Routes
  app.route('/project/init_info').get(projectController.init_info);
  app.route('/project/fullchip/:project').get(projectController.get_project_fullchip);
  app.route('/project/releases/:project').get(projectController.get_project_releases);
  app.route('/project/excel').get(projectController.get_excel_file);





/*  app.route('/tasks/:taskId')
    .get(todoList.read_a_task)
    .put(todoList.update_a_task)
    .delete(todoList.delete_a_task);*/

};
