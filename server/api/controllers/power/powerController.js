'use strict';

var release_db = require('../../../released_db.js');
var unrelease_db = require('../../../unreleased_db.js');

var libs = require('../../../libs.js');


// var mongoose = require('mongoose');
// var power_primitive = release_db.model('power_primitive');
var power_data = release_db.model('power');
var project_configuration = release_db.model('project_configuration');
var power_release = release_db.model('power_release');
var power_hierarchy = release_db.model('power_hierarchy');
// var power_target = release_db.model('power_target');
var power_release_un = unrelease_db.model('power_release_un');
var power_hierarchy_un = unrelease_db.model('power_hierarchy_un');

var leakage_hierarchy = release_db.model('leakage_hierarchy');



const path = require('path');

var async = require('async');

var _ = require('lodash');


function calculateUnitsPrimitive(units){
      var sortedUnits = _.sortBy(units, 'level');

      for(var i=0;i<sortedUnits.length;i++){
	var currentUnit = sortedUnits[i];
	var uniqueRelativeUnits = [];
	for(var j=0;j<sortedUnits.length;j++){
	  if(i!=j){
	    var currUnit = sortedUnits[j];
	    if(currUnit.instance.indexOf(currentUnit.instance) !== -1){
		var needed = true;
		for(var k=0;k<uniqueRelativeUnits.length;k++){
		    var unique = uniqueRelativeUnits[k];
		    if(currUnit.instance.indexOf(unique.instance) !== -1){
			needed = false;
		    }
		}
		if(needed)
		  uniqueRelativeUnits.push(currUnit);
	    }
	  }
	}
	var calculated_dynamic = currentUnit.total_current
	for(var c=0;c<uniqueRelativeUnits.length;c++){
	  calculated_dynamic -= uniqueRelativeUnits[c].total_current;
	}
	currentUnit['calculated_dynamic'] = calculated_dynamic;
      }
}


function getTargetValue(targets, unitInstance, primitiveName){
      for(var i=0;i<targets.length;i++){
	var targetObj = targets[i];
	var targetUnit = targetObj.unit;
	var targetPrimitive = targetObj.primitive;

	if(targetUnit.instance == unitInstance && targetPrimitive.name == primitiveName){
	  return targetObj.value;
	}
      }

}



function findCluster(projectPowerHierarchy, core, cluster){
    for(var i=0;i<projectPowerHierarchy.length;i++){
	var curr = projectPowerHierarchy[i];
	if(curr.core.name == core){
	  for(var j=0;j<curr.clusters.length;j++){
	    var currCluster = curr.clusters[j];
	    if(currCluster.name == cluster){
	      return currCluster;
	    }
	  }
	}
    }
}

function getclusters(projectPowerHierarchy, core){
    var clusters = [];
    for(var i=0;i<projectPowerHierarchy.length;i++){
	var curr = projectPowerHierarchy[i];
	if(curr.core.name == core){
	  for(var j=0;j<curr.clusters.length;j++){
	    var cluster = curr.clusters[j];
	    clusters.push(cluster);
	  }
	}
    }
    return clusters;
}



function fetchLeakageInfo(req, rows, callback){

    var releaseInfo = req.params.release_id.split("|");
    
    var project = releaseInfo[0];
    var core = releaseInfo[1];
    var cluster = releaseInfo[2];

    project_configuration.findOne({'project': project}, function(err, proj_config) {
      if (err){
	res.send(err);
	return;
      }
      if(!proj_config){
	callback({"rows": rows});
	return;
      }
      var proj_config_json = proj_config.toJSON();
      var power_configuration = proj_config_json['power_configuration'];
      if(!power_configuration){
	callback({"rows": rows});
	return;
      }

      var projectPowerInfo = {};
      if(power_configuration['projectPowerInfo']){
	projectPowerInfo = power_configuration['projectPowerInfo'];
      }
      var projectPowerHierarchy;
      if(power_configuration['hierarchy']){
	projectPowerHierarchy = power_configuration['hierarchy'];
      }
      if(!projectPowerHierarchy){
	callback({"rows": rows});
	return;
      }

      var instances_path;
      var powerCluster = findCluster(projectPowerHierarchy, core, cluster);

      if(powerCluster){
	instances_path = powerCluster['instancePath'];
      }
      if(instances_path){
	var obj = instances_path[core][cluster];
	leakage_hierarchy.findOne({'release_id': {$regex: new RegExp('^'+project+'\\|'+obj.mapCore+'\\|')}, 'instance': obj.mapInstance, name: obj.mapName, level: obj.mapLevel}, {}, {sort: {'file_creation_date': 1}, limit:1}, function(err, hierarchy) {

	  if (!err && hierarchy){
	      var rowsWithLeakage = [];
	      var calls = [];
	      for(var k=0;k<rows.length;k++){
		var rowObjj = rows[k].toJSON();
		(function(rowObj) {
		  calls.push(function(dbCallBack) {
		    var currParent = rowObj.parentPath;
		    var hierarchh = hierarchy.toJSON();
		    var query = {'release_id': hierarchh.release_id};
		    if(currParent == "root"){
		      query['instance'] = obj.mapInstance;
		    }else{
		      var splittedBySlashes = currParent.split("/");
		      if(splittedBySlashes.length == 1){
			query['parentPath'] = obj.mapInstance;
			query['name'] = rowObj.name;
		      }else{
			splittedBySlashes.shift();
			var removedFirstInstance = splittedBySlashes.join("/");
			query['parentPath'] = obj.mapInstance + "/" + removedFirstInstance;
			query['name'] = rowObj.name;
		      }
		    }
		    (function(hierarch) {
// 		      console.log(query);
		      leakage_hierarchy.findOne(query, function(err, hierarchy) {
			  if(hierarchy){
			    var hierarch = hierarchy.toJSON();
			    var sum = 0;
			    for(var i=0;hierarch['stdcell'] && hierarch['stdcell']['current'] && i<hierarch['stdcell']['current'].length;i++){
				sum += hierarch['stdcell']['current'][i].value;
			    }
			    rowObj['total_current'] = sum;
			    rowObj['leakageInfo'] = hierarch;
			  }
// 			  console.log(rowObj.name);
			  rowsWithLeakage.push(rowObj);
			  dbCallBack(null, rowsWithLeakage);
			});
		      })(hierarchh)
		    });
		  })(rowObjj)
		}
	      async.parallel(calls, function(err, result) {
		  for(var i=0;i<rowsWithLeakage.length;i++){
		      if(rowsWithLeakage[i]['leakageInfo'])
			console.log(rowsWithLeakage[i]['leakageInfo'].name);
		  }
		  callback({"rows": rowsWithLeakage, "projectPowerInfo": projectPowerInfo});
	      });

	  }
	  else{
	      callback({"rows": rows, "projectPowerInfo": projectPowerInfo});
	  }
	});
      }else{
	callback({"rows": rows, "projectPowerInfo": projectPowerInfo});
      }
    });


}


exports.init_info = function(req, res) {
  if(req.query.releaseType == "unreleased"){
    power_release_un.find().distinct('project', function(err, projects) {
      if (err){
	res.send(err);
	return;
      }
      res.json(projects.sort());
    });
  }

  if(req.query.releaseType == "released"){
    power_release.find().distinct('project', function(err, projects) {
      if (err){
	res.send(err);
	return;
      }
      res.json(projects.sort());
    });
  }

};


exports.project_cores = function(req, res) {
  project_configuration.findOne({'project': req.params.project}, function(err, proj_config) {
    if (err){
      res.send(err);
      return;
    }

    var cores = [];
    if(!proj_config){
      res.json(cores.sort());
      return;
    }
    var proj_config_json = proj_config.toJSON();
    if(proj_config_json['power_configuration']['hierarchy'] && proj_config_json['power_configuration']['hierarchy'].length > 0){
	var projectPowerHierarchy = proj_config_json['power_configuration']['hierarchy'];
	for(var i=0;i<projectPowerHierarchy.length;i++){
	    var curr = projectPowerHierarchy[i];
	    cores.push(curr.core.name);
	}
    }
    res.json(cores.sort());
  });
};

exports.project_units = function(req, res) {
  power_release_un.find({'project': req.params.project}).distinct('top', function(err, units) {
    if (err){
      res.send(err);
      return;
    }
    res.json(units.sort());
  });
};

exports.project_unit_tags = function(req, res) {
  power_release_un.find({'project': req.params.project, 'top': req.params.top}).distinct('tag', function(err, tags) {
    if (err){
      res.send(err);
      return;
    }
    res.json(tags.sort());
  });
};

exports.project_unit_tag_runids = function(req, res) {
  power_release_un.find({'project': req.params.project, 'top': req.params.top, 'tag': req.params.tag}, {'run_id': 1}, {sort: {'timestamp': -1}}, function(err, runids) {
    if (err){
      res.send(err);
      return;
    }
    var runids = runids.map(a => a.run_id);

    res.json(runids);
  });
};

exports.project_core_release = function(req, res) {
  power_data.find({'project': req.params.project, 'core': req.params.core, 'isCsv': true}).distinct('cluster', function(err, clusters) {
    if (err){
      res.send(err);
      return;
    }
    res.json(clusters.sort());
  });
};


exports.project_core_release_cluster = function(req, res) {
  power_data.find({'project': req.params.project, 'core': req.params.core, 'cluster': req.params.cluster, 'isCsv': true}).distinct('primitive', function(err, primitives) {
    if (err){
      res.send(err);
      return;
    }
    res.json(primitives.sort());
  });
};

exports.project_core_release_cluster_primitive = function(req, res) {
  power_data.find({'project': req.params.project, 'core': req.params.core, 'cluster': req.params.cluster, 'primitive': req.params.primitive, 'isCsv': true}).distinct('rtl_name', function(err, rtls) {
    if (err){
      res.send(err);
      return;
    }
    res.json(rtls.sort());
  });
};


exports.getReleaseInfo = function(req, res) {
  power_data.findOne({'project': req.params.project, 'core': req.params.core, 'cluster': req.params.cluster, 'primitive': req.params.primitive, 'rtl_name': req.params.rtl}, function(err, doc) {
    if (err){
      res.send(err);
      return;
    }
    res.json(doc);
  });
};

exports.getUnReleaseInfo = function(req, res) {
  power_release_un.findOne({'project': req.params.project, 'top': req.params.top, 'tag': req.params.tag, 'run_id': req.params.runid}, function(err, doc) {
    if (err){
      res.send(err);
      return;
    }
    res.json(doc);
  });
};


exports.getAllRuns = function(req, res) {
  power_release_un.find({'project': req.params.project, 'top': req.params.top}, {"tag": 1, "run_id": 1} , function(err, runs) {
    if (err){
      res.send(err);
      return;
    }
    res.json(runs.sort());
  });
};


exports.getAllReleases = function(req, res) {
  power_data.find({'project': req.params.project, 'core': req.params.core, 'cluster': req.params.cluster}, {} , function(err, releases) {
    if (err){
      res.send(err);
      return;
    }
    res.json(releases.sort());
  });
};



exports.getMultipleUnits = function(req, res) {
    var queries;
    if(!Array.isArray(req.body.queries)){
      queries.push(req.body.queries);
    }else{
      queries = req.body.queries;
    }

    var hierary_db;
    if(req.body.releaseType == "unreleased"){
      hierary_db = power_hierarchy_un;
    }else{
      hierary_db = power_hierarchy;
    }

//     for(var i=0;i<queries.length;i++){
//       queries[i] = queries[i];
//     }


    var calls = [];
    var results = [];
    queries.forEach(function(query){
	calls.push(function(callback){
	    hierary_db.findOne(query , function(err, info) {
	      if(!err && info){
		results.push(info);
	      }
	      callback(null, info);
	    });
	}
    )});
    async.parallel(calls, function(err, result) {
	res.json(results);
    });
};



exports.getCalculatedUnits = function(req, res) {

  project_configuration.findOne({'project': req.params.project}, function(err, proj_config) {
      if (err || !proj_config){
	res.send(err);
	return;
      }
      var proj_config_json = proj_config.toJSON();
      var power_configuration = proj_config_json['power_configuration'];
      if(!power_configuration){
	res.send({"error": "no power configuration, check with admin."});
	return;
      }


      var projectPowerHierarchy = [];
      if(power_configuration['hierarchy']){
	projectPowerHierarchy = power_configuration['hierarchy'];
      }

      var clusterObject = findCluster(projectPowerHierarchy, req.params.core, req.params.cluster);

//       console.log(clusterObject.targets);


      var releaseId = req.params.project + "|" + req.params.core + "|" + req.params.cluster + "|" + req.params.primitive + "|" + req.params.rtl;

      var calls = [];
      var relativeUnits = [];
      clusterObject.units.forEach(function(unit){
          calls.push(function(callback) {
              power_hierarchy.findOne({'release_id': releaseId, 'instance': unit.instance}, function(err, unitDoc) {
                if (!err && unitDoc){
                  relativeUnits.push(unitDoc);
                }
                callback(null, unit);
              });
          }
      )});

    async.parallel(calls, function(err, result) {

	var units = [];
	for(var j=0;j<relativeUnits.length;j++){
	  var obj = relativeUnits[j].toJSON();
	  var total_current = 0;
	  for(var k=0;k<obj.dynamic.length;k++){
	    total_current += obj.dynamic[k].value;
	  }
	  obj['total_current'] = total_current;
	  units.push(obj);
	}

	var targets = clusterObject.targets;
	if(targets){

	  for(var j=0;j<units.length;j++){
	    var instance = units[j].instance;
	    var primitive = req.params.primitive;

	    var val = getTargetValue(targets, instance, primitive);
	    if(val){
	      units[j]['target'] = val;
	    }

	  }
	}

	calculateUnitsPrimitive(units);

	res.json({"units": units});
    });


  });

};



exports.project_core_clusters_summary = function(req, res) {
  project_configuration.findOne({'project': req.params.project}, function(err, proj_config) {
    if (err || !proj_config){
      res.send(err);
      return;
    }
      var proj_config_json = proj_config.toJSON();
      var power_configuration = proj_config_json['power_configuration'];
      if(!power_configuration){
	res.send({"error": "no power configuration, check with admin."});
	return;
      }
      var calls = [];

      var projectPowerHierarchy = [];
      if(power_configuration['hierarchy']){
	projectPowerHierarchy = power_configuration['hierarchy'];
      }

      var clustersObject = getclusters(projectPowerHierarchy, req.params.core);

      var leakageInfo = {};

      clustersObject.forEach(function(cluster){
          calls.push(function(callback) {
              power_release.find({'project': req.params.project,'core': req.params.core , 'cluster': cluster.name}, {}, {sort: {'file_creation_date': 1}}, function(err, releases) {
                if (!err && releases){
                  var uniqueRelease = [];
                  for(var i=0;i<releases.length;i++){
                    var obj = releases[i].toJSON();
                    var found = false;
                    for(var j=0;j<uniqueRelease.length;j++){
                        var temp = uniqueRelease[j];
                        if(temp['rtl_name'] == obj['rtl_name']){ found = true;}
                    }
                    if(!found) uniqueRelease.push(obj);
                  }
		  cluster['releases'] = uniqueRelease;
//                   clusters.push({'cluster': cluster, 'releases': uniqueRelease});
                }
                callback(null, cluster);
              });
          }
      )});


      clustersObject.forEach(function(cluster){
	  if(cluster['instancePath'] && cluster['instancePath'][req.params.core] && cluster['instancePath'][req.params.core][cluster.name]){

	    calls.push(function(callback) {
		var obj = cluster['instancePath'][req.params.core][cluster.name];

		leakage_hierarchy.findOne({'release_id': {$regex: new RegExp('^'+req.params.project+'\\|'+obj.mapCore+'\\|')}, 'instance': obj.mapInstance, name: obj.mapName, level: obj.mapLevel}, {}, {sort: {'file_creation_date': -1}, limit:1}, function(err, hierarchy) {
		  if (!err && hierarchy){
		    var hierarch = hierarchy.toJSON();
		    var sum = 0;
		    for(var i=0;hierarch['stdcell'] && hierarch['stdcell']['current'] && i<hierarch['stdcell']['current'].length;i++){
			sum += hierarch['stdcell']['current'][i].value;
		    }
		    cluster['leakageInfo'] = {};
		    cluster['leakageInfo']['leakage'] = hierarch;
		    cluster['leakageInfo']['total_current'] = sum;

// 		    if(!leakageInfo[cluster.name]) leakageInfo[cluster.name] = {};
// 		    leakageInfo[cluster.name]['leakage'] = hierarch;
// 		    leakageInfo[cluster.name]['total_current'] = sum;

		  }
		  callback(null, leakageInfo);
		});
	    });

	  }
      });
// 	  res.json({"clusters": clusters, "primitives": power_configuration['primitives'], "targetsInfo": power_configuration.targets, "leakageInfo": leakageInfo, "projectPowerInfo": projectPowerInfo});

      async.parallel(calls, function(err, result) {
	  res.json({"clusters": clustersObject});
      });
    });

/*

  });*/


};


exports.project_tree = function(req, res) {
  power_hierarchy.find({'release_id': req.params.release_id, 'parentPath': req.query.parent} , function(err, rows) {
    if (err){
      res.send(err);
      return;
    }
    fetchLeakageInfo(req, rows, function(info){
      res.json(info);
    });
  });
};


exports.project_regex_tree = function(req, res) {
  power_hierarchy.find({'release_id': {$regex: new RegExp(req.query.regex_release_id)}, 'parentPath': req.query.parent} , function(err, rows) {
    if (err){
      res.send(err);
      return;
    }
    var arrObj = _.sortBy(rows,"creation_date");
    arrObj = _.uniqBy(arrObj, 'instance');
    res.json(arrObj);
  });
};


exports.project_regex_node = function(req, res) {
  power_hierarchy.findOne({'level':Number(req.query.level), 'name':req.query.name, 'release_id': {$regex: new RegExp(req.query.regex_release_id)}} , function(err, node) {
    if (err){
      res.send(err);
      return;
    }
//     console.log(node);
    res.json(node);
  });
};



exports.project_tree_unreleased = function(req, res) {
//   console.log({'release_id': req.params.release_id, 'parentPath': req.query.parent} );
//   console.log();

  power_hierarchy_un.find({'release_id': req.params.release_id, 'parentPath': req.query.parent} , function(err, rows) {
    if (err){
      res.send(err);
      return;
    }
    res.json({"rows": rows});
  });
};


exports.fetch_instance_suggestions = function(req, res) {
  power_hierarchy.find({'release_id': req.params.release_id, "name": {"$regex": req.query.instance} }, { "name": 1, "instance": 1}, {sort: {"level": 1}, limit: 100} , function(err, rows) {
    if (err){
      res.send(err);
      return;
    }
    res.json(rows);
  });
};

exports.fetch_instance_suggestions_unreleased = function(req, res) {
  power_hierarchy_un.find({'release_id': req.params.release_id, "name": {"$regex": req.query.instance} }, { "name": 1, "instance": 1}, {sort: {"level": 1}, limit: 100} , function(err, rows) {
    if (err){
      res.send(err);
      return;
    }
    res.json(rows);
  });
};


exports.project_tree_fetch_search = function(req, res) {
	var allParents = req.query.instance.split("/");
	var parentPaths = ['root']
	var currPath = null

	if (allParents.length < 1000000) {
		currPath = allParents[0];
		for (var i = 1; i < allParents.length + 1; i++) {
			parentPaths.push(currPath);
			currPath += "/" + allParents[i];
		}
	}

    power_hierarchy.find({'release_id': req.params.release_id, 'parentPath': { "$in": parentPaths}} , function(err, rows) {
      if (err){
	res.send(err);
	return;
      }
      fetchLeakageInfo(req, rows, function(info){
	res.json(info);
      });
//       res.json(rows);
    });

};


exports.project_tree_fetch_search_unreleased = function(req, res) {
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

    power_hierarchy_un.find({'release_id': req.params.release_id, 'parentPath': { "$in": parentPaths}} , function(err, rows) {
      if (err){
	res.send(err);
	return;
      }
      res.json(rows);
    });

};



exports.project_core_rtls = function(req, res) {
  power_release.find({'project': req.params.project,'core': req.params.core}).distinct('rtl_name', function(err, releases) {
    if (err){
      res.send(err);
      return;
    }
    res.json(releases);
  });
};


exports.cluster_primitives_info = function(req, res) {
  power_data.find({'project': req.params.project,'core': req.params.core, 'cluster': req.params.cluster, 'rtl_name': req.query.release}, function(err, primitives) {
    if (err){
      res.send(err);
      return;
    }

    var values = {};
    for(var i=0;i<primitives.length;i++){
      values[primitives[i]['primitive']] = {'value': primitives[i]['value'], 'isCsv': primitives[i]['isCsv']};
    }
    res.json(values);
  });
};




exports.create_new_releases = function(req, res) {
  var rowsToInsert = [];
  var powers = [];
  var distinctCluster = {};
  var release = [];
  if(!Array.isArray(req.query.rows)){
    rowsToInsert.push(req.query.rows);
  }else{
    rowsToInsert = req.query.rows;
  }
	if (rowsToInsert.length < 100000) {
		for (var i = 0; i < rowsToInsert.length; i++) {
			var temp = JSON.parse(rowsToInsert[i]);
			powers.push(temp);
			if (!distinctCluster[temp['cluster']]) {
				distinctCluster[temp['cluster']] = 1;
				release.push({ project: temp['project'], core: temp['core'], cluster: temp['cluster'], rtl_name: temp['rtl_name'] });
			}
		}
	}
  power_data.create(powers, function(err, docs) {
      if (err){
	res.send(err);
	return;
      }
      power_release.create(release, function(err, releases) {
	if (err){
	  res.send(err);
	  return;
	}
      res.json(releases);
      });
  });
};





// exports.create_power_release = function(req, res) {
// 
//   power_release.create({ 'project': req.query.project,'core': req.query.core, rtl_name: req.query.rtl_name }, function (err, small) {
//     if (err){
//       res.send(err);
//       return;
//     }
//       var v = [];
//       for(var i=0;i<req.query.info.length;i++){
// 	  var temp = JSON.parse(req.query.info[i]);
// 	  v.push(temp);
//       }
// 
//       power_data.create({ 'release_id': req.query.project+"|"+req.query.core+"|"+req.query.rtl_name, primitives_data: v }, function (err, small) {
// 	  if (err){
// 	    res.send(err);
// 	    return;
// 	  }
// 	  res.json({'status': 'ok'});
//       });
// 
//   });
// };

// exports.update_power_release = function(req, res){
//       var v = [];
//       for(var i=0;i<req.query.info.length;i++){
// 	  var temp = JSON.parse(req.query.info[i]);
// 	  v.push(temp);
//       }
// 
//       power_data.update({ 'release_id': req.query.project+"|"+req.query.core+"|"+req.query.rtl_name, primitives_data: v }, function (err, small) {
// 	  if (err){
// 	    res.send(err);
// 	    return;
// 	  }
// 	  res.json({'status': 'ok'});
//       });
// 
// 
// };
// 

// exports.fetchPrimitivesInfo = function(req, res) {
// 
//     power_primitive.findOne({'project': req.params.project,'core': req.params.core} ,{'top_level': 1, 'primitives': 1}, function(err, doc1) {
//       if (err){
// 	res.send(err);
// 	return;
//       }
//       power_data.findOne({'release_id': req.params.project+"|"+req.params.core+"|"+req.query.rtl_name }, function (err, doc) {
// 	  if (err){
// 	    res.send(err);
// 	    return;
// 	  }
// 	  res.json({primitives: doc1['primitives'], top_level: doc1['top_level'], info: doc['primitives_data']});
//       });
//     });
// 
// 
// };




function sendMailPublish(req, project, core, cluster, primitive, rtl_name){

    project_configuration.findOne({'project': project}, function(err, proj_config) {

      if (err){
	res.send(err);
	return;
      }
      if(!proj_config){
	callback({"rows": rows});
	return;
      }
      var proj_config_json = proj_config.toJSON();
      var power_configuration = proj_config_json['power_configuration'];
      if(!power_configuration){
	return;
      }

      var projectPowerInfo = {};
      if(power_configuration['projectPowerInfo']){
	projectPowerInfo = power_configuration['projectPowerInfo'];
      }
      var projectPowerHierarchy;
      if(power_configuration['hierarchy']){
	projectPowerHierarchy = power_configuration['hierarchy'];
      }
      if(!projectPowerHierarchy){
	return;
      }

      var ccList;
      var powerCluster = findCluster(projectPowerHierarchy, core, cluster);

      if(powerCluster){
	ccList = powerCluster['ccList'];
      }
      if(ccList && ccList.length > 0){
	var fullUrl = req.headers.origin + '/#!/power?';
	fullUrl += "type=released&";
	fullUrl += "project="+encodeURIComponent(project)+"&";
	fullUrl += "core="+encodeURIComponent(core)+"&";
	fullUrl += "cluster="+encodeURIComponent(cluster)+"&";
	fullUrl += "primitive="+encodeURIComponent(primitive)+"&";
	fullUrl += "release="+encodeURIComponent(rtl_name);

	libs.sendPowerPublishMail(ccList, fullUrl, rtl_name);
      }

    });




};


// exports.publish_release = function(req, res) {
//   var project = req.params.project;
//   var top = req.params.top;
//   var tag = req.params.tag;
//   var runid = req.params.runid;
//   var core = req.query.core;
//   var cluster = req.query.cluster;
//   var primitive = req.query.primitive;
//   var rtl_name = req.query.rtl_name;
// 
// 
//   var release_id = project + '|' + top + '|' + tag + '|' + runid;
//   var new_release_id = project + '|' + core + '|' + cluster + '|' + primitive + '|' + rtl_name;
// 
//   var primitiveValue = req.query.value;
// 
//   if(!primitiveValue){
// 
//       power_hierarchy.findOne({'release_id': new_release_id}, function(err, releases) {
// 	      if (err){
// 		res.send(err);
// 		return;
// 	      }
// 
// 	      if (releases){
// 		res.send({"error": "releaseName exists"});
// 		return;
// 	      }
// 
// 	      power_hierarchy_un.findOne({'release_id': release_id, 'level': 1}, function(err, row) {
// 		if (err || !row){
// 		  res.send(err);
// 		  return;
// 		}
// 
// 		var rowObj = row.toObject();
// 		var primitives = rowObj.dynamic;
// 		var primitiveValue = 0;
// 
// 		for(var i=0;i<primitives.length;i++){
// 		    primitiveValue += primitives[i]['value'];
// 		}
// 
// 		power_release.create({'project': project,'core': core, 'cluster': cluster, 'rtl_name': rtl_name, 'source': 'unreleased|' + project + '|' + top + '|' + tag + '|' + runid}, function (err, small) {
// 		  if (err){
// 		    console.log(err);
// 		    res.send(err);
// 		    return;
// 		  }
// 
// 		  power_data.create({'project': project,'core': core, 'cluster': cluster, 'isCsv': true, 'rtl_name': rtl_name, 'primitive': primitive, 'value': primitiveValue, 'source': 'unreleased|' + project + '|' + top + '|' + tag + '|' + runid}, function (err, small) {
// 		      if (err){
// 			console.log(err);
// 			res.send(err);
// 			return;
// 		      }
// 
// // 		      power_hierarchy_un.find().forEach(function(doc){
// // 
// // 		      });
// 
// // 		      power_hierarchy_un.find({'release_id': release_id}, function(err, rows) {
// // 			if (err){
// // 			  console.log(err);
// // 			  res.send(err);
// // 			  return;
// // 			}
// // 
// // 			var result = [];
// // 			for(var i=0;i<rows.length;i++){
// // 			  var obj = rows[i].toObject();
// // 			  obj['release_id'] = new_release_id;
// // 			  delete obj['_id'];
// // 			  result.push(obj);
// // 			}
// // 
// // 			power_hierarchy.create(result, function(err, releases) {
// // 				if (err){
// // 				  console.log(err);
// // 				  res.send(err);
// // 				  return;
// // 				}
// // 				sendMailPublish(req, project, core, cluster, primitive, rtl_name);
// // 
// // 				res.json({'status': 'ok'});
// // 			      });
// // 
// // 
// // 		      });
// 
// 
// 
// 		      power_hierarchy_un.find({'release_id': release_id}, function(err, rows) {
// 			if (err){
// 			  console.log(err);
// 			  res.send(err);
// 			  return;
// 			}
// 
// 			var result = [];
// 			for(var i=0;i<rows.length;i++){
// 			  var obj = rows[i].toObject();
// 			  obj['release_id'] = new_release_id;
// 			  delete obj['_id'];
// 			  result.push(obj);
// 			}
// 
// 			power_hierarchy.create(result, function(err, releases) {
// 				if (err){
// 				  console.log(err);
// 				  res.send(err);
// 				  return;
// 				}
// 				sendMailPublish(req, project, core, cluster, primitive, rtl_name);
// 				res.json({'status': 'ok'});
// 			      });
// 		      });
// 		  });
// 		});
// 	      });
// 	    });
//   }else{
//     power_hierarchy.findOne({'release_id': new_release_id}, function(err, releases) {
// 	    if (err){
// 	      res.send(err);
// 	      return;
// 	    }
// 	    if (releases){
// 	      res.send({"error": "releaseName exists"});
// 	      return;
// 	    }
// 
// 	    power_release.create({'project': project,'core': core, 'cluster': cluster, 'rtl_name': rtl_name, 'source': 'unreleased|' + project + '|' + top + '|' + tag + '|' + runid}, function (err, small) {
// 	      if (err){
// 		res.send(err);
// 		return;
// 	      }
// 	      power_data.create({'project': project,'core': core, 'cluster': cluster, 'isCsv': true, 'rtl_name': rtl_name, 'primitive': primitive, 'value': primitiveValue, 'source': 'unreleased|' + project + '|' + top + '|' + tag + '|' + runid}, function (err, small) {
// 		  if (err){
// 		    res.send(err);
// 		    return;
// 		  }
// 		  power_hierarchy_un.find({'release_id': release_id}, function(err, rows) {
// 		    if (err){
// 		      res.send(err);
// 		      return;
// 		    }
// 		    var result = [];
// 		    for(var i=0;i<rows.length;i++){
// 		      var obj = rows[i].toObject();
// 		      obj['release_id'] = new_release_id;
// 		      delete obj['_id'];
// 		      result.push(obj);
// 		    }
// 		    power_hierarchy.create(result, function(err, releases) {
// 			    if (err){
// 			      res.send(err);
// 			      return;
// 			    }
// 			    sendMailPublish(req, project, core, cluster, primitive, rtl_name);
// 			    res.json({'status': 'ok'});
// 			  });
// 		  });
// 	      });
// 
// 	    });
//     });
//   }
// 
// 
// 
// };

exports.publish_release = function(req, res) {
  console.log("publish_release");
  console.log(res);
  var project = req.params.project;
  var top = req.params.top;
  var tag = req.params.tag;
  var runid = req.params.runid;
  var core = req.query.core;
  var cluster = req.query.cluster;
  var primitive = req.query.primitive;
  var rtl_name = req.query.rtl_name;

  var release_id = project + '|' + top + '|' + tag + '|' + runid;
  var new_release_id = project + '|' + core + '|' + cluster + '|' + primitive + '|' + rtl_name;

  var primitiveValue = req.query.value;

  if(!primitiveValue){
      power_hierarchy.findOne({'release_id': new_release_id}, function(err, releases) {
	      if (err){
		res.send(err);
		return;
	      }
	      if (releases){
		res.send({"error": "releaseName exists"});
		return;
	      }

	      power_hierarchy_un.findOne({'release_id': release_id, 'level': 1}, function(err, row) {
		if (err || !row){
		  res.send(err);
		  return;
		}
		var rowObj = row.toObject();
		var primitives = rowObj.dynamic;
		var primitiveValue = 0;

		for(var i=0;i<primitives.length;i++){
		    primitiveValue += primitives[i]['value'];
		}

		power_release.create({'project': project,'core': core, 'cluster': cluster, 'rtl_name': rtl_name, 'source': 'unreleased|' + project + '|' + top + '|' + tag + '|' + runid}, function (err, small) {
		  if (err){
		    res.send(err);
		    return;
		  }
		  power_data.create({'project': project,'core': core, 'cluster': cluster, 'isCsv': true, 'rtl_name': rtl_name, 'primitive': primitive, 'value': primitiveValue, 'source': 'unreleased|' + project + '|' + top + '|' + tag + '|' + runid}, function (err, small) {
		      if (err){
			res.send(err);
			return;
		      }
		      power_hierarchy_un.find({'release_id': release_id, 'level':{ $lt: 10}}, function(err, rows) {
			if (err){
			  res.send(err);
			  return;
			}
			var result = [];
			for(var i=0;i<rows.length;i++){
			  var obj = rows[i].toObject();
			  obj['release_id'] = new_release_id;
			  delete obj['_id'];
			  result.push(obj);
			}
			power_hierarchy.create(result, function(err, releases) {
				if (err){
				  console.log(err);
				  res.send(err);
				  return;
				}
				sendMailPublish(req, project, core, cluster, primitive, rtl_name);
				res.json({'status': 'ok'});
			      });
		      });
		  });
		});
	      });
	    });
  }else{
    power_hierarchy.findOne({'release_id': new_release_id}, function(err, releases) {
	    if (err){
	      res.send(err);
	      return;
	    }
	    if (releases){
	      res.send({"error": "releaseName exists"});
	      return;
	    }

	    power_release.create({'project': project,'core': core, 'cluster': cluster, 'rtl_name': rtl_name, 'source': 'unreleased|' + project + '|' + top + '|' + tag + '|' + runid}, function (err, small) {
	      if (err){
		res.send(err);
		return;
	      }
	      power_data.create({'project': project,'core': core, 'cluster': cluster, 'isCsv': true, 'rtl_name': rtl_name, 'primitive': primitive, 'value': primitiveValue, 'source': 'unreleased|' + project + '|' + top + '|' + tag + '|' + runid}, function (err, small) {
		  if (err){
		    res.send(err);
		    return;
		  }
		  power_hierarchy_un.find({'release_id': release_id, 'level':{ $lt: 10}}, function(err, rows) {
		    if (err){
		      res.send(err);
		      return;
		    }
		    var result = [];
		    for(var i=0;i<rows.length;i++){
		      var obj = rows[i].toObject();
		      obj['release_id'] = new_release_id;
		      delete obj['_id'];
		      result.push(obj);
		    }
		    power_hierarchy.create(result, function(err, releases) {
			    if (err){
			      res.send(err);
			      return;
			    }
			    sendMailPublish(req, project, core, cluster, primitive, rtl_name);
			    res.json({'status': 'ok'});
			  });
		  });
	      });

	    });
    });
  }



};




exports.getPossibleClusters = function(req, res) {

    power_primitive.findOne({'project': req.params.project,'core': req.params.core} ,{'clusters': 1, 'primitives': 1}, function(err, info) {
      if (err){
	res.send(err);
	return;
      }
      res.json(info);
    });


};




exports.fetch_compare_date = function(req, res) {

  var rowsToFind = [];

  if(!Array.isArray(req.body.info)){
    rowsToFind.push(req.body.info);
  } else {
	  if (req.body.info.length > 10000) {
		  for (var i = 0; i < req.body.info.length; i++)
			  rowsToFind.push(req.body.info[i]);
	  }
  }
  var hierary_db;
  if(req.body.releaseType == "unreleased"){
    hierary_db = power_hierarchy_un;
  }else{
    hierary_db = power_hierarchy;
  }


//   hierary_db.find({$or: rowsToFind} , function(err, rows) {
//     if (err){
//       res.send(err);
//       return;
//     }
//     var ans = {};
//     for(var i=0;i<rows.length;i++){
//       var row = rows[i].toObject();
//       var instanceName = row['name'];
//       var instanceId = row['release_id'];
//       var total = 0 ;
//       for (var j = 0; j < row['dynamic'].length; j++) {
// 	var dynamic = row['dynamic'][j];
// 	total += dynamic.value;
//       }
//       var rowInfo = instanceId.split('|');
//       var keyName="";
//       if(req.query.releaseType == "unreleased"){
// 	var tag = rowInfo[2];
// 	var runId = rowInfo[3];
// 	keyName = tag+'-'+runId;
//       }else{
// 	var release = rowInfo[4];
// 	keyName = release;
//       }
// 
// //       var temp = {[keyName]: total};
//       if(!ans[instanceName]){
// 	ans[instanceName] = {};
//       }
//       ans[instanceName][keyName] = total;
//     }

      var calls = [];
      var results = [];
      rowsToFind.forEach(function(row){
	  calls.push(function(callback) {
	      hierary_db.findOne(row , function(err, info) {
		if (!err && info){
		  results.push(info);
		}
		callback(null, row);
	      });
	  }
      )});

      async.parallel(calls, function(err, result) {
	  var ans = {};
	  for(var i=0;i<results.length;i++){
	    var row = results[i].toObject();
	    var instanceName = row['name'];
	    var instanceId = row['release_id'];
	    var total = 0 ;
	    for (var j = 0; j < row['dynamic'].length; j++) {
	      var dynamic = row['dynamic'][j];
	      total += dynamic.value;
	    }
	    //var rowInfo = instanceId.split('|');
	    //var keyName="";
	    //if(req.body.releaseType == "unreleased"){
	    //  var tag = rowInfo[2];
	     // var runId = rowInfo[3];
	     // keyName = tag+'-'+runId;
	    //}else{
	   // var  keyName = instanceId;
	    //}

      //       var temp = {[keyName]: total};
	    if(!ans[instanceName]){
	      ans[instanceName] = {};
	    }
	    ans[instanceName][instanceId] = total;
	  }

	  res.json(ans);
      });



//     res.json(ans);
//   });

};










exports.delete_project = function(req, res) {

  var level = req.query.level;
  var extraInfo = JSON.parse(req.query.info);

  if(req.query['releaseType'] == "unreleased"){
      var regStr = "";
      if(extraInfo['project']){
	regStr += extraInfo['project'] + "\\|";
	if(extraInfo['top']){
	  regStr += extraInfo['top'] + "\\|";
	  if(extraInfo['tag']){
	    regStr += extraInfo['tag'] + "\\|";
	    if(extraInfo['run_id']){
	      regStr += extraInfo['run_id'];
	    }
	  }
	}
      }else{
	return;
      }

      power_hierarchy_un.remove({'release_id': {$regex: new RegExp('^' + regStr)}}, function(err, rows) {
	if (err){
	  res.send(err);
	  return;
	}
	power_release_un.remove(extraInfo, function(err, rows) {
	  if (err){
	    res.send(err);
	    return;
	  }
	  res.json({'status': 'ok'});
	});


      });
  }
  else if(req.query['releaseType'] == "released"){
      var regStr = "";
      if(extraInfo['project']){
	regStr += extraInfo['project'] + "\\|";
	if(extraInfo['core']){
	  regStr += extraInfo['core'] + "\\|";
	  if(extraInfo['cluster']){
	    regStr += extraInfo['cluster'] + "\\|";
	    if(extraInfo['primitive']){
	      regStr += extraInfo['primitive'] + "\\|";
	      if(extraInfo['rtl_name']){
		regStr += extraInfo['rtl_name'];
	      }
	    }
	  }
	}
      }else{
	return;
      }
      console.log("start remove");
      power_hierarchy.remove({'release_id': {$regex: new RegExp('^' + regStr)}} , function(err, rows) {
	console.log("done remove");
	if (err){
	  res.send(err);
	  return;
	}
	var power_release_info = JSON.parse(JSON.stringify(extraInfo));
	if(power_release_info['primitive']){
	  power_release_info['primitive'] = undefined;
	}
	power_release.remove(power_release_info, function(err, rows) {
	  if (err){
	    res.send(err);
	    return;
	  }
	  power_data.remove(extraInfo, function(err, rows) {
	    if (err){
	      res.send(err);
	      return;
	    }
	    res.json({'status': 'ok'});
	  });
	});


      });
  }



};


















