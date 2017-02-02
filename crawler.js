var request = require('request');
var cheerio = require('cheerio');
var urlParse= require('url-parse');
var fileSystem = require('fs-extra');

var urls = [], visited = [];
var root = new node();
var consMaxDepth = 4;// max depth of tree
var fileWriter, filename;


function init() {
  root.url = process.argv[2];
  if(process.argv.length > 4) consMaxDepth = process.argv[4];
  root.depth=1;
  filename = process.argv[3];
  if(!fileSystem.existsSync(filename)){
    fileSystem.createFileSync(filename);
  } 
  fileWriter = fileSystem.createWriteStream(filename);
  requests(root);
}

//create the node
function node() { 
  this.url= null;
  this.childrn= [];
  this.depth= null;
}

/*
links types
a, link => href
img, script => src
*/
var selectors = [ ['a', 'href'], ['link','href'], ['img', 'src'], ['script', 'src'] ];

function getAllPageLinksForTag($, tagName, attribute, currentNode){
  $(tagName).each(function() {
    if(typeof $(this).attr(attribute) != "undefined" && $(this).attr(attribute).indexOf("http") == 0){
      currentNode.childrn.push($(this).attr(attribute));
    } else if(typeof $(this).attr(attribute) != "undefined" && !($(this).attr(attribute).indexOf("#") == 0)){
      currentNode.url[currentNode.url.length - 1] != '/'? currentNode.childrn.push(currentNode.url + '/' + $(this).attr(attribute)): currentNode.childrn.push(currentNode.url + $(this).attr(attribute));
    }
  });
}


function traverse(currentNode) {
  console.log ((currentNode.depth >= consMaxDepth) + " : " + visited[currentNode.url] + " : " + currentNode.url);
  if(currentNode.depth >= consMaxDepth || visited[currentNode.url]) return;
    visited[currentNode.url] = true;
  for(var i = 0 ; i< currentNode.childrn.length ; ++i){
    if(visited[currentNode.childrn[i]] == true) continue;
    var childNode = new node();
    childNode.url = currentNode.childrn[i];
    childNode.depth= currentNode.depth+1;
    requests(childNode);
  }
}

function requests(currentNode){
  request(currentNode.url, function(error, response, body) {
   if(error) {
     console.log("Error: " + error + " : " + currentNode.url);
   } else {      
     if(response.statusCode == 200) {
        var $ = cheerio.load(body);

        fileWriter.write("statusCode: 200 Ok.\t : \t" +currentNode.url + "\n");
        selectors.forEach(function each(selector){
          getAllPageLinksForTag($, selector[0], selector[1], currentNode);
        })

        traverse(currentNode)
     } else if (response.statusCode == 201) {
        fileWriter.write("statusCode: 201 Created.\t : \t" + currentNode.url + "\n");
     } else if (response.statusCode == 301) {
        fileWriter.write("statusCode: 301 Moved Permanently.\t : \t" + currentNode.url + "\n");
     } else if (response.statusCode == 302) {
        fileWriter.write("statusCode: 302 Found.\t : \t" + currentNode.url + "\n");
     } else if (response.statusCode == 304) {
        fileWriter.write("statusCode: 304 Not Modified.\t : \t" + currentNode.url + "\n");
     } else if (response.statusCode == 400) {
        fileWriter.write("statusCode: 400 Bad Request.\t : \t" + currentNode.url + "\n");
     } else if (response.statusCode == 401) {
        fileWriter.write("statusCode: 401 Unauthorized.\t : \t" + currentNode.url + "\n");
     } else if (response.statusCode == 403) {
        fileWriter.write("statusCode: 403 Forbidden.\t : \t" + currentNode.url + "\n");
     } else if (response.statusCode == 404) {
        fileWriter.write("statusCode: 404 Not Found.\t : \t" + currentNode.url + "\n");
     } else if (response.statusCode == 405) {
        fileWriter.write("statusCode: 405 Method Not Allowed.\t : \t" + currentNode.url + "\n");
     } else if (response.statusCode == 413) {
        fileWriter.write("statusCode: 413 Request Entity Too Large.\t : \t" + currentNode.url + "\n");
     } else if (response.statusCode == 414) {
        fileWriter.write("statusCode: 414 Request URL Too Long.\t : \t" + currentNode.url + "\n");
     } else if (response.statusCode == 500) {
        fileWriter.write("statusCode: 500 Internal Server Error.\t : \t" + currentNode.url + "\n");
     } else if (response.statusCode == 503) {
        fileWriter.write("statusCode: 503 Service Unavailable.\t : \t" + currentNode.url + "\n");
     }
   }
  });
}

// main
init();