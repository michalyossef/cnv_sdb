'use strict';


var debug_db = require('../../../debug_db.js');

var released_db = require('../../../released_db.js');
var unreleased_db = require('../../../unreleased_db.js');

// var mongoose = require('mongoose');
var  summary_release_un = unreleased_db.model('summary_release_un');
var  summary_hierarchy_un = unreleased_db.model('summary_hierarchy_un');

var  summary_release = released_db.model('summary_release');
var  summary_hierarchy = released_db.model('summary_hierarchy');

// var  summary_qor_release = released_db.model('summary_release');
var  summary_qor_hierarchy = released_db.model('qor_hierarchy');

// var  summary_qor_release = released_db.model('summary_release');
var  summary_qor_hierarchy_un = unreleased_db.model('qor_hierarchy_un');


var  summary_check_timing_hierarchy = released_db.model('check_timing_hierarchy');
var  summary_check_timing_hierarchy_un = unreleased_db.model('check_timing_hierarchy_un');

var  summary_compile_check_design_hierarchy = released_db.model('compile_check_design_hierarchy');
var  summary_compile_check_design_hierarchy_un = unreleased_db.model('compile_check_design_hierarchy_un');

var  summary_mv_drc_hierarchy = released_db.model('mv_drc_hierarchy');
var  summary_mv_drc_hierarchy_un = unreleased_db.model('mv_drc_hierarchy_un');


var async = require('async');


exports.init_info = function(req, res) {
  summary_release_un.find({isHide: {$ne: true}}).distinct('project', function(err, projects) {
    if (err){
      res.send(err);
      return;
    }
    res.json(projects);
  });
};


exports.getUnits = function(req, res) {
  summary_release_un.find({'project': req.params.project, isHide: {$ne: true}}).distinct('unit', function(err, units) {
    if (err){
      res.send(err);
      return;
    }
    res.json(units);
  });
};


exports.getUsers = function(req, res) {
  summary_release_un.find({'project': req.params.project, 'unit': req.params.unit, isHide: {$ne: true}}).distinct('user', function(err, users) {
    if (err){
      res.send(err);
      return;
    }
    res.json(users);
  });
};

exports.getRunids = function(req, res) {
  summary_release_un.find({'project': req.params.project, 'unit': req.params.unit, 'user': req.params.user, isHide: {$ne: true}}).distinct('run_id', function(err, runids) {
    if (err){
      res.send(err);
      return;
    }
    res.json(runids);
  });
};

exports.getStages = function(req, res) {
  summary_release_un.find({'project': req.params.project, 'unit': req.params.unit, 'user': req.params.user, 'run_id': req.params.run_id, isHide: {$ne: true}}).distinct('stage', function(err, stages) {
    if (err){
      res.send(err);
      return;
    }
    res.json(stages);
  });
};

exports.getDates = function(req, res) {
  summary_release_un.find({'project': req.params.project, 'unit': req.params.unit, 'user': req.params.user, 'run_id': req.params.run_id, 'stage': req.params.stage, isHide: {$ne: true}}).distinct('date', function(err, dates) {
    if (err){
      res.send(err);
      return;
    }
    res.json(dates);
  });
};


exports.getSummaryQor = function(req, res) {
  
  var db;
  if(req.query.releaseType == "released"){
    db = summary_qor_hierarchy;
  }
  if(req.query.releaseType == "unreleased"){
    db = summary_qor_hierarchy_un;
  }
  
  db.find({'release_id': req.params.release_id}, {}, {}, function(err, releases) {
    if (err){
      res.send(err);
      return;
    }
    res.json(releases);
  });

};


exports.getSummaryCheckDesign = function(req, res) {
  
  var db;
  if(req.query.releaseType == "released"){
    db = summary_compile_check_design_hierarchy;
  }
  if(req.query.releaseType == "unreleased"){
    db = summary_compile_check_design_hierarchy_un;
  }
  
  db.findOne({'release_id': req.params.release_id}, {}, {}, function(err, releases) {
    if (err){
      res.send(err);
      return;
    }
    res.json(releases);
  });

};


exports.getSummaryCheckTiming = function(req, res) {
  
  var db;
  if(req.query.releaseType == "released"){
    db = summary_check_timing_hierarchy;
  }
  if(req.query.releaseType == "unreleased"){
    db = summary_check_timing_hierarchy_un;
  }
  
  

  db.find({'release_id': req.params.release_id}, {"structure": 1, "code": 1, "counter": 1}, {}, function(err, releases) {
    if (err){
      res.send(err);
      return;
    }
    res.json(releases);
  });

};


exports.getSummaryMvDrc = function(req, res) {
  
  var db;
  if(req.query.releaseType == "released"){
    db = summary_mv_drc_hierarchy;
  }
  if(req.query.releaseType == "unreleased"){
    db = summary_mv_drc_hierarchy_un;
  }
  
  db.findOne({'release_id': req.params.release_id}, {}, {}, function(err, releases) {
    if (err){
      res.send(err);
      return;
    }
    res.json(releases);
  });

};


exports.getSummaryInfo = function(req, res) {
  var db;
  if(req.query.releaseType == "released"){
    db = summary_hierarchy;
  }
  if(req.query.releaseType == "unreleased"){
    db = summary_hierarchy_un;
  }



  db.find({'release_id': req.params.release_id}, {}, {}, function(err, releases) {
    if (err){
      res.send(err);
      return;
    }
    var ans = [];
    var alreadyCheckedCategory = {};
    for(var i=0;i<releases.length;i++){

      var release = releases[i].toObject();

      var category = release['category'];

      if(!alreadyCheckedCategory[category]){
	alreadyCheckedCategory[category] = 1;
	var temp = {};
	temp['name'] = category;
	temp['subCategories'] = [];
	ans.push(temp);
      }

      for(var j=0;j<ans.length;j++){
	var sub_category = release['sub-category'];
	if(ans[j]['name'] == release['category']){
	  var sub_position = -1;
	  for(var k=0;k<ans[j]['subCategories'].length;k++){
	    if(ans[j]['subCategories'][k]['sub_name'] == sub_category){
		sub_position = k;
		break;
	    }
	  }
	  var sData = {property: release['property'], result: release['result']};
	  if(sub_position == -1){
	    var temp_sub = {};
	    temp_sub['sub_name'] = sub_category;
	    temp_sub['data'] = [sData];
/*      temp_sub['property'] = release['property'];
	    temp_sub['result'] = release['result'];*/
	    ans[j]['subCategories'].push(temp_sub);
	  }else{
	    ans[j]['subCategories'][sub_position]['data'].push(sData);
	  }
	}
	
      }
    }

    res.json(ans);
  });
};



























