'use strict';
module.exports = function(app) {
  var cellMacroController = require('../../controllers/cellMacro/cellMacroController');


  app.route('/cellMacro/:release_id').get(cellMacroController.getInfo);



};
