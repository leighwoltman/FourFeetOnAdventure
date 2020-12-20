const fs = require('fs')
const path = require('path');
const sizeOf = require('image-size');
const moment = require('moment');
const sharp = require('sharp');


// read the common-header and common footer
var commonHeaderHtml = fs.readFileSync(path.join(__dirname,'source','common-header.html'), 'utf8');
var commonFooterHtml = fs.readFileSync(path.join(__dirname,'source','common-footer.html'), 'utf8');

// create the about page
var aboutContentHtml = fs.readFileSync(path.join(__dirname,'source','about.html'), 'utf8');

// combine these together
var completeAbout = commonHeaderHtml + aboutContentHtml + commonFooterHtml;
fs.writeFileSync(path.join(__dirname,"docs","about.html"), completeAbout, 'utf8');

// read the posts
function getDirectories (srcpath) {
  return fs.readdirSync(srcpath)
    .filter(file => fs.statSync(path.join(srcpath, file)).isDirectory())
}

function getFileByExtension (srcpath, extension) {
    var retval = null;

    var files = fs.readdirSync(srcpath);

    files.forEach(function(value) {
        if(value.endsWith(extension))
        {
            retval = path.join(srcpath, value);
        }
    });

    return retval;
}

function convertAndCopyImage(imagePathRelativeToPost, postUrl, postPath) {
  if(imagePathRelativeToPost == "/" ) {
    imagePathRelativeToPost = imagePathRelativeToPost.substr(1);
  }
  let sourcePath = path.join(postPath, imagePathRelativeToPost);
  let outputPath = path.join(__dirname,"docs","img",postUrl,imagePathRelativeToPost);
  // first check to see if we are in an outdated post where the images are not in the post directory
  let oldPath = path.join(__dirname,"docs",imagePathRelativeToPost);
  if(fs.existsSync(oldPath)) {
    fs.mkdirSync(path.dirname(sourcePath), { recursive: true });
    fs.copyFileSync(oldPath, sourcePath);
    fs.unlinkSync(oldPath);
  }
  // copy this file to the output directory
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.copyFileSync(sourcePath, outputPath);
  let imagePathAfterCopy = "img/" + postUrl + "/" + imagePathRelativeToPost;
  return imagePathAfterCopy;
}

var directories = getDirectories(path.join(__dirname, "posts"));

directories.forEach(function(value, index, theArray) {
  theArray[index] = path.join(__dirname,"posts", value);
});

var output = [];
var pictures = [];

directories.forEach(function(value, index) {
    var jsonFile = getFileByExtension(value, ".json");
    var htmlFile = getFileByExtension(value, ".html");
    
    if(jsonFile != null && htmlFile != null)
    {
        var obj = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
        var html = fs.readFileSync(htmlFile, 'utf8');  
        obj.Content = html;
        // push the path to this directory
        obj.Path = value;
        output.push(obj);
    }
});

// now sort the array based upon file timestamps
output.sort(function(a, b){
    var keyA = a.Timestamp,
        keyB = b.Timestamp;
    // Compare the 2 dates
    if(keyA < keyB) return 1;
    if(keyA > keyB) return -1;
    return 0;
});

// go through each blog
for(let i = 0; i < output.length; i++) {
    // make the URL lowercase
    output[i].URL = output[i].URL.toLowerCase();
    // look through the html for movies, copy their paths
    let revideo = /<source[^\<]*src=[\"|']([a-zA-Z0-9_\/\.]{1,25})+[\"|'][^\<]*>/mg
    while ((match = revideo.exec(output[i].Content)) != null) {
      let localPathToImage = match[1];
      let afterCopyPathToImage = convertAndCopyImage(localPathToImage, output[i].URL, output[i].Path);
      output[i].Content = output[i].Content.replace(localPathToImage, afterCopyPathToImage);
    }
    // look through the html for pictures
    let blogPics = [];
    let re1 = /<img[^\<]*src=[\"|']([a-zA-Z0-9_\-\/\.]{1,25})+[\"|'][^\<]*>/mg
    while ((match = re1.exec(output[i].Content)) != null) {
        // convert and copy 
        let localPathToImage = match[1];
        let afterCopyPathToImage = convertAndCopyImage(localPathToImage, output[i].URL, output[i].Path);
        output[i].Content = output[i].Content.replace(localPathToImage, afterCopyPathToImage);
        blogPics.push(afterCopyPathToImage);
    }
    output[i].Pictures = [];

    let popped = blogPics.pop();
    while(popped) {
        pictures.push(popped);
        output[i].Pictures.push(popped);
        popped = blogPics.pop();
    }
}

let sized = []

for(let i = 0; i < pictures.length; i++) {
    let img = pictures[i];
    let obj = {};
    try {
        var dimensions = sizeOf(path.join(__dirname,'docs',img));
        obj.src = img;
        obj.h = dimensions.height;
        obj.w = dimensions.width;
        sized.push(obj);
    }
    catch(e) {
        console.log("Couldn't find: " + img);
    }
}

let posts = output;
let gallery = sized;

var postTemplateHtml = fs.readFileSync(path.join(__dirname,'source','post.html'), 'utf8');

// we want to output a page for each blog entry
for(let i = 0; i < posts.length; i++) {
  let post = posts[i];
    // a post consists of 
    //   {
    //     "Title": "Bozeman to Cedar City",
    //     "Timestamp": 1476662400,
    //     "URL": "update_1",
    //     "BannerImage": "/img/DSC00067_1100.jpg",
    //     "SquareImage": "/img/DSC00221_350.jpg",
    //     "Content": ..html...
    //     "Path": .. original path ...
    //   }

    let outputPost = commonHeaderHtml;

    let modifiedPostTemplate = postTemplateHtml;

    modifiedPostTemplate = modifiedPostTemplate.replace("<!--title-->", post.Title);

    if(post.hasOwnProperty('BannerImage')) {
      // we may need to strip off the starting slash
      if(post.BannerImage[0] == "/" ) {
        post.BannerImage = post.BannerImage.substr(1);
      }
      let afterCopyPathToImage = convertAndCopyImage(post.BannerImage, post.URL, post.Path);
      post.BannerImage = afterCopyPathToImage;
    } else {
      if(post.Pictures.length > 0) {
        // otherwise take the last image in the pictures array
        post.BannerImage = post.Pictures[post.Pictures.length - 1];
      } else {
        throw new Exception("Must be at least one picture for a banner image");
      }
    }

    // if there isn't a URL field, create one
    if(!post.hasOwnProperty("URL")) {
      let URL = "";
      URL += post.Title;
      URL = URL.toLowerCase();
      URL = URL.replace(" ", "_");

      post.URL = URL;
    }

    modifiedPostTemplate = modifiedPostTemplate.replace("<!--bannerImage-->", post.BannerImage);
    modifiedPostTemplate = modifiedPostTemplate.replace("<!--author-->", "FourFeetOnAdventure");
    modifiedPostTemplate = modifiedPostTemplate.replace("<!--content-->", post.Content);
    modifiedPostTemplate = modifiedPostTemplate.replace("<!--day-->", moment(post.Timestamp * 1000).utc().format("D"));
    modifiedPostTemplate = modifiedPostTemplate.replace("<!--month-->", moment(post.Timestamp * 1000).utc().format("MMM"));
    modifiedPostTemplate = modifiedPostTemplate.replace("<!--year-->", moment(post.Timestamp * 1000).utc().format("YYYY"));

    // need to make the dates work

    // and output this file
    outputPost += modifiedPostTemplate;
    outputPost += commonFooterHtml;

    fs.writeFileSync(path.join(__dirname,"docs", post.URL + ".html"), outputPost, 'utf8');
}

// now create the index page
var indexContentA = fs.readFileSync(path.join(__dirname,'source','index_partA.html'), 'utf8');
var indexContentB = fs.readFileSync(path.join(__dirname,'source','index_partB.html'), 'utf8');

var indexContent = indexContentA;
indexContent = indexContent.replace("<!--image0-->", gallery[0].src);
indexContent = indexContent.replace("<!--image1-->", gallery[1].src);
indexContent = indexContent.replace("<!--image2-->", gallery[2].src);
indexContent = indexContent.replace("<!--image3-->", gallery[3].src);
indexContent = indexContent.replace("<!--image4-->", gallery[4].src);
indexContent = indexContent.replace("<!--image5-->", gallery[5].src);
indexContent = indexContent.replace("<!--imageCount-->", gallery.length);

let postContent = "";

for(let i = 0; i < posts.length; i++) {
  let post = posts[i];

  if(post.hasOwnProperty('SquareImage')) {
    // if the URL starts with a leading slash remove it
    if(post.SquareImage[0] == "/" ) {
      post.SquareImage = post.SquareImage.substr(1);
    }
    let afterCopyPathToImage = convertAndCopyImage(post.SquareImage, post.URL, post.Path);
    post.SquareImage = afterCopyPathToImage;
  } else {
    // we need to make our own square image
    if(post.Pictures.length > 0) {
      post.SquareImage = post.Pictures[0];
    } else {
      throw new Error("No square image found and no picutres available: " + post.Title);
    }
  }

  // now, let's see if the image name already ends in 350, otherwise we will
  // create a picture of the right size
  
  let locationOfSlash = post.SquareImage.indexOf("/") + 1;
  let locationOfExtension = post.SquareImage.indexOf(".", locationOfSlash);

  let fileNamePortion = post.SquareImage.substr(locationOfSlash, locationOfExtension - locationOfSlash);

  if(!fileNamePortion.endsWith("_350")){
    // then we want to create it
    // open this image
    let fullImage = path.join("docs", post.SquareImage);
    let newRelativeFilePath = post.SquareImage.replace(fileNamePortion, fileNamePortion + "_350");
    let smallSquareImage = path.join("docs", newRelativeFilePath);
    if(fs.existsSync(fullImage)) {
      sharp(fullImage)
        .resize(350, 350)
        .toFile(smallSquareImage, (err, info) => {
          if(err) {
            console.log("Sharp Resize Error: " + err);
          }
        });
      post.SquareImage = newRelativeFilePath;
    } else {
      throw new Error("Square image does not exist");
    }
  }

  postContent += "  <div class='col-md-4 col-sm-6 col-xs-12'>\n";
  postContent += "    <div class='portfolio-container'>\n";
  postContent += "      <div class='portfolio-image'>\n";
  postContent += "        <img src='" + post.SquareImage + "' class='img-responsive'/>\n";
  postContent += "        <div class='portfolio-content'>\n";
  postContent += "          <div class='portfolio-title'>\n";
  postContent += "            <div class='blog-post-date'>\n";
  postContent += "              <span>" + moment(post.Timestamp * 1000).utc().format("D") + "</span>\n";
  postContent += "              <span>" + moment(post.Timestamp * 1000).utc().format("MMM") + "</span>\n";
  postContent += "              <span>" + moment(post.Timestamp * 1000).utc().format("YYYY") + "</span>\n";
  postContent += "            </div>\n";
  postContent += "          </div>\n";
  postContent += "          <h2><a href='" + post.URL + "'>" + post.Title + "</a></h2>\n";
  postContent += "        </div>\n";
  postContent += "      </div>\n";
  postContent += "    </div>\n";
  postContent += "  </div>\n";
}

indexContentB = indexContentB.replace("<!--jsonPics-->", JSON.stringify(gallery));

indexContent = commonHeaderHtml + indexContent + postContent + indexContentB + commonFooterHtml;

fs.writeFileSync(path.join(__dirname, "docs", "index.html"), indexContent, 'utf8');

console.log("Build Complete");
