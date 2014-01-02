/* global describe, it, afterEach, before, beforeEach, setTimeout, __dirname */

require('mocha-as-promised')();

var chai = require('chai');
var assert = chai.assert;
chai.use(require('chai-as-promised'));

var _ = require('lodash');
var Q = require('q');

var BROWSERS = {
  //chrome: { browserName: 'chrome' },
  iphone: {
    browserName: '',
    app: 'safari',
    device: 'iPhone Simulator',
    platform: 'OS X 10.8',
    version: '6',
    'device-orientation': 'portrait',
  },
};

require('./driver.js')();

describe('opening a popup', function(){
  _.each(BROWSERS, function(browser, browserName){
    it('in ' + browserName, function(){
      var _this = this;
      this.timeout(60000);

      return assert.eventually.equal(
        _this.driver
          .init(browser)
          .get('http://fiddle.jshell.net/XJukJ/2/show/light/')
          .waitForElementById('clickMe', 5000)
          .click()
          .then(function(){
            var deferred = Q.defer();

            setTimeout(function(){
              _this.driver.windowHandles()
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
