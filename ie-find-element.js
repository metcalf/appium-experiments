/* global describe, it, afterEach, before, beforeEach, setTimeout, __dirname */

require('mocha-as-promised')();

var chai = require('chai');
var assert = chai.assert;
chai.use(require('chai-as-promised'));

var _ = require('lodash');
var Q = require('q');

require('./driver.js')();

var BROWSERS = {
  //firefox: { browserName: 'firefox',    'tunnel-identifier': 'mus6onzsemi', },
  ie6: {
    browserName: 'internet explorer',
    version: '6',
    platform: 'Windows XP',
    'tunnel-identifier': 'mus6onzsemi',
  },
};

function getPage(driver, browser){
  return driver
    .init(browser)
    .get('http://127.0.0.1:5432/demo/launcher?fallback=on')
    .frame(0)
    .elementByClassName('stripe-button-el')
    .click();
}

function delay(){
  var deferred = Q.defer();

  // Wait to be really sure things have loaded
  setTimeout(deferred.fulfill, 5000);

  return deferred.promise;
}

describe('finding elements in a popup', function(){
  _.each(BROWSERS, function(browser, browserName){
    it('in ' + browserName + ' if you find the popup, wait, then switch', function(){
      var _this = this;
      var handles;
      this.timeout(60000);

      return getPage(this.driver, browser)
        .then(function(){
          return _this.driver.windowHandles().then(function(h){
            assert.equal(2, h.length, 'Expected 2 windows');
            handles = h;
          });
        })
        .then(function(){
          return _this.driver.window(handles[1]);
        })
        .then(function(){
          return delay();
        })
        .then(function(){
          return assert.isFulfilled(
            _this.driver
              .elementByName('email')
              .click(),
            'Failed to find field in checkout');
        });
    });
  });
});
