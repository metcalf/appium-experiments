/* global describe, it, afterEach, before, beforeEach, setTimeout, __dirname */

require('mocha-as-promised')();

var chai = require('chai');
var assert = chai.assert;
chai.use(require('chai-as-promised'));

var _ = require('lodash');
var Q = require('q');
var wd = require('wd');

require('./driver.js')('localhost', 8080);

var ITERATIONS = 20;
var TIMEOUT = 30000;
var CLEAR_KEYS = [
  wd.SPECIAL_KEYS.End,
  wd.SPECIAL_KEYS['Back space'],
  wd.SPECIAL_KEYS['Back space'],
  wd.SPECIAL_KEYS['Back space'],
].join('');

var URLS = {
  //jsFiddle: 'http://fiddle.jshell.net/Pk98x/3/show/light',
  StripeCheckout: 'https://checkout.stripe.com/demo/launcher',
};

var BROWSERS = {
  //chrome: { browserName: 'chrome', chromeOptions: { args: ['--user-agent=Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30'] } },
  android: {
    browserName: 'android',
    //platform: 'Linux',
    version: '4.0',
    'device-orientation': 'portrait',
  },
};

function doPromiseIteration(promise, iteration, _this){
  var timer;
  var deferred = Q.defer();

  promise.then(function(){
    timer = setTimeout(function(){
      console.log('It took more than ' + TIMEOUT + 'ms to find and type on iteration ' + iteration + '.');
      deferred.reject();
    }, TIMEOUT);

    // Don't have Mocha timeout
    _this.timeout(TIMEOUT*2);

    return assert.eventually.equal(_this.driver.elementByName('cc-csc')
                                   .type(CLEAR_KEYS)
                                   .type('1' + iteration)
                                   .getAttribute('value'),
                                   '1' + iteration,
                                   'CVC did not type correctly');
  }).then(function(res){
    clearTimeout(timer);
    deferred.fulfill(res);
  }, function(error){
    clearTimeout(timer);
    deferred.reject(error);
  });

  return assert.isFulfilled(deferred.promise);
}

describe('finding and clicking elements', function(){
  _.each(BROWSERS, function(browser, browserName){
    _.each(URLS, function(url, urlName){
      it('in ' + browserName + ' at ' + urlName + ' does not hang', function(){
        var _this = this;
        var timer;
        var promise;
        var mainWindow;

        // Yikes, it can take over 1 minute to initialize the browser!
        this.timeout(120000);

        promise = assert.isFulfilled(_this.driver.init(browser),
                                     'Could not initialize driver')
          .then(function(){
            _this.timeout(TIMEOUT * 4);

            timer = setTimeout(function(){
              assert(false, 'It took more than ' + TIMEOUT * 2 + 'ms to do the initial load and click');
            }, TIMEOUT * 2);

            return _this.driver.get(url)
              .windowHandle().then(function(handle){
                mainWindow = handle;
              });
          })
          .then(function(){
            return _this.driver.waitForElementByClassName('stripe-button-el', 5000)
              .click()
              .waitForElementByClassName('cc-csc-', 30000, 5000)
              .then(function(){
                return _this.driver.windowHandles().then(function(handles){
                  assert.equal(2, handles.length, 'Expected 2 windows');

                  var handle = _.find(handles, function(h){ return h != mainWindow; });
                  return _this.driver.window(handle);
                });
              });
          })
          .then(function(){
            clearTimeout(timer);
          }).then(function(){
            _this.timeout(TIMEOUT * 6);
            return assert.isFulfilled(_this.driver.waitForElementByName('cc-csc', TIMEOUT * 4),
                                      'Timeout waiting for cc-csc field');
          });

        promise = assert.isFulfilled(promise,
                                     'Error getting window loaded');

        for(i = 0; i < ITERATIONS; i++){
          promise = doPromiseIteration(promise, i, _this);
        }

        return promise;
      });
    });
  });
});
