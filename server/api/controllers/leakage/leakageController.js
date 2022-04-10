'use strict';

var release_db = require('../../../released_db.js');
var unreleased_db = require('../../../unreleased_db.js');


// var mongoose = require('mongoose'),
var  configuration = release_db.model('configuration');
var  leakage_hierarchy = release_db.model('leakage_hierarchy');
var  leakage_release = release_db.model('leakage_release');

var  leakage_hierarchy_un = unreleased_db.model('leakage_hierarchy_un');
var  leakage_release_un = unreleased_db.model('leakage_release_un');



var async = require('async');


exports.init_info = function(req, res) {
  leakage_release.find({isHide: {$ne: true}}).distinct('project', function(err, projects) {
    if (err){
      res.send(err);
      return;
    }
    res.json(projects);
  });
};


exports.project_cores = function(req, res) {
  leakage_release.find({'project': req.params.project, isHide: {$ne: true}}).distinct('core', function(err, cores) {
    if (err){
      res.send(err);
      return;
    }
    res.json(cores);
  });
};

exports.project_core_rtls = function(req, res) {
  leakage_release.find({'project': req.params.project,'core': req.params.core, isHide: {$ne: true}}).distinct('rtl_name', function(err, releases) {
    if (err){
      res.send(err);
      return;
    }
    res.json(releases);
  });
};


exports.project_core_rtl_releases = function(req, res) {
  leakage_release.find({'project': req.params.project,'core': req.params.core, 'rtl_name': req.params.rtl, isHide: {$ne: true}}).distinct('release_name', function(err, releases) {
    if (err){
      res.send(err);
      return;
    }
    res.json(releases);
  });
};


exports.getTopHierarchy = function(req, res) {
//   var extraInfo = JSON.parse(req.query.info);
  var regStr = req.params.project + "\\|";
  regStr += req.params.core + "\\|";
//   leakage_hierarchy.remove({'release_id': {$regex: new RegExp('^' + regStr)}}, function(err, rows) {

  leakage_hierarchy.find({'release_id': {$regex: new RegExp('^' + regStr)}, "level": {$lt: 5}, isHide: {$ne: true}}, {"name": 1, "instance": 1, "level": 1}, function(err, instances) {
    if (err){
      res.send(err);
      return;
    }
    res.json(instances);
  });
};



// exports.get_project_fullchip = function(req, res) {
//   configuration.findOne({'project': req.params.project, 'name': 'fullchip', 'type': 'leakage'}, function(err, config) {
//     if (err){
//       res.send(err);
//       return;
//     }
//     if(!config){
//       res.send({"msg": "project missing configurator"});
//       return;
//     }
//     var config_json = config.toJSON();
//     var cores = [];
//     var calls = [];
//     config_json['order'].forEach(function(order){
// 	calls.push(function(callback) {
// 	    leakage.findOne({'project': req.params.project, 'core': order.core, 'level': 1}, {}, {sort: {'file_creation_date': 1}, limit: 1}, function(err, core) {
// 	      if (!err && core){
// 		cores.push(core)
// 	      }
// 	      callback(null, order);
// 	    });
// 	}
//     )});
//     async.parallel(calls, function(err, result) {
// 	var ordered_cores = [];
// 	for(var i=0;i<config_json['order'].length;i++){
// 	    var curr_core = config_json['order'][i].core;
// 	    for(var j=0;j<cores.length;j++){
// 		var check_core = cores[j].toJSON();
// 		if(check_core.core == curr_core){
// 		    ordered_cores.push(check_core);
// 		}
// 	    }
// 	}
// 	res.json({"config": config, "cores": ordered_cores});
//     });
//   });
// };



exports.project_core_releases = function(req, res) {
  leakage_release.find({'project': req.params.project,'core': req.params.core, isHide: {$ne: true}}).distinct('rtl_version', function(err, releases) {
    if (err){
      res.send(err);
      return;
    }
    res.json(releases);
  });
};


exports.leakage_info = function(req, res) {

  var db_hierarchy;

  if(req.query.releaseType == "released"){
    db_hierarchy = leakage_hierarchy;
  }
  if(req.query.releaseType == "unreleased"){
    db_hierarchy = leakage_hierarchy_un;
  }

  console.log({'release_id': req.params.release_id, 'parentPath': req.query.parent});
  db_hierarchy.find({'release_id': req.params.release_id, 'parentPath': req.query.parent} , function(err, rows) {
    if (err){
      res.send(err);
      return;
    }
    res.json(rows);
  });
};


exports.fetch_instance_suggestions = function(req, res) {
  
  var db_hierarchy;

  if(req.query.releaseType == "released"){
    db_hierarchy = leakage_hierarchy;
  }
  if(req.query.releaseType == "unreleased"){
    db_hierarchy = leakage_hierarchy_un;
  }

  db_hierarchy.find({'release_id': req.params.release_id, "name": {"$regex": req.query.instance} }, { "name": 1, "instance": 1}, {sort: {"level": 1}, limit: 100} , function(err, rows) {
    if (err){
      res.send(err);
      return;
    }
    res.json(rows);
  });
};


exports.fetch_tree = function(req, res) {
  var db_hierarchy;

  if(req.query.releaseType == "released"){
    db_hierarchy = leakage_hierarchy;
  }
  if(req.query.releaseType == "unreleased"){
    db_hierarchy = leakage_hierarchy_un;
  }

  var allParents = req.query.instance.split("/");
  var parentPaths = ['root']
  var currPath = null

    if (allParents.length < 10000) {
        currPath = allParents[0];
        for (var i = 1; i < allParents.length + 1; i++) {
            parentPaths.push(currPath);
            currPath += "/" + allParents[i];
        }
    }

  db_hierarchy.find({'release_id': req.params.release_id, 'parentPath': { "$in": parentPaths}} , function(err, rows) {
    if (err){
      res.send(err);
      return;
    }
    res.json(rows);
  });
};


exports.delete_project = function(req, res) {
  var level = req.query.level;
  var extraInfo = JSON.parse(req.query.info);
  var regStr = "";
  if(extraInfo['project']){
    regStr += extraInfo['project'] + "\\|";
    if(extraInfo['core']){
      regStr += extraInfo['core'] + "\\|";
      if(extraInfo['rtl_name']){
	regStr += extraInfo['rtl_name'] + "\\|";
	if(extraInfo['release_name']){
	  regStr += extraInfo['release_name'];
	}
      }
    }
  }else{
    return;
  }

  leakage_hierarchy.remove({'release_id': {$regex: new RegExp('^' + regStr)}}, function(err, rows) {
    if (err){
      res.send(err);
      return;
    }
//     var answer = [];

//     res.json(answer);

    leakage_release.remove(extraInfo, function(err, rows) {
      if (err){
	res.send(err);
	return;
      }
      res.json({'status': 'ok'});
    });


  });


};

exports.hide_project = function(req, res) {
  var level = req.query.level;
  var extraInfo = JSON.parse(req.query.info);

  leakage_release.update(extraInfo, {$set: { isHide: true }}, {multi: true} , function(err, rows) {
    if (err){
      res.send(err);
      return;
    }
    res.json(rows);
  });

};




exports.project_core_compare = function(req, res) {
//   if(req.query.instance && req.query.instance != 'root'){
//     leakage_release.find({'project': req.params.project,'core': req.params.core,'instance': req.query.instance} , function(err, rows) {
//       if (err){
// 	res.send(err);
// 	return;
//       }
//       rows.sort(function(a,b){
// 	var b = b.toJSON();
// 	var a = a.toJSON();
// 	return new Date(a["file_creation_date"]) - new Date(b["file_creation_date"]);
//       });
//       res.json(rows);
//     });
//   }else{
//     leakage_release.find({'project': req.params.project,'core': req.params.core,'level': 1}, function(err, rows) {
//       if (err){
// 	res.send(err);
// 	return;
//       }
//       rows.sort(function(a,b){
// 	var b = b.toJSON();
// 	var a = a.toJSON();
// 	return new Date(a["file_creation_date"]) - new Date(b["file_creation_date"]);
//       });
//       res.json(rows);
//     });
//   }

    var db_release;
    var db_hierarchy;
    var release_query;
    var needed_fields;
    if(req.query.releaseType == "released"){
      db_release = leakage_release;
      db_hierarchy = leakage_hierarchy;
      release_query = {'core': req.params.core, isHide: {$ne: true}};
      needed_fields = {'project': 1,'rtl_name': 1, 'release_name': 1, 'file_creation_date': 1, 'G_NAND_EQU_CELL': 1};
    }
    if(req.query.releaseType == "unreleased"){
      db_release = leakage_release_un;
      db_hierarchy = leakage_hierarchy_un;
      release_query = {'unit': req.params.core, isHide: {$ne: true}};
      needed_fields = {'project': 1,'user': 1, 'run_id': 1, 'stage': 1, 'date': 1, 'file_creation_date': 1, 'G_NAND_EQU_CELL': 1};
    }

    if(req.query.isCustom && req.query.isCustom == "true"){
      release_query['project'] = req.params.project;
    }

  if(req.query.instance && req.query.instance != 'root'){

    db_release.find(release_query, needed_fields, function(err, releases) {
      if (err){
	res.send(err);
	return;
      }
      var release_ids = [];
      var G_NAND_EQU_CELL_list = [];
      for(var j=0;j<releases.length;j++){
	  var rel = releases[j].toObject();
	  if(req.query.releaseType == "released"){
	    release_ids.push(rel["project"] + "|" + req.params.core + "|" + rel["rtl_name"] + "|" + rel["release_name"]);
	  }
	  if(req.query.releaseType == "unreleased"){
	    release_ids.push(rel["project"] + "|" + req.params.core + "|" + rel["user"] + "|" + rel["run_id"] + "|" + rel["stage"] + "|" + rel["date"]);
	  }
	  G_NAND_EQU_CELL_list.push(rel["G_NAND_EQU_CELL"]);
      }
      db_hierarchy.find({'release_id': {"$in" : release_ids}, 'instance': req.query.instance} , function(err, rows) {
	if (err){
	  res.send(err);
	  return;
	}
	var answer = [];
	for(var k=0;k<rows.length;k++){
	    var currRow = rows[k].toObject();
	    var proj_id = currRow['release_id'];
	    var proj_info = proj_id.split("|");
	    if(req.query.releaseType == "released"){
	      currRow['project'] = proj_info[0];
	      currRow['core'] = proj_info[1];
	      currRow['rtl_name'] = proj_info[2];
	      currRow['release_name'] = proj_info[3];
	    }
	    if(req.query.releaseType == "unreleased"){
	      currRow['project'] = proj_info[0];
	      currRow['unit'] = proj_info[1];
	      currRow['user'] = proj_info[2];
	      currRow['run_id'] = proj_info[3];
	      currRow['stage'] = proj_info[4];
	      currRow['date'] = proj_info[5];
	    }
	    currRow['G_NAND_EQU_CELL'] = G_NAND_EQU_CELL_list[k];
	    answer.push(currRow);
	}

	res.json(answer);
      });
    });

  }else{
    db_release.find(release_query, needed_fields, function(err, releases) {
      if (err){
	res.send(err);
	return;
      }

      var release_ids = [];
      var G_NAND_EQU_CELL_list = [];
      for(var j=0;j<releases.length;j++){
	  var rel = releases[j].toObject();
	  if(req.query.releaseType == "released"){
	    release_ids.push(rel["project"] + "|" + req.params.core + "|" + rel["rtl_name"] + "|" + rel["release_name"]);
	  }
	  if(req.query.releaseType == "unreleased"){
	    release_ids.push(rel["project"] + "|" + req.params.core + "|" + rel["user"] + "|" + rel["run_id"] + "|" + rel["stage"] + "|" + rel["date"]);
	  }
	  G_NAND_EQU_CELL_list.push(rel["G_NAND_EQU_CELL"]);
      }

      db_hierarchy.find({'release_id': {"$in" : release_ids}, 'level': 1} , function(err, rows) {
	if (err){
	  res.send(err);
	  return;
	}
	var answer = [];
	for(var k=0;k<rows.length;k++){
	    var currRow = rows[k].toObject();
	    var proj_id = currRow['release_id'];
	    var proj_info = proj_id.split("|");
	    if(req.query.releaseType == "released"){
	      currRow['project'] = proj_info[0];
	      currRow['core'] = proj_info[1];
	      currRow['rtl_name'] = proj_info[2];
	      currRow['release_name'] = proj_info[3];
	    }
	    if(req.query.releaseType == "unreleased"){
	      currRow['project'] = proj_info[0];
	      currRow['unit'] = proj_info[1];
	      currRow['user'] = proj_info[2];
	      currRow['run_id'] = proj_info[3];
	      currRow['stage'] = proj_info[4];
	      currRow['date'] = proj_info[5];
	    }
	    currRow['G_NAND_EQU_CELL'] = G_NAND_EQU_CELL_list[k];
	    answer.push(currRow);
	}

	res.json(answer);
      });
    });
  }


};














