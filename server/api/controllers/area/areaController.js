'use strict';


var release_db = require('../../../released_db.js');
var unrelease_db = require('../../../unreleased_db.js');

var  configuration = release_db.model('configuration');
var  area_hierarchy = release_db.model('area_hierarchy');
var  area_release = release_db.model('area_release');


var  area_hierarchy_un = unrelease_db.model('area_hierarchy_un');
var  area_release_un = unrelease_db.model('area_release_un');
var  validateInput = require('../../utils/validateInput.js');


var async = require('async');


exports.init_info = function(req, res) {
  area_release.find({isHide: {$ne: true}}).distinct('project', function(err, projects) {
    if (err){
      res.send(err);
      return;
    }
    res.json(projects);
  });
};


exports.project_cores = function(req, res) {
  area_release.find({'project': validateInput(req.params.project), isHide: {$ne: true}}).distinct('core', function(err, cores) {
    if (err){
      res.send(err);
      return;
    }
    res.json(cores);
  });
};



exports.get_project_fullchip = function(req, res) {
  configuration.findOne({'project': validateInput(req.params.project), 'name': 'fullchip', 'type': 'area'}, function(err, config) {
    if (err){
      res.send(err);
      return;
    }
    if(!config){
      res.send({"msg": "project missing configurator"});
      return;
    }
    var config_json = config.toJSON();
    var cores = [];
    var calls = [];
    var G_NAND_EQU_CELL_list = [];
    config_json['order'].forEach(function(order){
	calls.push(function(callback) {
        area_release.findOne({ 'project': validateInput(req.params.project), 'core': order.core, isHide: {$ne: true}}, {}, {sort: {'file_creation_date': 1}, limit: 1}, function(err, core) {
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
// 		    var rel2 = rel.toObject();
// 
// 		    rel2["project"] = release.project;
// 		    rel2["core"] = release.core;
// 		    rel2["rtl_name"] = release.rtl_name;
// 		    rel2["release_name"] = release.release_name;

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
	    res.json({"config": config, "cores": ordered_cores});
	});
    });


  });
};



exports.project_core_rtls = function(req, res) {
  area_release.find({'project': validateInput(req.params.project),'core': validateInput(req.params.core), isHide: {$ne: true}}).distinct('rtl_name', function(err, releases) {
    if (err){
      res.send(err);
      return;
    }
    res.json(releases);
  });
};

exports.project_core_rtl_releases = function(req, res) {
    area_release.find({ 'project': validateInput(req.params.project), 'core': validateInput(req.params.core), 'rtl_name': validateInput(req.params.rtl), isHide: {$ne: true}}).distinct('release_name', function(err, releases) {
    if (err){
      res.send(err);
      return;
    }
    res.json(releases);
  });
};


exports.area_info = function(req, res) {
  var db_release;
  var db_hierarchy;
  var release_info = (validateInput(req.params.release_id)).split("|");
  var release_query;

  if(req.query.releaseType == "released"){
    db_release = area_release;
    db_hierarchy = area_hierarchy;
    release_query = {'project': release_info[0],'core': release_info[1], 'rtl_name': release_info[2], 'release_name': release_info[3], isHide: {$ne: true}};
  }
  if(req.query.releaseType == "unreleased"){
    db_release = area_release_un;
    db_hierarchy = area_hierarchy_un;
    release_query = {'project': release_info[0], 'unit': release_info[1], 'user': release_info[2], 'run_id': release_info[3], 'stage': release_info[4], 'date': release_info[5], isHide: {$ne: true}};
  }

  db_release.findOne(release_query, function(err, release) {
    if (err){
      res.send(err);
      return;
    }
    if(!release){
      res.json({});
      return;
    }
    var releaseObj = release.toObject();
      db_hierarchy.find({ 'release_id': validateInput(req.params.release_id), 'parentPath': validateInput(req.query.parent)} , function(err, rows) {
      if (err){
	res.send(err);
	return;
      }
      var answer = [];
      for(var k=0;k<rows.length;k++){
	  var currRow = rows[k].toObject();
	  currRow['G_NAND_EQU_CELL'] = releaseObj['G_NAND_EQU_CELL'];
	  answer.push(currRow);
      }
      res.json(answer);
    });
  });
};



exports.area_info = function(req, res) {
  var db_release;
  var db_hierarchy; var release_id = validateInput(req.params.release_id);
  var release_info = release_id.split("|");
  var release_query;

  if(req.query.releaseType == "released"){
    db_release = area_release;
    db_hierarchy = area_hierarchy;
    release_query = {'project': release_info[0],'core': release_info[1], 'rtl_name': release_info[2], 'release_name': release_info[3], isHide: {$ne: true}};
  }
  if(req.query.releaseType == "unreleased"){
    db_release = area_release_un;
    db_hierarchy = area_hierarchy_un;
    release_query = {'project': release_info[0], 'unit': release_info[1], 'user': release_info[2], 'run_id': release_info[3], 'stage': release_info[4], 'date': release_info[5], isHide: {$ne: true}};
  }

  db_release.findOne(release_query, function(err, release) {
    if (err){
      res.send(err);
      return;
    }
    if(!release){
      res.json({});
      return;
    }
    var releaseObj = release.toObject();
    db_hierarchy.find({'release_id': validateInput(req.params.release_id), 'parentPath': validateInput(req.query.parent)} , function(err, rows) {
      if (err){
	res.send(err);
	return;
      }
      var answer = [];
      for(var k=0;k<rows.length;k++){
	  var currRow = rows[k].toObject();
	  currRow['G_NAND_EQU_CELL'] = releaseObj['G_NAND_EQU_CELL'];
	  answer.push(currRow);
      }
      res.json(answer);
    });
  });
};



exports.fetchSelfAndChildrenInfo = function(req, res) {
  var db_release;
  var db_hierarchy;
  var release_info = (validateInput(req.params.release_id)).split("|");
  var release_query;

  if(req.query.releaseType == "released"){
    db_release = area_release;
    db_hierarchy = area_hierarchy;
    release_query = {'project': release_info[0],'core': release_info[1], 'rtl_name': release_info[2], 'release_name': release_info[3], isHide: {$ne: true}};
  }
  if(req.query.releaseType == "unreleased"){
    db_release = area_release_un;
    db_hierarchy = area_hierarchy_un;
    release_query = {'project': release_info[0], 'unit': release_info[1], 'user': release_info[2], 'run_id': release_info[3], 'stage': release_info[4], 'date': release_info[5], isHide: {$ne: true}};
  }

  db_release.findOne(release_query, function(err, release) {
    if (err){
      res.send(err);
      return;
    }
    if(!release){
      res.json({});
      return;
    }
    var releaseObj = release.toObject();
    db_hierarchy.find({ "$or": [{'release_id': validateInput(req.params.release_id), 'parentPath': req.query.parent}, {'release_id': req.params.release_id, 'instance': req.query.parent}] } , function(err, rows) {
      if (err){
	res.send(err);
	return;
      }
      var answer = [];
      for(var k=0;k<rows.length;k++){
	  var currRow = rows[k].toObject();
	  currRow['G_NAND_EQU_CELL'] = releaseObj['G_NAND_EQU_CELL'];
	  answer.push(currRow);
      }
      res.json(answer);
    });
  });
};


exports.fetch_instance_suggestions = function(req, res) {
    var db_hierarchy;
  if(req.query.releaseType == "released"){
    db_hierarchy = area_hierarchy;
  }
  if(req.query.releaseType == "unreleased"){
    db_hierarchy = area_hierarchy_un;
  }


  db_hierarchy.find({'release_id': validateInput(req.params.release_id), "name": {"$regex": req.query.instance} }, { "name": 1, "instance": 1}, {sort: {"level": 1}, limit: 100} , function(err, rows) {
    if (err){
      res.send(err);
      return;
    }
    res.json(rows);
  });
};


exports.fetch_tree = function(req, res) {

  var db_release;
  var db_hierarchy;
  var release_info = (validateInput(req.params.release_id)).split("|");
    var release_id = validateInput(req.params.release_id);
  var release_query;

  if(req.query.releaseType == "released"){
    db_release = area_release;
    db_hierarchy = area_hierarchy;
    release_query = {'project': release_info[0],'core': release_info[1], 'rtl_name': release_info[2], 'release_name': release_info[3], isHide: {$ne: true}};
  }
  if(req.query.releaseType == "unreleased"){
    db_release = area_release_un;
    db_hierarchy = area_hierarchy_un;
    release_query = {'project': release_info[0], 'unit': release_info[1], 'user': release_info[2], 'run_id': release_info[3], 'stage': release_info[4], 'date': release_info[5], isHide: {$ne: true}};
  }

  db_release.findOne(release_query, function(err, release) {
      if (err || !release){
        res.send(err);
        return;
      }

      var releaseObj = release.toObject();
      var allParents = (validateInput(req.query.instance)).split("/");
      var parentPaths = ['root']
      var currPath = null

      if (allParents.length < 10000) {
          currPath = allParents[0];
          for (var i = 1; i < allParents.length + 1; i++) {
              parentPaths.push(currPath);
              currPath += "/" + allParents[i];
          }
      }

    db_hierarchy.find({'release_id': release_id, parentPath: {$in: parentPaths}} , function(err, rows) {
      if (err){
	res.send(err);
	return;
      }

// 	res.json(rows);
      var answer = [];
      for(var k=0;k<rows.length;k++){
	  var currRow = rows[k].toObject();
	  currRow['G_NAND_EQU_CELL'] = releaseObj['G_NAND_EQU_CELL'];
	  answer.push(currRow);
      }
      res.json(answer);
    });
  });

};


exports.advancedCompare = function(req, res) {
  console.log(req.query.releaseInfo);
  console.log(req.query.node);

  var db_hierarchy;
  if(req.query.releaseType == "released"){
    db_hierarchy = area_hierarchy;
  }
  if(req.query.releaseType == "unreleased"){
    db_hierarchy = area_hierarchy_un;
  }


  res.json({'status': 'ok'});

};


exports.project_core_compare = function(req, res) {
    var db_release;
    var db_hierarchy;
    var release_query;
    var needed_fields;
    if(req.query.releaseType == "released"){
      db_release = area_release;
      db_hierarchy = area_hierarchy;
      release_query = {'core': validateInput(req.params.core), isHide: {$ne: true}};
      needed_fields = {'project': 1,'rtl_name': 1, 'release_name': 1, 'file_creation_date': 1, 'G_NAND_EQU_CELL': 1};
    }
    if(req.query.releaseType == "unreleased"){
      db_release = area_release_un;
      db_hierarchy = area_hierarchy_un;
      release_query = {'unit': validateInput(req.params.core), isHide: {$ne: true}};
      needed_fields = {'project': 1,'user': 1, 'run_id': 1, 'stage': 1, 'date': 1, 'file_creation_date': 1, 'G_NAND_EQU_CELL': 1};
    }

    if(req.query.isCustom && req.query.isCustom == "true"){
      release_query['project'] = validateInput(req.params.project);
    }

  console.log(req.query.instance);
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


exports.delete_project = function(req, res) {
  var level = req.query.level;
  var extraInfo = JSON.parse(validateInput(req.query.info));
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

  area_hierarchy.remove({'release_id': {$regex: new RegExp('^' + regStr)}}, function(err, rows) {
    if (err){
      res.send(err);
      return;
    }
//     var answer = [];

//     res.json(answer);

    area_release.remove(extraInfo, function(err, rows) {
      if (err){
	res.send(err);
	return;
      }
      res.json({'status': 'ok'});
    });


  });


};

exports.hide_project = function(req, res) {
    var level = validateInput(req.query.level);
  var extraInfo = JSON.parse(validateInput(req.query.info));

  console.log(extraInfo);
  area_release.update(extraInfo, {$set: { isHide: true }}, {multi: true} , function(err, rows) {
    if (err){
      res.send(err);
      return;
    }
    console.log(rows);
    res.json(rows);
  });


};










