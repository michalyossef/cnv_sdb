'use strict';


var debug_db = require('../../../debug_db.js');
var release_db = require('../../../released_db.js');
var unreleased_db = require('../../../unreleased_db.js');

// var mongoose = require('mongoose');
var  timing_release_un = unreleased_db.model('timing_release_un');
var  timing_hierarchy_un = unreleased_db.model('timing_hierarchy_un');

var  timing_release = release_db.model('timing_release');
var  timing_hierarchy = release_db.model('timing_hierarchy');


var async = require('async');


exports.init_info = function(req, res) {
  timing_release_un.find({isHide: {$ne: true}}).distinct('project', function(err, projects) {
    if (err){
      res.send(err);
      return;
    }
    res.json(projects);
  });
};


exports.getUnits = function(req, res) {
  timing_release_un.find({'project': req.params.project, isHide: {$ne: true}}).distinct('unit', function(err, units) {
    if (err){
      res.send(err);
      return;
    }
    res.json(units);
  });
};


exports.getUsers = function(req, res) {
  timing_release_un.find({'project': req.params.project, 'unit': req.params.unit, isHide: {$ne: true}}).distinct('user', function(err, users) {
    if (err){
      res.send(err);
      return;
    }
    res.json(users);
  });
};

exports.getRunids = function(req, res) {
  timing_release_un.find({'project': req.params.project, 'unit': req.params.unit, 'user': req.params.user, isHide: {$ne: true}}).distinct('run_id', function(err, runids) {
    if (err){
      res.send(err);
      return;
    }
    res.json(runids);
  });
};

exports.getStages = function(req, res) {
  timing_release_un.find({'project': req.params.project, 'unit': req.params.unit, 'user': req.params.user, 'run_id': req.params.run_id, isHide: {$ne: true}}).distinct('stage', function(err, stages) {
    if (err){
      res.send(err);
      return;
    }
    res.json(stages);
  });
};

exports.getDates = function(req, res) {
  timing_release_un.find({'project': req.params.project, 'unit': req.params.unit, 'user': req.params.user, 'run_id': req.params.run_id, 'stage': req.params.stage, isHide: {$ne: true}}).distinct('date', function(err, dates) {
    if (err){
      res.send(err);
      return;
    }
    res.json(dates);
  });
};


exports.getTimingReports = function(req, res) {
  var query = JSON.parse(req.query.query);
  query.isHide = {$ne: true};
  var db;
  if(req.query.releaseType == "released"){
    db = timing_release;
  }
  if(req.query.releaseType == "unreleased"){
    db = timing_release_un;
  }
  db.find(query).distinct('report_type', function(err, dates) {
    if (err){
      res.send(err);
      return;
    }
    res.json(dates);
  });
};


exports.getTimingDelays = function(req, res) {
//   timing_release.find({'project': req.params.project, 'core': req.params.core, 'rtl_name': req.params.rtl, 'release_name': req.params.release, 'report_type': req.params.report, isHide: {$ne: true}}).distinct('delay_type', function(err, dates) {
//     if (err){
//       res.send(err);
//       return;
//     }
//     res.json(dates);
//   });

  var query = JSON.parse(req.query.query);
  query.isHide = {$ne: true};
  var db;
  if(req.query.releaseType == "released"){
    db = timing_release;
  }
  if(req.query.releaseType == "unreleased"){
    db = timing_release_un;
  }
  db.find(query).distinct('delay_type', function(err, dates) {
    if (err){
      res.send(err);
      return;
    }
    res.json(dates);
  });

};

exports.getTimingScenarios = function(req, res) {
//   timing_release.find({'project': req.params.project, 'core': req.params.core, 'rtl_name': req.params.rtl, 'release_name': req.params.release, 'report_type': req.params.report, 'delay_type': req.params.delay, isHide: {$ne: true}}).distinct('scenario_name', function(err, dates) {
//     if (err){
//       res.send(err);
//       return;
//     }
//     res.json(dates);
//   });

  var query = JSON.parse(req.query.query);
  query.isHide = {$ne: true};
  var db;
  if(req.query.releaseType == "released"){
    db = timing_release;
  }
  if(req.query.releaseType == "unreleased"){
    db = timing_release_un;
  }
  console.log(query);
  db.find(query).distinct('scenario_name', function(err, dates) {
    if (err){
      res.send(err);
      return;
    }
    res.json(dates);
  });

};


exports.getTimingInfo = function(req, res) {
  var db;
  var qq = {};
  if(req.query.releaseType == "released"){
    db = timing_hierarchy;
    qq['release_id'] = req.params.release_id;
    qq['extra_info'] = req.query.extra_info;

  }
  if(req.query.releaseType == "unreleased"){
    qq['release_id'] = req.params.release_id;
    qq['extra_info'] = req.query.extra_info;

    db = timing_hierarchy_un;
  }
//   console.log(db);
  var basicQuery = {"$and":[qq]};
  var groupFilter = {};
  var startFilter = {};
  var clkStartFilter = {};

  if(req.query && req.query.filter){
    var filterObj = JSON.parse(req.query.filter);
    if(filterObj["groups"] && filterObj["groups"].length > 0){
      groupFilter.group = { "$in" : filterObj["groups"]};
      basicQuery["$and"].push(groupFilter);
    }

    if(filterObj["start"]){
      startFilter.start = {"$regex": filterObj["start"]};
      basicQuery["$and"].push(startFilter);
    }

    if(filterObj["clk_start"]){
      clkStartFilter.clk_start = {"$regex": filterObj["clk_start"]};
      basicQuery["$and"].push(clkStartFilter);
    }


    var slackFilter = { "$or" : []};

    if(filterObj["slacksStrings"] && filterObj["slacksStrings"].length){
      slackFilter["$or"].push({"slack": { "$in" : filterObj["slacksStrings"]} });
    }
    if(filterObj["slacksRanges"] && filterObj["slacksRanges"].length){
      for(var i=0;i<filterObj["slacksRanges"].length;i++){
	var range = filterObj["slacksRanges"][i];
	console.log({"slack": {"$gte": range[0], "$lte": range[1]} });
	slackFilter["$or"].push({"slack": {"$gte": range[0], "$lte": range[1]} });
      }
      
    }

    if(slackFilter["$or"].length)
      basicQuery["$and"].push(slackFilter);

  }
  
  console.log(basicQuery);
  db.find(basicQuery, {}, {limit: 1000}, function(err, releases) {
    if (err){
      res.send(err);
      return;
    }
    res.json(releases);
  });
};

exports.getTimingFilterOptions = function(req, res) {
  var db;
  var qq = {};
  if(req.query.releaseType == "released"){
    db = timing_hierarchy;
    qq['release_id'] = req.params.release_id;
    qq['extra_info'] = req.query.extra_info;

  }
  if(req.query.releaseType == "unreleased"){
    qq['release_id'] = req.params.release_id;
    qq['extra_info'] = req.query.extra_info;

    db = timing_hierarchy_un;
  }
  console.log(qq);
//   console.log(db);

  db.find(qq).distinct('group', function(err, groups) {
    if (err){
      res.send(err);
      return;
    }

    db.find(qq).distinct('slack', function(err, slacks) {
      if (err){
	res.send(err);
	return;
      }
      var numericSlacks = [];
      var stringSlacks = [];
      for(var i=0;i<slacks.length;i++){
	var slack = slacks[i];
	if(!isNaN(parseFloat(slack)) && isFinite(slack)){
	  numericSlacks.push(slack);
	}else{
	  stringSlacks.push(slack);
	}
      }

      numericSlacks.sort().reverse();
      var marge = numericSlacks.length/10;
      marge = Number(marge.toFixed(0));
//       marge -=1;
      var ranges = [];
      var pos = 0;
      for(var i=0;i<10;i++){
	if(i==9){
// 	  var last = slacks.length -1;
	  var last = numericSlacks.slice(-1)[0]
	  ranges.push([numericSlacks[pos],numericSlacks[numericSlacks.length-1]]);
	}else{
	  ranges.push([numericSlacks[pos],numericSlacks[pos+marge]]);
	}
	
	pos += marge+1;
      }

      res.json({'groups': groups, 'slacks': {ranges: ranges, strings: stringSlacks}});
    });

  });
};




























