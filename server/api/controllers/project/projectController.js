'use strict';

var release_db = require('../../../released_db.js');
var unrelease_db = require('../../../unreleased_db.js');


// var mongoose = require('mongoose'),
var  configuration = release_db.model('configuration');
var  leakage_hierarchy = release_db.model('leakage_hierarchy');
var  area_hierarchy = release_db.model('area_hierarchy');
var  area_release = release_db.model('area_release');
var power_release_un = unrelease_db.model('power_release_un');
var  leakage_release = release_db.model('leakage_release');

var  project_configuration = release_db.model('project_configuration');


const path = require('path');

var async = require('async');


exports.init_info = function(req, res) {
  var calls = [];
  var projectsRes = [];
  calls.push(function(callback) {
      area_release.find({isHide: {$ne: true}}).distinct('project', function(err, projects) {
	if (!err && projects){
	    for(var i=0;i<projects.length;i++){
	      var project = projects[i];
	      if(projectsRes.indexOf(project) == -1)
		projectsRes.push(project);
	    }
	}
	callback(null, "ok");
      });
  });

  calls.push(function(callback) {
      leakage_release.find({isHide: {$ne: true}}).distinct('project', function(err, projects) {
	if (!err && projects){
	    for(var i=0;i<projects.length;i++){
	      var project = projects[i];
	      if(projectsRes.indexOf(project) == -1)
		projectsRes.push(project);
	    }
	}
	callback(null, "ok");
      });
  });

  calls.push(function(callback) {
      power_release_un.find().distinct('project', function(err, projects) {
	if (!err && projects){
	    for(var i=0;i<projects.length;i++){
	      var project = projects[i];
	      if(projectsRes.indexOf(project) == -1)
		projectsRes.push(project);
	    }
	}
	callback(null, "ok");
      });
  });

  calls.push(function(callback) {
      project_configuration.find().distinct('project', function(err, projects) {
	if (!err && projects){
	    for(var i=0;i<projects.length;i++){
	      var project = projects[i];
	      if(projectsRes.indexOf(project) == -1)
		projectsRes.push(project);
	    }
	}
	callback(null, "ok");
      });
  });



  async.parallel(calls, function(err, result) {
    res.json(projectsRes.sort());
  });
};


function getAreaFullChip(project, funCallBack){
  configuration.findOne({'project': project, 'name': 'fullchip', 'type': 'area'}, function(err, config) {
    if (err){
      funCallBack({'status': 'no', 'msg': 'error in find config area'});
      return;
    }
    if(!config){
      funCallBack({'status': 'no', 'msg': 'project area missing configurator'});
      return;
    }
    var config_json = config.toJSON();
    var cores = [];
    var calls = [];
    var G_NAND_EQU_CELL_list = [];
    config_json['order'].forEach(function(order){
	calls.push(function(callback) {
	    area_release.findOne({'project': project, 'core': order.core, isHide: {$ne: true}}, {}, {sort: {'file_creation_date': 1}, limit: 1}, function(err, core) {
	      if (!err && core){
		cores.push(core);
		var corObj = core.toObject();
		G_NAND_EQU_CELL_list.push(corObj["G_NAND_EQU_CELL"]);
	      }
	      callback(null, order);
	    });
	}
    )});

    async.parallel(calls, function(err, result) {
	var resultCores = [];
	var calls2 = [];
	cores.forEach(function(release){
	    calls2.push(function(callback2) {
		area_hierarchy.findOne({'release_id': release.project+"|"+release.core+"|"+release.rtl_name+"|"+release.release_name, 'level': 1}, function(err, rel) {
		  if (!err && rel){
		    resultCores.push(rel);
		  }
		  callback2(null, release);
		});
	    })
	});
	async.parallel(calls2, function(err, result) {
	    var coresObj = [];
	    for(var i=0;i<resultCores.length;i++){
		var coreObj = resultCores[i].toObject();
		var releaseInfo = resultCores[i]["release_id"].split("|");
		coreObj["project"] = releaseInfo[0];
		coreObj["core"] = releaseInfo[1];
		coreObj["rtl_name"] = releaseInfo[2];
		coreObj["release_name"] = releaseInfo[3];
		coreObj["G_NAND_EQU_CELL"] = G_NAND_EQU_CELL_list[i];
		coresObj.push(coreObj);
	    }
	    var ordered_cores = [];
	    for(var i=0;i<config_json['order'].length;i++){
		var curr_core = config_json['order'][i].core;
		for(var j=0;j<coresObj.length;j++){
		    var check_core = coresObj[j];
		    if(check_core.core == curr_core){
			ordered_cores.push(check_core);
		    }
		}
	    }
// 	    console.log("1");
// 	    console.log({"config": config, "cores": ordered_cores});
	    funCallBack({'status': 'ok', 'data': {"config": config, "cores": ordered_cores}});
// 	    return {'status': 'ok', 'data': {"config": config, "cores": ordered_cores}};
	});
    });
  });
}


function getLeakageFullChip(project, funCallBack){
  configuration.findOne({'project': project, 'name': 'fullchip', 'type': 'leakage'}, function(err, config) {
    if (err){
      funCallBack({'status': 'no', 'msg': 'error in find config leakage'});
      return;
    }
    if(!config){
      funCallBack({'status': 'no', 'msg': 'project leakage missing configurator'});
      return;
    }
    var config_json = config.toJSON();
    var cores = [];
    var calls = [];
    config_json['order'].forEach(function(order){
	calls.push(function(callback) {
	    leakage_release.findOne({'project': project, 'core': order.core, isHide: {$ne: true}}, {}, {sort: {'file_creation_date': 1}, limit: 1}, function(err, core) {
	      if (!err && core){
		cores.push(core);
	      }
	      callback(null, order);
	    });
	}
    )});
    
    async.parallel(calls, function(err, result) {
	var resultCores = [];
	var calls2 = [];
	cores.forEach(function(release){
	    calls2.push(function(callback2) {
		leakage_hierarchy.findOne({'release_id': release.project+"|"+release.core+"|"+release.rtl_name+"|"+release.release_name, 'level': 1}, function(err, rel) {
		  if (!err && rel){
		    resultCores.push(rel);
		  }
		  callback2(null, release);
		});
	    })
	});
	async.parallel(calls2, function(err, result) {
	    var coresObj = [];
	    for(var i=0;i<resultCores.length;i++){
		var coreObj = resultCores[i].toObject();
		var releaseInfo = resultCores[i]["release_id"].split("|");
		coreObj["project"] = releaseInfo[0];
		coreObj["core"] = releaseInfo[1];
		coreObj["rtl_name"] = releaseInfo[2];
		coreObj["release_name"] = releaseInfo[3];
		coresObj.push(coreObj);
	    }
	    var ordered_cores = [];
	    for(var i=0;i<config_json['order'].length;i++){
		var curr_core = config_json['order'][i].core;
		for(var j=0;j<coresObj.length;j++){
		    var check_core = coresObj[j];
		    if(check_core.core == curr_core){
			ordered_cores.push(check_core);
		    }
		}
	    }
// 	    console.log("2");
// 	    console.log({"config": config, "cores": ordered_cores});

	    funCallBack({'status': 'ok', 'data': {"config": config, "cores": ordered_cores}});
	});
    });
  });
}


exports.get_project_fullchip = function(req, res) {
  var calls = [];
  var areaFullChip;
  var leakageFullChip;
  calls.push(function(callback) {
      getAreaFullChip(req.params.project, function(resInfo){
	if(resInfo && resInfo['status'] == 'ok'){
	  areaFullChip = resInfo['data'];
// 	    console.log("3");
// 	  console.log(areaFullChip);
	}
// 	callback(null, "ok");
      });
  });

  calls.push(function(callback) {
      getLeakageFullChip(req.params.project, function(resInfo){
	if(resInfo && resInfo['status'] == 'ok'){
	  leakageFullChip = resInfo['data'];
// 	    console.log("4");
// 	  console.log(leakageFullChip);
	}
// 	callback(null, "ok");
      });

  });

  async.parallel(calls, function(err, result) {
	    console.log("5");

//     console.log(areaFullChip);
//     console.log(leakageFullChip);
    res.json({'areaChip': areaFullChip, 'leakageChip': leakageFullChip});
  });

};



function getLeakageReleases(project, funCallBack){
  configuration.findOne({'project': project, 'name': 'fullchip', 'type': 'leakage'}, function(err, config) {
    if (err){
      funCallBack({'status': 'no', 'msg': 'error in find config leakage'});
      return;
    }
    if(!config){
      funCallBack({'status': 'no', 'msg': 'project leakage missing configurator'});
      return;
    }
    var config_json = config.toJSON();
    var cores = [];
    var calls = [];
    config_json['order'].forEach(function(order){
	console.log(order.core);
	calls.push(function(callback) {
	    leakage_release.find({'project': project, 'core': order.core, isHide: {$ne: true}}, {}, {sort: {'file_creation_date': -1}}, function(err, core) {
	      if (!err && core.length>0){
// 		console.log(core);
		cores.push(core);
	      }
	      callback(null, order);
	    });
	}
    )});


    async.parallel(calls, function(err, result) {
	funCallBack({'status': 'ok', 'data': {"cores": cores}});
    });
  });
}


function getAreaReleases(project, funCallBack){
  configuration.findOne({'project': project, 'name': 'fullchip', 'type': 'area'}, function(err, config) {
    if (err){
      funCallBack({'status': 'no', 'msg': 'error in find config leakage'});
      return;
    }
    if(!config){
      funCallBack({'status': 'no', 'msg': 'project leakage missing configurator'});
      return;
    }
    var config_json = config.toJSON();
    var cores = [];
    var calls = [];
    config_json['order'].forEach(function(order){
	calls.push(function(callback) {
	    area_release.find({'project': project, 'core': order.core, isHide: {$ne: true}}, {}, {sort: {'file_creation_date': -1}}, function(err, core) {
	      if (!err && core.length>0){
// 		console.log(core);
		cores.push(core);
	      }
	      callback(null, order);
	    });
	}
    )});
    async.parallel(calls, function(err, result) {
	funCallBack({'status': 'ok', 'data': {"cores": cores}});
    });
  });
}






exports.get_project_releases = function(req, res) {
  var calls = [];
  var areaFullChip;
  var leakageFullChip;
  calls.push(function(callback) {
      getAreaReleases(req.params.project, function(resInfo){
	if(resInfo && resInfo['status'] == 'ok'){
	  areaFullChip = resInfo['data'];
	}
	callback(null, "ok");
      });
  });

  calls.push(function(callback) {
      getLeakageReleases(req.params.project, function(resInfo){
	if(resInfo && resInfo['status'] == 'ok'){
	  leakageFullChip = resInfo['data'];
	}
	callback(null, "ok");
      });

  });

  async.parallel(calls, function(err, result) {
    res.json({'areaChip': areaFullChip, 'leakageChip': leakageFullChip});
  });

};



exports.get_excel_file = function(req, res) {

  var filename = path.basename(req.query.path);

//   res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
// var filename = path.basename(fullFileName);

  res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
//   res.setHeader('Content-Transfer-Encoding', 'binary');
//   res.setHeader('Content-Type', 'application/octet-stream');

  res.sendFile(req.query.path, function(err){
    console.log(err);
  });
};






















