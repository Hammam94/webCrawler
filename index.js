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
    console.log("not created");
  } 
  fileWriter = fileSystem.createWriteStream(filename);
  requests(root);
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
      path[path.length - 1] != '/'? urls.push(path + '/' + $(this).attr(attribute)): urls.push(path + $(this).attr(attribute));
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
    var u = childNode.url + "\n";
    fileWriter.write(u);
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