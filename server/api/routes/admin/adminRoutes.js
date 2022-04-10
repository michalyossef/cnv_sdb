'use strict';
module.exports = function(app) {
  var adminController = require('../../controllers/admin/adminController');

  // todoList Routes
//   app.route('/admin/primitives/:project').get(adminController.save_project_primitives);


  app.route('/admin/:project/fetch').get(adminController.project_info);
  app.route('/admin/:project/save').post(adminController.project_save);

  app.route('/admin/:project/new').post(adminController.create_project);




/*  app.route('/tasks/:taskId')
    .get(todoList.read_a_task)
    .put(todoList.update_a_task)
    .delete(todoList.delete_a_task);*/

};
