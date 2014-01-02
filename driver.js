/* global describe, it, afterEach, before, beforeEach, setTimeout, __dirname */

var wd = require('wd');
var Q = require('q');
var fs = require('fs');
var driver = require('./driver.js');

var username, key;

module.exports = function(){
  before(function(){
    var deferred = Q.defer();

    fs.readFile(__dirname + '/sauce-credentials.json', 'utf8', function (err, data) {
      if (err) {
        throw err;
      }

      data = JSON.parse(data);

      username = data.username;
      key = data.key;

      deferred.fulfill();
    });

    return deferred.promise;
  });

  beforeEach(function(){
    this.timeout(20000);

    this.driver = wd.promiseChainRemote(
      "ondemand.saucelabs.com",
      80,
      username,
      key
    );

    this.driver.on('status', function(info){
      console.log('\x1b[36m%s\x1b[0m', info);
    });

    this.driver.on('command', function(meth, path){
      console.log(' > \x1b[33m%s\x1b[0m: %s', meth, path);
    });
  });

  afterEach(function(){
    return this.driver.quit();
  });
};
