'use strict';
module.exports = function(app) {
  var cellDistributionController = require('../../controllers/cellDistribution/cellDistributionController');


  app.route('/cellDist/:release_id').get(cellDistributionController.getInfo);



};
