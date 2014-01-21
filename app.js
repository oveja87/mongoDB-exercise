
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

// mongo
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/local');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);


// TWITTER
//
	// filter the public stream by the latitude/longitude bounded box of San Francisco
	//
function getTweets(){
	
	var Twit = require('twit')

	var T = new Twit({
	    consumer_key:         'xL0BXTOaaCcQmVmLA6nlYQ'
	  , consumer_secret:      'Bek6nLcTnLl4rLxifZShemQd2SMsD4eIzyOyKo1WzE'
	  , access_token:         '29187442-LorzteOUEh0T0EWVj4vIVmSOPx9jhZ0G8YsRDweId'
	  , access_token_secret:  'FkIwNhLo0ncZMPpsm7ayUulP6Z0Cm4Ta6T8GCe82vOP6J'
	})
	
	var fs = require('fs');
	
	var geo = [ '-180', '-90', '180', '90' ];	
	
	var stream = T.stream('statuses/filter', { locations: geo, language: 'en' });
	var i = 0;	
	var file = 0;
	
	stream.on('tweet', function (tweet) {
	  fs.appendFile('tweets'+file+'.json', JSON.stringify(tweet)+"\n", function(err) {
	    if(err) {
	      console.log(err);
	    } else {
	      console.log("JSON saved to tweets"+i+".json");
	    }
		}); 
	  
	  
	  i++;
	  if(i%500==0){	  
	  	file++;
	  	console.log("///")	
	  	setTimeout(function(){console.log("-->");stream.start();},1000);
	  	stream.stop();
	  }
	})	
}	

//getTweets();

// Server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
