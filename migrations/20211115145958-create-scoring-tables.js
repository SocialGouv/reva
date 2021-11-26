'use strict';

var dbm;
var type;
var seed;
var fs = require('fs');
var path = require('path');
const score = require('./js/score');
var Promise;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
  Promise = options.Promise;
};

exports.up = function (db) {
  var filePath = path.join(__dirname, 'sqls', '20211115145958-create-scoring-tables-up.sql');
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
      if (err) return reject(err);
      console.log('received data: ' + data);

      resolve(data);
    });
  })
    .then(function (data) {
      return db.runSql(data);
    })
    .then(function () {
      return score.updateAnswersScoreFromCsvFile(db, '2021-11-18-answers-scores.csv');
    })
    .then(function (queriesPromise) {
      return queriesPromise
    });

};

exports.down = function (db) {
  var filePath = path.join(__dirname, 'sqls', '20211115145958-create-scoring-tables-down.sql');
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
      if (err) return reject(err);
      console.log('received data: ' + data);

      resolve(data);
    });
  })
    .then(function (data) {
      return db.runSql(data);
    });
};

exports._meta = {
  "version": 1
};
