/* global describe, it, afterEach, before, beforeEach, setTimeout, __dirname */

require('mocha-as-promised')();

var chai = require('chai');
var assert = chai.assert;
chai.use(require('chai-as-promised'));

var _ = require('lodash');
var Q = require('q');

var URL = "https://checkout.stripe.com/demo/launcher?integration=button&version=%2Fv3&rnd=uu2dexnipb9&domain=http%3A%2F%2F127.0.0.1%3A5432&key=pk_test_09IUAkhSGIz8mQP3prdgKm06&name=test-uu2dexnipb9"
var BROWSERS = {
  iphone: {
    browserName: '',
    app: __dirname + '/WebViewApp.app',
    device: 'iPhone Simulator',
    version: '7',
    'device-orientation': 'portrait',
  },
};

require('./driver.js')('127.0.0.1', 4723);

describe('operating on a frame', function(){
  _.each(BROWSERS, function(browser, browserName){
    it('in ' + browserName + ' selects an element inside an iframe', function(){
      var _this = this;
      this.timeout(60000);

      return _this.driver
        .init(browser)
        .windowHandles()
        .then(function(handles){
          return _this.driver.window(handles[0])
            .get(URL)
            .waitForElementByClassName('stripe-button-el', 5000)
            .click();
        })
        .then(function(){
          return _this.driver.waitForElementByName('stripe_checkout_app', 5000)
            .elementByName('stripe_checkout_app');
        })
        .then(function(frameElement){
          return _this.driver.frame(frameElement);
        }).then(function(){
          return _this.driver.waitForVisibleByName('email', 5000).click();
        });
    });
  });
});
