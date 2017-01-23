var request = require('request');
var cheerio = require('cheerio');
var urlParse= require('url-parse');

var path = process.argv[process.argv.length - 1]

request(path, function(error, response, body) {
   if(error) {
     console.log("Error: " + error);
   }
   console.log("Status code: " + response.statusCode);
   
   if(response.statusCode === 200) {
     var $ = cheerio.load(body);
     console.log("Page title:  " + $('title').text());
     //getLinks($);
   }
});