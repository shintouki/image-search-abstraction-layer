// Image search abstraction layer

var express = require('express');
var bing = require('node-bing-api')( { accKey: "gecdokye1k+b90bO499+jMvO7uEXGWJQt48nZqIofPo="} );
var MongoClient = require('mongodb').MongoClient;

var app = express();

var port = process.env.PORT || 8080;


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
  
});

var re = new RegExp ("^/imagesearch/((?:\\w+(?:%20)?)+)(?:\\?offset=(\\d+))?$");

app.get(re, function (req, res) {
    var capturedGroups = re.exec(req.url);
    
    
    var searchPhrase = capturedGroups[1].split('%20').join(' ');
    var offset = 0;

    if (capturedGroups[2] != undefined) {
        offset = parseInt(capturedGroups[2]);
    }
    
    var timeNow = new Date();
    MongoClient.connect('mongodb://admin:admin123@ds029745.mlab.com:29745/image-search', function(err, db) {
        if (err) throw err;
        
        var urlCollection = db.collection('prev-searches');
          
        urlCollection.insert({ "search term": searchPhrase, "time": timeNow }, function(err, data) {
            if (err) throw err;
            db.close();
            });
    });
    

    bing.images(searchPhrase, {skip: offset}, function(error, searchRes, body) {
        console.log(body.d.__next);
        var searchResults = [];

        for (var i=0; i<10; i++) {
          
            var url = body.d.results[i].MediaUrl;
            var snippet = body.d.results[i].Title;
            var thumbnail = body.d.results[i].Thumbnail.MediaUrl;
            var context = body.d.results[i].SourceUrl;
            
            var info = {
                url: url,
                snippet: snippet,
                thumbnail: thumbnail,
                context: context
            }
            searchResults.push(info);
        }
        
        res.send(searchResults);
    });

  
});

app.get('/latest-searches', function(req, res){
  
  MongoClient.connect('mongodb://admin:admin123@ds029745.mlab.com:29745/image-search', function(err, db) {
        if (err) throw err;
        
        var urlCollection = db.collection('prev-searches');
          
        urlCollection.find({},
        { "_id": 0, "search term": 1, "time": 1}).sort({$natural:-1}).toArray(function(err, doc) {
            if (err) throw err;
              res.send(doc.slice(0,10));
            
            db.close();
        });
        
      
    });
  
});

app.get('*', function(req, res){
  
  res.send(JSON.stringify( {error: "Search Invalid"}));
});


app.listen(port, function () {
  console.log('App is running on port ' + port);
});