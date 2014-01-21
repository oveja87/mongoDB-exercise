
/*
 * GET home page.
 */

exports.index = function(req, res){
	
	// mongo
	var mongo = require('mongoskin');	
	var db = mongo.db('mongodb://localhost:27017/local');
	var tweets = db.collection('tweets_without_slang');	   	
	tweets.find().toArray(function (e, docs) {
 	  res.render('index', {tweets:docs, title:'Tweets'});		  
	}); 
		
};
