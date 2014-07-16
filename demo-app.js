var http = require('http');
var express = require('express');

module.exports = function(port){
  var app = express();
  app.set('views', '.');

  app.get('/:loadId', function(req, res){
    // console.log("Request received", req.params.loadId, new Date());
    res.render('demo-app.html.ejs', {
      loadId: req.params.loadId
    });
  });

  return http.createServer(app).listen(port, function(){
    console.log('Demo app listening on port ' + port);
  });
};
