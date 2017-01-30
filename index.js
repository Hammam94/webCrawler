var request = require('request');
var cheerio = require('cheerio');
var urlParse= require('url-parse');

var urls = [], visited = [];
var root = new node();
var consMaxDepth = 2;// max depth of tree
 

//init the root of the tree
function init() {
  root.url = process.argv[2];
  root.depth=1;
}

//create the node
function node() { 
  this.url= null;
  this.childrn= null;
  this.depth= null;
}

/*
links types
a, link => href
img, script => src
*/
var selectors = [ ['a', 'href'], ['link','href'], ['img', 'src'], ['script', 'src'] ];

function getAllPageLinksForTag($, tagName, attribute, path){
  $(tagName).each(function() {
    if(typeof $(this).attr(attribute) != "undefined" && $(this).attr(attribute).indexOf("http") == 0){
      urls.push($(this).attr(attribute));
    } else if(typeof $(this).attr(attribute) != "undefined" && !($(this).attr(attribute).indexOf("#") == 0)){
      if(path[path.length - 1] != '/'){
        urls.push(path + '/' + $(this).attr(attribute));
      }else{
        urls.push(path + $(this).attr(attribute));
      }
    }
  });
}


function traverse(currentNode) {
  if(currentNode.depth >= consMaxDepth || visited[currentNode.url]) return;

  for(var i = 0 ; i< currentNode.childrn.length ; ++i){
    if(visited[currentNode.childrn[i]]) continue;
    var childNode = new node();
    childNode.url = currentNode.childrn[i];
    childNode.depth= currentNode.depth+1;
    visited[childNode.url] = true;
    console.log(childNode.url);
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

       selectors.forEach(function each(selector){
          getAllPageLinksForTag($, selector[0], selector[1], currentNode.url);
        })

        currentNode.childrn = urls;
        traverse(currentNode)
     }
   }
  });
}

// main
init();
requests(root);