/* global describe, it, afterEach, before, beforeEach, setTimeout, __dirname */

require('mocha-as-promised')();

var chai = require('chai');
var assert = chai.assert;
chai.use(require('chai-as-promised'));

var wd = require('wd');
var _ = require('lodash');
var Q = require('q');
var fs = require('fs');


var BROWSERS = {
  chrome: { browserName: 'chrome' },
  iphone: {
    browserName: '',
    app: 'safari',
    device: 'iPhone Simulator',
    platform: 'OS X 10.8',
    version: '6.0',
    'device-orientation': 'portrait',
  },
};

var driver, username, key;

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

  driver = wd.promiseChainRemote(
    "ondemand.saucelabs.com",
    80,
    username,
    key
  );

  driver.on('status', function(info){
    console.log('\x1b[36m%s\x1b[0m', info);
  });

  driver.on('command', function(meth, path){
    console.log(' > \x1b[33m%s\x1b[0m: %s', meth, path);
  });

  return driver;
});

afterEach(function(){
  return driver.quit();
});

describe('opening a popup', function(){
  _.each(BROWSERS, function(browser, browserName){
    it('in ' + browserName, function(){
      this.timeout(60000);

      return assert.eventually.equal(
        driver
          .init(browser)
          .get('http://fiddle.jshell.net/XJukJ/1/show/light/')
          .elementById('clickMe')
          .click()
          .then(function(){
            var deferred = Q.defer();

            setTimeout(function(){
              driver.windowHandles()
                .then(function(handles){
                  console.log('handles: ' + handles);
                  deferred.fulfill(handles.length);
                });
            }, 5000);

            return deferred.promise;
          }), 2, 'Popup did not appear');
    });
  });
});
