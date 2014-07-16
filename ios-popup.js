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
    // platform: 'OS X 10.8',
    version: '7.1',
    'device-orientation': 'portrait',
  },
  ipad: {
    browserName: '',
    app: 'safari',
    device: 'iPad Simulator',
    // platform: 'OS X 10.8',
    version: '7.1',
    'device-orientation': 'portrait',
  },
};

require('./driver.js')('127.0.0.1', '4723');

describe('opening a popup', function(){
  _.each(BROWSERS, function(browser, browserName){
    it('in ' + browserName, function(){
      var _this = this;
      this.timeout(60000);

      return _this.driver
          .init(browser)
          .get('http://fiddle.jshell.net/XJukJ/4/show/light/')
          .waitForElementById('clickMe', 5000)
          .click()
          .then(function(){
            return _this.driver.windowHandles()
              .then(function(handles){
                console.log('handles: ' + handles);
                assert.equal(2, handles.length, "Popup did not appear");
                return _this.driver.window(handles[1]);
              });
          }).then(function(){
            return _this.driver
              .waitForElementByCssSelector("div.pay a")
              .click();
          });
    });
  });
});
