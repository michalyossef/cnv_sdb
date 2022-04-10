



'use strict';
module.exports = function(app) {
  var synthizesController = require('../../controllers/synthizes/synthizesController');

  // todoList Routes
  app.route('/synthizes/init_info').get(synthizesController.init_info);

  app.route('/synthizes/:project/units').get(synthizesController.getUnits);
  app.route('/synthizes/:project/:unit/users').get(synthizesController.getUsers);
  app.route('/synthizes/:project/:unit/:user/runids').get(synthizesController.getRunids);
  app.route('/synthizes/:project/:unit/:user/:run_id/stages').get(synthizesController.getStages);
  app.route('/synthizes/:project/:unit/:user/:run_id/:stage/dates').get(synthizesController.getDates);

  app.route('/synthizes/:project/cores').get(synthizesController.getCores);
  app.route('/synthizes/:project/:core/rtls').get(synthizesController.getRtls);
  app.route('/synthizes/:project/:core/:rtl/releases').get(synthizesController.getReleases);



/*  app.route('/tasks/:taskId')
    .get(todoList.read_a_task)
    .put(todoList.update_a_task)
    .delete(todoList.delete_a_task);*/

};













