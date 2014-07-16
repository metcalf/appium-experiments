webdriver-experiments
==================

Debugging and experimenting with webdriver (in particular on Saucelabs)

Before starting, you need to create a `sauce-credentials.json` file in the root directory.  It should contain a single object with `username` and `key` keys corresponding to your Saucelabs username and API secret key.

You'll also need to install packages:

    npm install

iOS Popup Bug (fixed)
-------------

Run:

    mocha ios-popup.js

The test will pass in Chrome but fail on iPhone.  The iPhone video will show nothing happening (no popup).  If you go into interactive mode in the Saucelabs dashboard while the iPhone test is running, you can click the link manually, get the popup and cause the test to pass.
