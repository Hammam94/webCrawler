var request = require('request');
var cheerio = require('cheerio');
var urlParse= require('url-parse');

var path, authenticationInfo;
var urls = [];

function requiredInformation() {
  path = process.argv[2];
}

/*
links types
a, link => href
img, script => src
*/
var selectors = [ ['a', 'href'], ['link','href'], ['img', 'src'], ['script', 'src'] ];

function getAllLinksForTag($, tagName, attribute){
  $(tagName).each(function() {
    if(typeof $(this).attr(attribute) != "undefined" && $(this).attr(attribute).indexOf("http") == 0){
      urls.push($(this).attr(attribute));
    } else if(typeof $(this).attr(attribute) != "undefined" && !($(this).attr(attribute).indexOf("#") == 0)){
      if(path[path.length - 1] != "/"){
        urls.push(path + "/" + $(this).attr(attribute));
      }else{
        urls.push(path + $(this).attr(attribute));
      }
    }
  });
}

function node() {                     //create the node 
  this.url= null;
  this.childrn= null;
}

// main
requiredInformation();

request(path, function(error, response, body) {
   if(error) {
     console.log("Error: " + error);
   }
   else{ 
     console.log("Status code: " + response.statusCode);
     
     if(response.statusCode === 200) {
  	    var $ = cheerio.load(body);

       selectors.forEach(function each(selector){
          getAllLinksForTag($, selector[0], selector[1]);
        })
       var root = new node;
       root.url = path;
       root.childrn = urls;

       console.log(root.childrn[0]);
       console.log(root.childrn[1]);


       //console.log(root);

  	    //console.log("\nabsolute Links");
    		//console.log(urls);
     }
   }
});









