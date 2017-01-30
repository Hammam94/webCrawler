var request = require('request');
var cheerio = require('cheerio');
var urlParse= require('url-parse');

var path, authenticationInfo;
var urls = [];
var visted = [];
var root = new node();
var consMaxDepth = 2;// max depth of tree
 

        
      

function requiredInformation() {
  path = process.argv[2];
  root.url = path;
console.log('check this');
  console.log(root.url);
  root.depth=1;
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

function node() {//create the node 
  this.url= null;
  this.childrn= null;
  this.depth= null;
}

function traverse(currentNode) {
if(currentNode.depth >= consMaxDepth){
  return;
}
if(currentNode.url.indexOf(root.url)!=0){
  return;
}
if(isVisited(currentNode.url)){
   return;
  }
visted[currentNode.url] = true;
for(var i = 0 ; i< currentNode.childrn.length ; ++i){
    var childNode = new node();
    childNode.url = currentNode.childrn[i];
    childNode.depth= currentNode.depth+1;
    //visted[childNode.url]=true;
    requests(childNode);
    }

}


function isVisited(path){
  return visted[path];
}

function requests(currentNode){
  request(currentNode.url, function(error, response, body) {
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
        currentNode.childrn = urls;
        console.log(currentNode.url);
        traverse(currentNode)

  
       //console.log(root);

       //console.log("\nabsolute Links");
       //console.log(urls);
     }
   }
});
}
// main
requiredInformation();
requests(root);













