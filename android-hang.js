/* global describe, it, afterEach, before, beforeEach, setTimeout, __dirname */

var ITERATIONS = 20;
var TIMEOUT = 10000;

require('mocha-as-promised')();

var chai = require('chai');
var assert = chai.assert;
chai.use(require('chai-as-promised'));

var _ = require('lodash');
var Q = require('q');

require('./driver.js')();

var BROWSERS = {
  //firefox: { browserName: 'firefox' },
  android: {
    browserName: 'android',
    platform: 'Linux',
    version: '4.0',
    'device-orientation': 'portrait',
    'tunnel-identifier': 'i56bkcmzpvi'
  },
};

describe('finding and clicking elements', function(){
  _.each(BROWSERS, function(browser, browserName){
    it('in ' + browserName + ' does a bunch of stuff without hanging', function(){
      var _this = this;
      var timer;
      var promise;

      // Yikes, it can take over 1 minute to initialize the browser!
      this.timeout(120000);

      promise = assert.isFulfilled(_this.driver.init(browser),
                                   'Could not initialize driver')
        .then(function(){
          _this.timeout(TIMEOUT * 4);

          timer = setTimeout(function(){
            assert(false, 'It took more than ' + TIMEOUT * 2 + 'ms to do the initial load and click');
          }, TIMEOUT * 2);

          return _this.driver.get('http://fiddle.jshell.net/FPdkU/3/show/light')
            .waitForElementById('clickMe', 5000)
            .click()
            .then(function(){
              return _this.driver.windowHandles().then(function(handles){
                assert.equal(2, handles.length, 'Expected 2 windows');
                return _this.driver.window(handles[1]);
              });
            });
        })
      .then(function(){
        clearTimeout(timer);
      });

      for(i = 0; i < ITERATIONS; i++){
        promise = promise.then(function(){
          timer = setTimeout(function(){
            assert(false, 'It took more than ' + TIMEOUT + 'ms to find and click on iteration ' + i + '.');
          }, TIMEOUT);

          // Don't have Mocha timeout
          _this.timeout(TIMEOUT*2);

          return _this.driver.elementById('altTextLink').click();
        }).then(function(){
          if(timer){
            clearTimeout(timer);
          }
        });
      }

      return promise;
    });
  });
});
