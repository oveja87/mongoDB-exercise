
/*
 * GET home page.
 */


exports.index = function(req, res){
	
	//read subjectivity lexicon
	/*
	var fs = require('fs');
	var file = "";
	
	var sentiments = [];
	var tweetCollection = [];
	var emoticonsCountCollection = [];
	
	fs.readFile('subj.txt', 'utf8', function (err,data) {
	  if (err) {
	    return console.log(err);
	  }
	  sentiments = data.split("\n");
	  for(i=0; i<sentiments.length; i++){
	  	var array=sentiments[i].split(" ");
	  	var word = array[2].split("=")[1];
	  	var sentiment = 0;  	
	  	if(array[5].search("positive")>=0){
	  		sentiment = 1;
	  	}else if(array[5].search("negative")>=0){
	  		sentiment = -1;
	  	}
		 	sentiments[i]=[word,sentiment];
	  }	  
	  readTweets();
	});
	*/	
	
	// mongo
	var mongo = require('mongoskin');	
	var db = mongo.db('mongodb://localhost:27017/local'); 
	
	function readTweets(){
	  var tweets = db.collection('tweets_without_slang');	   	
	  tweets.find().toArray(function (e, docs) {	
	  	for(i=0; i<docs.length; i++){
	  		if(docs[i].sentiment==undefined){
	  			//sentiment value
	  			var sentimentValue = calculateSentiment(docs[i].value.text);	  			
	  			//emoticon
	  			var emoticon = calculateEmoticon(sentimentValue);	  			
	  			//add sentiment to collection
	  			var sentiment = {	"sentiment":sentimentValue, "emoticon":emoticon};
	  			docs[i].sentiment = sentiment;
	  			tweets.update({_id:docs[i]._id}, {$set: {sentiment: sentiment}});		
	  		}
	  	};	  	
	  	tweetCollection = docs;	  	
	  	//count emoticons by mapreduce
	  	countEmoticons(tweets, render);	  
	  }); 
	}	 
	/*
	function calculateSentiment(text){	
		text = text.toLowerCase();
		var sentiment = 0;
		for(j=0; j<sentiments.length; j++){		
			if(text.search(sentiments[j][0])>=0){
				sentiment+=sentiments[j][1];
			}	
		}		
		return sentiment;
	} 
	*/
	function calculateSentiment(text){	
	  var tweets = db.collection('tweets_without_slang');	   	
	  tweets.find().toArray(function (e, docs) {
		text = text.toLowerCase();
		var sentiment = 0;
		for(j=0; j<sentiments.length; j++){		
			if(text.search(sentiments[j][0])>=0){
				sentiment+=sentiments[j][1];
			}	
		}		
		return sentiment;
	}
	
	function calculateEmoticons(sentimentValue){
		var emoticon = "";
		if(sentimentValue==0){
			emoticon = "https://dl.dropboxusercontent.com/u/9917288/emoticons/neutral.jpg";	  				
		}else if(sentimentValue<0 && sentimentValue>-3){
			emoticon = "https://dl.dropboxusercontent.com/u/9917288/emoticons/bad1.jpg";
		}else if(sentimentValue<=-3 && sentimentValue>=-5){
			emoticon = "https://dl.dropboxusercontent.com/u/9917288/emoticons/bad2.jpg";
		}else if(sentimentValue<-5){
			emoticon = "https://dl.dropboxusercontent.com/u/9917288/emoticons/bad3.jpg";
		}else if(sentimentValue>0 && sentimentValue<3){
			emoticon = "https://dl.dropboxusercontent.com/u/9917288/emoticons/happy1.jpg";
		}else if(sentimentValue>=3 && sentimentValue<=5){
			emoticon = "https://dl.dropboxusercontent.com/u/9917288/emoticons/happy2.jpg";
		}else if(sentimentValue>5){
			emoticon = "https://dl.dropboxusercontent.com/u/9917288/emoticons/happy3.jpg";
		}
		return emoticon;
	}
	
	function countEmoticons(tweets, callback){
		var map = function() {  
		  emit(this.sentiment.emoticon, {count: 1});
		}
		
		var reduce = function(key, values){
		  var count = 0;
		  values.forEach(function(v) {
		    count += v.count;
		  });
		  return {count:count};
		}	
		
		tweets.mapReduce(map, reduce, {out: {replace: 'emoticon_count'}}, function(e, c) { 
			if(c!=undefined){
				c.find().toArray(function (e, docs) {
			    console.log(docs); 
			    emoticonsCountCollection = docs;
			    render();         
			  })				
			}    
		});
	}
 
 function render(){
 	console.log("RENDER");
 	res.render('index', {tweets:tweetCollection, emoticonCount:emoticonsCountCollection, title:'Tweets'});
 }
};

/*
exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};
*/
