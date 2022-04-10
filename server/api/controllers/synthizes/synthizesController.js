'use strict';


var debug_db = require('../../../debug_db.js');
var unrelease_db = require('../../../unreleased_db.js');
var release_db = require('../../../released_db.js');

var  timing_release_un = unrelease_db.model('timing_release_un');
var  summary_release_un = unrelease_db.model('summary_release_un');
var  area_release_un = unrelease_db.model('area_release_un');
var  leakage_release_un = unrelease_db.model('leakage_release_un');


var  timing_release = release_db.model('timing_release');
var  summary_release = release_db.model('summary_release');
var  area_release = release_db.model('area_release');
var  leakage_release = release_db.model('leakage_release');


var unreleased_dbs = [timing_release_un, summary_release_un, area_release_un, leakage_release_un];
var released_dbs = [timing_release, summary_release, area_release, leakage_release];


var async = require('async');




exports.init_info = function(req, res) {
  var arr = released_dbs;
  if(req.query.releaseType == "unreleased"){
    arr = unreleased_dbs;
  }

  var calls = [];
  var answer = [];
  arr.forEach(function(dbInfo){
      calls.push(function(callback) {
	  dbInfo.find({isHide: {$ne: true}}).distinct('project', function(err, dataInfo) {
	    if (!err && dataInfo){
	      answer = answer.concat(dataInfo);
	    }
	    callback(null, dbInfo);
	  });

      }
  )});

  async.parallel(calls, function(err, result) {
	res.json([...new Set(answer)]);
  });


};



exports.getCores = function(req, res) {

  var calls = [];
  var answer = [];
  released_dbs.forEach(function(dbInfo){
      calls.push(function(callback) {
	  dbInfo.find({'project': req.params.project, isHide: {$ne: true}}).distinct('core', function(err, dataInfo) {
	    if (!err && dataInfo){
	      answer = answer.concat(dataInfo);
	    }
	    callback(null, dbInfo);
	  });
      }
  )});

  async.parallel(calls, function(err, result) {
	res.json([...new Set(answer)]);
  });


};

exports.getRtls = function(req, res) {

  var calls = [];
  var answer = [];
  released_dbs.forEach(function(dbInfo){
      calls.push(function(callback) {
	  dbInfo.find({'project': req.params.project,'core': req.params.core, isHide: {$ne: true}}).distinct('rtl_name', function(err, dataInfo) {
	    if (!err && dataInfo){
	      answer = answer.concat(dataInfo);
	    }
	    callback(null, dbInfo);
	  });
      }
  )});

  async.parallel(calls, function(err, result) {
	res.json([...new Set(answer)]);
  });


};

exports.getReleases = function(req, res) {

  var calls = [];
  var answer = [];
  released_dbs.forEach(function(dbInfo){
      calls.push(function(callback) {
	  dbInfo.find({'project': req.params.project,'core': req.params.core, 'rtl_name': req.params.rtl, isHide: {$ne: true}}).distinct('release_name', function(err, dataInfo) {
	    if (!err && dataInfo){
	      answer = answer.concat(dataInfo);
	    }
	    callback(null, dbInfo);
	  });
      }
  )});

  async.parallel(calls, function(err, result) {
	res.json([...new Set(answer)]);
  });


};




exports.getUnits = function(req, res) {

  var calls = [];
  var answer = [];
  unreleased_dbs.forEach(function(dbInfo){
      calls.push(function(callback) {
	  dbInfo.find({'project': req.params.project, isHide: {$ne: true}}).distinct('unit', function(err, dataInfo) {
	    if (!err && dataInfo){
	      answer = answer.concat(dataInfo);
	    }
	    callback(null, dbInfo);
	  });
      }
  )});

  async.parallel(calls, function(err, result) {
	res.json([...new Set(answer)]);
  });


};


exports.getUsers = function(req, res) {

  var calls = [];
  var answer = [];
  unreleased_dbs.forEach(function(dbInfo){
      calls.push(function(callback) {
	  dbInfo.find({'project': req.params.project, 'unit': req.params.unit, isHide: {$ne: true}}).distinct('user', function(err, dataInfo) {
	    if (!err && dataInfo){
	      answer = answer.concat(dataInfo);
	    }
	    callback(null, dbInfo);
	  });

      }
  )});

  async.parallel(calls, function(err, result) {
	res.json([...new Set(answer)]);
  });


};

exports.getRunids = function(req, res) {

  var calls = [];
  var answer = [];
  unreleased_dbs.forEach(function(dbInfo){
      calls.push(function(callback) {
	  dbInfo.find({'project': req.params.project, 'unit': req.params.unit, 'user': req.params.user, isHide: {$ne: true}}).distinct('run_id', function(err, dataInfo) {
	    if (!err && dataInfo){
	      answer = answer.concat(dataInfo);
	    }
	    callback(null, dbInfo);
	  });

      }
  )});

  async.parallel(calls, function(err, result) {
	res.json([...new Set(answer)]);
  });



};

exports.getStages = function(req, res) {

  var calls = [];
  var answer = [];
  unreleased_dbs.forEach(function(dbInfo){
      calls.push(function(callback) {
	  dbInfo.find({'project': req.params.project, 'unit': req.params.unit, 'user': req.params.user, 'run_id': req.params.run_id, isHide: {$ne: true}}).distinct('stage', function(err, dataInfo) {
	    if (!err && dataInfo){
	      answer = answer.concat(dataInfo);
	    }
	    callback(null, dbInfo);
	  });

      }
  )});

  async.parallel(calls, function(err, result) {
	res.json([...new Set(answer)]);
  });

};

exports.getDates = function(req, res) {

  var calls = [];
  var answer = [];
  unreleased_dbs.forEach(function(dbInfo){
      calls.push(function(callback) {
	  dbInfo.find({'project': req.params.project, 'unit': req.params.unit, 'user': req.params.user, 'run_id': req.params.run_id, 'stage': req.params.stage, isHide: {$ne: true}}).distinct('date', function(err, dataInfo) {
	    if (!err && dataInfo){
	      answer = answer.concat(dataInfo);
	    }
	    callback(null, dbInfo);
	  });

      }
  )});

  async.parallel(calls, function(err, result) {
	res.json([...new Set(answer)]);
  });


};
