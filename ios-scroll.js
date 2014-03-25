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
    'device-orientation': 'landscape',
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
        .get('http://fiddle.jshell.net/F2JvB/3/show/light/')
        .waitForElementById('clickMeTop', 5000)
        .click()
        .elementById('clickMeBottom')
        .click();
    });
  });
});
