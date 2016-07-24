// Image search abstraction layer

var express = require('express');

var app = express();

var port = process.env.PORT || 8080;

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
  
});

app.listen(port, function () {
  console.log('App is running on port ' + port);
});