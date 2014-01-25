# Data Engineering Task 3 - MongoDB
 
1. Crawl Tweets via Twitter API and save them in files (Exercise 1)
2. MongoDB (Exercise 2)
3. Visualization (Exercise 3)
4. Installation
5. Contributors

##1. Crawl Tweets (Exercise 1)
We realized our tweet crawler with the help of [node.js](http://nodejs.org/). The basic node app is created with [express](https://github.com/visionmedia/express)
To acces the Twitter API from node.js, we used the Twitter API Client [twit](https://github.com/ttezel/twit), which supports both the REST and Streaming API.
To get an access token for the API, we registrated an app on [dev.twitter.com](https://dev.twitter.com).

The following code, which can be found in app.js, crawls the tweets from the API and saves them into .txt files. 

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

Each file contains only 500 Tweets, because otherwise, the files became to large to import them into mongoDB. An example file is tweets0.json.
	
##2. Mongo DB (Exercise 2)

### 2a.

First we installed mongoDB on windows. After that we created a data directory within our nodeapp. There the data are stored.
We started mongoDB by typing the following command from the mongo directory:
	mongod --dbpath <data directory path>.
We also used rockmongo for this exercise.
First we used its json import function to import the created textfiles. Moreover, we used rockmongo to perform some of the mapreduce jobs in the following exercises.

### 2b.

	var map = function() {  
	  emit('count', 1);
	}
	
	var reduce = function(key, values) {
	  return Array.sum( values );
	}
	
	db.tweets.mapReduce(map, reduce, {out: {replace: 'number_of_tweets'}});

### 2c.	
We converted the slangdict into a json file and imported it into the database. With the help of a scope, we could commit it to the map reduce job.

	var slangDict = {};
	db.dict.find().forEach(function(element){
	  slangDict[element.slang] = element.expression;
	});

	map = function() {
		emit(this._id, {"user":this.user.screen_name, "coordinates":this.coordinates, "text": this.text});
	}
	
	var reduce = function(key, values) {
		return values
	}
	
	var finalize = function(key, values) {	
		newText = values['text'];
		print(slangDict);
		for(var slang in slangDict) {
			var expression = slangDict[slang];
			newText = newText.replace(" "+slang+" "," "+expression+" ");
			newText = newText.replace(" "+slang+"."," "+expression+".");
			newText = newText.replace(" "+slang+"!"," "+expression+"!");
			newText = newText.replace(" "+slang+"?"," "+expression+"?");
			newText = newText.replace(" "+slang+":"," "+expression+":");
			newText = newText.replace(" "+slang+";"," "+expression+";");
		}
		
		return {user:values['user'], coordinate:values['coordinates'], text:newText};
	}
	
	db.tweets.mapReduce(
		map, 
		reduce, 
		{
			scope: {
      			slangDict: slangDict
    		},
			out: {
				replace: 'tweets_without_slang'
			}, 
    		finalize: finalize
		}
	);

### 2d.
We converted the subjectivity lexicon into a json file (subj.json) and imported it into the database.
		
### 2e./2f
For the Emoticon sentiment values we created a json file with a list of smileys (emoticons.json) which we have found on [wikipedia]() and loaded it into the database.
Additionally, we added a link to a smiley icon, which we will display in the following exercise.

	var subjectivityLexicon = {};
	db.subj.find().forEach(function(element){
	  if(element.priorpolarity == "positive"){
	  	subjectivityLexicon[element.word1] = 1;
	  }else if(element.priorpolarity == "negative"){	  	
	  	subjectivityLexicon[element.word1] = -1;
	  }
	});
	
	var emoticons = {};
	db.emoticons.find().forEach(function(element){
	  if(element.priorpolarity == "positive"){
	  	emoticons[element.emoticon] = 1;
	  }else if(element.priorpolarity == "negative"){	  	
	  	emoticons[element.emoticon] = -1;
	  }
	});	
	
	function calculateSentiment(text){
		text = text.toLowerCase();
		var sentiment = 0;
	
		for(var subject in subjectivityLexicon){
		    regex = subject.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
			if(text.search(regex)>=0){
				sentiment+=subjectivityLexicon[subject];
				text.replace(regex,"");
			}
		}
		
		for(var emoticon in emoticons){	
			regex = emoticon.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");					
			if(text.search(regex)>=0){
				sentiment+=emoticons[emoticon];
				text.replace(regex,"");
			}
		}
		
		return sentiment;
	}
	
	function calculateEmoticon(sentimentValue){
		var emoticon = "";
		if(sentimentValue==0){
			emoticon = "https://dl.dropboxusercontent.com/u/9917288/emoticons/neutral.png";	  				
		}else if(sentimentValue<0 && sentimentValue>-3){
			emoticon = "https://dl.dropboxusercontent.com/u/9917288/emoticons/bad1.png";
		}else if(sentimentValue<=-3 && sentimentValue>=-5){
			emoticon = "https://dl.dropboxusercontent.com/u/9917288/emoticons/bad2.png";
		}else if(sentimentValue<-5){
			emoticon = "https://dl.dropboxusercontent.com/u/9917288/emoticons/bad3.png";
		}else if(sentimentValue>0 && sentimentValue<3){
			emoticon = "https://dl.dropboxusercontent.com/u/9917288/emoticons/happy1.png";
		}else if(sentimentValue>=3 && sentimentValue<=5){
			emoticon = "https://dl.dropboxusercontent.com/u/9917288/emoticons/happy2.png";
		}else if(sentimentValue>5){
			emoticon = "https://dl.dropboxusercontent.com/u/9917288/emoticons/happy3.png";
		}
		return emoticon;
	}	
		
	db.tweets_without_slang.find().forEach(function(element){
		var text = element.value.text;
		var sentimentValue = calculateSentiment(text);			
		var emoticon = calculateEmoticon(sentimentValue);
		var sentiment = {"value":sentimentValue,"emoticon":emoticon};			
		db.tweets_without_slang.update({_id:element._id}, {$set: {sentiment: sentiment}});
	});
	
##3. Visualisation (Exercise 3)

We tried two different kinds of visualisations.
The code can be found in routes/index.js, views/index.jade, public/javascripts/map.js and public/javascripts/chart.js.
To access mongoDB from node.js we used [mongoskin](https://github.com/kissjs/node-mongoskin).

The first one is a map, which shows emoticons on the place, where a tweet is tweeted. If you click on an emoticon, there appears a popup with the user and the text of the tweet.
This visualisation uses [leaflet.js](http://leafletjs.com/).
* [Screenshot](https://dl.dropboxusercontent.com/u/9917288/emoticons/vis1.jpg)

The second visualisation shows a barchart with the distributions of happyness among the different longitudes. The chart is displayed with the help of [d3.js](http://d3js.org/).
* [Screenshot](https://dl.dropboxusercontent.com/u/9917288/emoticons/vis2.jpg)

Additionally, a list of all tweets with the emoticon from the map is displayed.


##4. Installation of the app

* Install node.js + npm
* Install mongoDB
* start mongo db with dbpath from the mongoBD folder
	mongod --dbpath <data directory path>
* call the following commands from the node command line from the app folder to install dependencies and run the app
	npm install
	node app.js


##5. Contributors

* [Elisabeth Lang](https://github.com/laneli)
* [Katrin Hewer](https://github.com/oveja87)
