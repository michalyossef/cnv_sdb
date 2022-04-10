'use strict';
var validateInput = require('../../utils/validateInput.js');
var release_db    = require('../../../released_db.js'); 

// var mongoose = require('mongoose');
// var power_primitive = release_db.model('power_primitive');
// var power_target = release_db.model('power_target');
// var power_primitive_metadata = release_db.model('power_primitive_metadata');

var project_configuration = release_db.model('project_configuration');
var project_configuration_backup = release_db.model('project_configuration_backup');


exports.project_info = function(req, res) {
	var project = "";
	if (validateInput(req.params.project)) { project = project}
	project_configuration.findOne({ 'project': project}, function(err, info) {
      if (err){
	res.send(err);
	return;
      }
      
      if(info && req.query.info){
	var key = req.query.info;
	if(info[key]){
	  res.json({'info': info[key]});
	  return;
	}
      }
      res.json({'info': info});

    });
};


exports.project_save = function(req, res) {
	var project = ""; if (validateInput(req.params.project)) { project = req.params.project}
	project_configuration.findOne({ 'project': project}, function(err, info) {
    if(info){
		info = info.toObject();
		delete info._id; 
		project_configuration_backup.create(info, function (err, small) {console.log(err);})
    }
	project_configuration.remove({ 'project': project} , function(err, docs) {
	if (err){
	  res.send(err);
	  return;
	}

	var tmp = {'project': req.params.project, 'power_configuration': req.body.power_configuration, 'changed_by': req.body.username};
	project_configuration.create(tmp, function (err, small) {
	    if (err){
	      res.send(err);
	      return;
	    }
	    res.json(tmp);
	});
      });
    });

};

exports.create_project = function(req, res) {
	var project = ""; if (validateInput(req.params.project)) { project = req.params.project }
	project_configuration.findOne({ 'project': project}, function(err, info) {
      if (err){
	res.send(err);
	return;
      }

      if(info){
	res.status(400).send({"error": "Project exists"});
	return;
      }

      if(req.body.dupProject){
	  project_configuration.findOne({'project': validateInput(req.body.dupProject)}, function(err, info) {
	    if (err){
	      res.send(err);
	      return;
	    }

	    info = info.toObject();
	    info['project'] = req.params.project;
	    delete info['_id'];
	    project_configuration.create(info, function (err, small) {
		if (err){
		  res.send(err);
		  return;
		}
		res.json({'status': "OK"});
	    });
	  });
      }else{ var project = ""; if (validateInput(req.params.project)) { project = req.params.project }
	  project_configuration.create({'project': project}, function (err, small) {
	    if (err){
	      res.send(err);
	      return;
	    }
	    res.json({'status': "OK"});
	});
      }

    });

};




// exports.project_info = function(req, res) {
//     power_primitive.find({'project': req.params.project}, {'project': 1, 'core': 1, 'clusters': 1, 'primitives': 1, 'instancePaths': 1, 'projectPowerInfo': 1} , function(err, cores) {
//       if (err){
// 	res.send(err);
// 	return;
//       }
//       var coresObj = [];
//       for(var i=0;i<cores.length;i++){
// 	var cor = cores[i].toObject();
// 	coresObj.push(cor);
//       }
// 
//       power_target.find({'project': req.params.project}, {'project': 1, 'core': 1, 'cluster': 1, 'primitive': 1, 'value': 1} , function(err, targets) {
// 	if (err){
// 	  res.send(err);
// 	  return;
// 	}
// 	for(var i=0;i<coresObj.length;i++){
// 	  var core = coresObj[i]['core'];
// 	  for (var idx in targets) {
// 	    if(targets[idx]['core'] == core){
// 	      var targ = targets[idx].toObject();
// 	      var cluster = targ['cluster'];
// 	      var primitive = targ['primitive'];
// 	      if(!coresObj[i]['targetsInfo'])
// 		coresObj[i]['targetsInfo'] = {};
// 	      if(!coresObj[i]['targetsInfo'][cluster])
// 		coresObj[i]['targetsInfo'][cluster] = {};
// 
// 	      coresObj[i]['targetsInfo'][cluster][primitive] = targ['value'];
// 	    }
// 	  }
// 	}
// 
// 	power_primitive_metadata.find({'project': req.params.project}, {'project': 1, 'core': 1, 'primitiveName': 1, 'meta': 1} , function(err, primitivesMetaDatas) {
// 	  if (err){
// 	    res.send(err);
// 	    return;
// 	  }
// 
// 	  var addedKeys = false;
// 	  for(var i=0;i<coresObj.length;i++){
// 	    var primitivesMetaData = [];
// 	    var core = coresObj[i]['core'];
// 	    for (var idx in primitivesMetaDatas) {
// 	      if(primitivesMetaDatas[idx]['core'] == core){
// 
// 
// 		var primitivesMetaDataInfo = primitivesMetaDatas[idx].toObject();
// 		var metas = primitivesMetaDataInfo['meta'];
// 		if(metas){
// 		  var originalKeys = Object.keys(metas).sort();
// 		}
// 		if(!addedKeys){
// 		  if(originalKeys){
// 		    var clonedKeys = JSON.parse(JSON.stringify(originalKeys))
// 		  }else{
// 		    var clonedKeys = [];
// 		  }
// 		  for(var j=0;j<clonedKeys.length;j++){
// 		      clonedKeys[j] = clonedKeys[j].replace(/_-_/g,".");
// 		  }
// 		  clonedKeys.unshift("Name");
// 		  primitivesMetaData.push(clonedKeys);
// 		  addedKeys = true;
// 		}
// 		var vals = [];
// 		for(var j=0;originalKeys && j<originalKeys.length;j++){
// 		   var kk = originalKeys[j];
// 		   var vv = metas[kk];
// 		   vals.push(vv);
// 		}
// 
// 		vals.unshift(primitivesMetaDataInfo['primitiveName']);
// 		primitivesMetaData.push(vals);
// 
// 	      }
// 	    }
// 	    coresObj[i]['primitivesMetaData'] = primitivesMetaData.sort();
// 	  }
// 
// 	  var projectPowerInfo = {};
// 	  if(coresObj && coresObj.length > 0){
// 	      projectPowerInfo = coresObj[0]['projectPowerInfo'];
// 	  }
// 	  res.json({'power': coresObj, 'projectPowerInfo': projectPowerInfo});
// 	});
// 
// 
// 
// 	
//       });
//     });
// };

function addZeroes( num ) {

   if (String(num).split(".").length < 2){
       num = num.toFixed(1);
   }
   return num;
}

// exports.save_project_primitives = function(req, res) {
//     var qInfo = [];
//     if(!Array.isArray(req.query.info)){
//       qInfo.push(req.query.info);
//     }else{
//       qInfo = req.query.info;
//     }
// 
//     var projectPowerInfo = {};
//     projectPowerInfo = JSON.parse(req.query.projectPowerInfo);
//     if(projectPowerInfo && projectPowerInfo['voltage'])
//       projectPowerInfo['voltage'] = addZeroes(projectPowerInfo['voltage']);
// 
//     var primitives = [];
//     var primitivesMeta = [];
//     for(var i=0;i<qInfo.length;i++){
// 	var obj = JSON.parse(qInfo[i]);
// 	var primitive = {'project': req.params.project};
// 	primitive['core'] = obj['core'];
// 	primitive['clusters'] = obj['clusters'];
// 	primitive['primitives'] = obj['primitives'];
// 
// 	if(primitive['primitives'] && primitive['primitives'].length > 0){
// 	    var primMeta = obj['primitivesMetaData'];
// 	    var cols = primMeta[0];
// 	    for(var j=1;j<primMeta.length;j++){
// 	      var temp = {};
// 	      temp['project'] = primitive['project'];
// 	      temp['core'] = primitive['core'];
// 	      temp['primitiveName'] = primMeta[j][0];
// 	      for(var k=1;k<primMeta[j].length;k++){
// 		var ke = cols[k].replace(/\./g,"_-_");
// 		var va = primMeta[j][k];
// 		if(!temp['meta']){
// 		  temp['meta'] = {};
// 		}
// 		temp['meta'][ke] = va;
// 	      }
// 	      if(temp['primitiveName'] != "")
// 		primitivesMeta.push(temp);
// 	    }
// 	}
// 
// 	primitive['projectPowerInfo'] = projectPowerInfo;
// 	primitive['instancePaths'] = obj['instancePaths'];
// 
// 	primitives.push(primitive);
//     }
// 
//     var targets = [];
//     for(var i=0;i<qInfo.length;i++){
// 	var obj = JSON.parse(qInfo[i]);
// 	for (var cluster in obj['targetsInfo']) {
// 	  for (var primitive in obj['targetsInfo'][cluster]) {
// 	      var val = obj['targetsInfo'][cluster][primitive];
// 	      var pTarget = {'project': req.params.project};
// 	      pTarget['core'] = obj['core'];
// 	      pTarget['cluster'] = cluster;
// 	      pTarget['primitive'] = primitive;
// 	      pTarget['value'] = val;
// 	      targets.push(pTarget);
// 	  }
// 	}
//     }
// 
//     power_primitive.remove({'project': req.params.project} , function(err, docs) {
//       if (err){
// 	res.send(err);
// 	return;
//       }
// 
//       power_target.remove({'project': req.params.project}, function (err, docs) {
// 
// 	  if (err){
// 	    res.send(err);
// 	    return;
// 	  }
// 
// 	  power_primitive_metadata.remove({'project': req.params.project}, function (err, docs) {
// 
// 	      if (err){
// 		res.send(err);
// 		return;
// 	      }
// 
// 	      power_primitive.create(primitives, function (err, small) {
// 
// 		  if (err){
// 		    res.send(err);
// 		    return;
// 		  }
// 
// 		  power_target.create(targets, function (err, small) {
// 
// 		      if (err){
// 			res.send(err);
// 			return;
// 		      }
// 
// 		      power_primitive_metadata.create(primitivesMeta, function (err, small) {
// 
// 			  if (err){
// 			    res.send(err);
// 			    return;
// 			  }
// 
// 			  res.json({'status': 'ok'});
// 		      });
// 		  });
// 	      });
// 	});
//       });
// 
// 
// 
//     });
// 
// };



















































