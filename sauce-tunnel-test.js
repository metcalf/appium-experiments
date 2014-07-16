var fs = require('fs');
var crypto = require('crypto');

var _ = require('lodash');
var async = require('async');
var wd = require('wd');
var Q = require('q');

var argv = require('minimist')(process.argv.slice(2));

var desiredCapabilities = {
  browserName: argv.browser || 'chrome',
  platform: argv.platform,
  'tunnel-identifier': argv['tunnel-identifier'],
};

var iterations = parseInt(argv.iterations || '10', 10);
var concurrency = parseInt(argv.concurrency || '1', 10);
var appPort = parseInt(argv.port || '5556', 10);
var expId = crypto.randomBytes(4).toString('hex');
var nameBase = 'experiment-' + expId + '-iteration-';
var credentials = JSON.parse(fs.readFileSync(__dirname + '/sauce-credentials.json', 'utf8'));

function newDriver(){
  return wd.promiseChainRemote(
    argv['se-host'] || 'ondemand.saucelabs.com',
    argv['se-port'] || 80,
    credentials.username,
    credentials.key
  );
}

var startTime = new Date();
var server = require('./demo-app.js')(appPort);

// Destroy sockets after a short timeout to get the
// server closed faster
server.on('connection', function (socket) {
  socket.setTimeout(10000);
  socket.on('close', function () {
    socket.destroy();
  });
});


console.log('Running ' + iterations + ' iterations with ' + concurrency +
            ' running concurrently (experiment ' + expId + ').');

async.mapLimit(_.range(iterations), concurrency, function(i, cb){
  var stepName = 'start';
  var deferred = Q.defer();

  var mainTimeout = setTimeout(function(){
    deferred.reject('Hard timeout');
  }, 100000);

  var driver = newDriver();

  deferred.resolve(
    driver
      .init(_.assign({'name': nameBase + i}, desiredCapabilities))
      .then(function(d){ stepName = 'inited'; return d; })
      .get('http://demo-app.lvh.me:' + appPort + '/' + i)
      .then(function(d){ stepName = 'got url'; return d; })
      .waitForElementById('loaded' + i, 20000)
      .then(function(d){ stepName = 'got el'; return d; })
  );

  deferred.promise.finally(function(){
    clearTimeout(mainTimeout);
    return driver.quit();
  }).done(function(){
    process.stdout.write('.');
    cb();
  }, function(err){
    process.stdout.write('x');
    cb(null, new Error('Error running test ' + i + ' at ' + stepName + ': \n' + err));
  });
}, function(err, results){
  console.log();

  if(err){
    console.log('Error running tunnel test: ', err);
    return;
  }

  failures = results.filter(function(result){
    return result instanceof Error;
  }, 0);
  console.log('Ran in ' + ((new Date()) - startTime) / 1000 + 's');
  console.log('' + failures.length + ' of ' + iterations + ' runs failed.');

  if(failures.length > 0){
    console.log('Failures were:');

    failures.forEach(function(failure){
      console.log();
      console.log(failure);
    });
  }

  server.close(function(){
    console.log('Demo app closed');
  });
});
