var request = require('request');
var cheerio = require('cheerio');
var urlParse= require('url-parse');

var path, authenticationInfo;
var absLinks = [], relLinks = [];


function requiredInformation() {
	path = process.argv[2];
}

/*
links types
a, link => href
img, script => src
*/

function getAbsLinks($){
	$("a[href^='http']").each(function() {
    	absLinks.push($(this).attr('href'));
  	});
  	$("link[href^='http']").each(function() {
    	absLinks.push($(this).attr('href'));
  	});
	$("img[src^='http']").each(function() {
    	absLinks.push($(this).attr('src'));
  	});
	$("script[src^='http']").each(function() {
    	absLinks.push($(this).attr('src'));
  	});
}

function getRelLinks($){
	$("a[href^='/']").each(function() {
    	relLinks.push($(this).attr('href'));
  	});
  	$("link[href^='/']").each(function() {
    	relLinks.push($(this).attr('href'));
  	});
	$("img[src^='/']").each(function() {
    	relLinks.push($(this).attr('src'));
  	});
	$("script[src^='/']").each(function() {
    	relLinks.push($(this).attr('src'));
  	});
}

function getAllLinks($){
	getAbsLinks($);
	getRelLinks($);
}





// main 
requiredInformation();

request(path, function(error, response, body) {
   if(error) {
     console.log("Error: " + error);
   }
   console.log("Status code: " + response.statusCode);
   
   if(response.statusCode === 200) {
	    var $ = cheerio.load(body);
	    console.log("Page title:  " + $('title'));
	    getAllLinks($);
		console.log(absLinks);
		console.log(relLinks);
   }
});






