const fs = require('fs')
const path = require('path');
const sizeOf = require('image-size');
const { DateTime } = require("luxon");
const sharp = require('sharp');
const striptags = require('striptags');


// read the common-header and common footer
var commonHeaderHtml = fs.readFileSync(path.join(__dirname,'source','common-header.html'), 'utf8');
var commonFooterHtml = fs.readFileSync(path.join(__dirname,'source','common-footer.html'), 'utf8');

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
  let imagePathAfterCopy = `img/${postUrl}/${imagePathRelativeToPost}`;
  return imagePathAfterCopy;
}

function wordToUrl(word) {
  const regex = /[^a-z0-9]+/gm;
  const subst = `_`;
  // The substituted value will be contained in the result variable
  return word.toLowerCase().replace(regex, subst);
}

function generatePostListingForSection(sectionName, posts) {
  let postContent = "";

  for(let post of posts) {
    if(post.Sections.includes(sectionName)) {
      postContent += `  <div class='col-md-4 col-sm-6 col-xs-12'>\n`;
      postContent += `    <div class='portfolio-container'>\n`;
      postContent += `      <div class='portfolio-image'>\n`;
      postContent += `        <img src='${post.SquareImage}' class='img-responsive'/>\n`;
      postContent += `        <div class='portfolio-content'>\n`;
      postContent += `          <div class='portfolio-title'>\n`;
      postContent += `            <div class='blog-post-date'>\n`;
      postContent += `              <span>${DateTime.fromSeconds(post.Timestamp).toFormat('d')}</span>\n`;
      postContent += `              <span>${DateTime.fromSeconds(post.Timestamp).toFormat('LLL')}</span>\n`;
      postContent += `              <span>${DateTime.fromSeconds(post.Timestamp).toFormat('yyyy')}</span>\n`;
      postContent += `            </div>\n`;
      postContent += `          </div>\n`;
      postContent += `          <h2><a href='${post.URL}'>${post.Title}</a></h2>\n`;
      postContent += `        </div>\n`;
      postContent += `      </div>\n`;
      postContent += `    </div>\n`;
      postContent += `  </div>\n`;
    }
  }

  return postContent;
}

function createListingPage(sectionName, title, filename, posts, gallery) {
  var indexContentA = fs.readFileSync(path.join(__dirname,'source','index_partA.html'), 'utf8');
  var indexContentB = fs.readFileSync(path.join(__dirname,'source','index_partB.html'), 'utf8');

  var indexContent = indexContentA;
  if(gallery) {
    indexContent = indexContent.replace("<!--image0-->", gallery[0].src);
    indexContent = indexContent.replace("<!--image1-->", gallery[1].src);
    indexContent = indexContent.replace("<!--image2-->", gallery[2].src);
    indexContent = indexContent.replace("<!--image3-->", gallery[3].src);
    indexContent = indexContent.replace("<!--image4-->", gallery[4].src);
    indexContent = indexContent.replace("<!--image5-->", gallery[5].src);
    indexContent = indexContent.replace("<!--imageCount-->", gallery.length);
    indexContentB = indexContentB.replace("<!--jsonPics-->", JSON.stringify(gallery));
  } else {
    // remove the gallery from <!-- begin:slider --> to <!-- end:slider -->
    let indexOfEndOfGallery = indexContent.indexOf("<!-- end:slider -->");
    indexOfEndOfGallery += 20;
    indexContent = indexContent.substring(indexOfEndOfGallery);
    indexContentB = indexContentB.replace("<!--jsonPics-->", '[]');
  }

  let mainContent = generatePostListingForSection(sectionName, posts);

  indexContent = indexContent.replace("<!--heading-->", title)

  indexContent = commonHeaderHtml + indexContent + mainContent + indexContentB + commonFooterHtml;

  fs.writeFileSync(path.join(__dirname, "docs", `${filename}.html`), indexContent, 'utf8');
}

var directories = getDirectories(path.join(__dirname, "posts"));

directories.forEach(function(value, index, theArray) {
  theArray[index] = path.join(__dirname,"posts", value);
});

var posts = [];

directories.forEach((value) => {
    var jsonFile = getFileByExtension(value, ".json");
    var htmlFile = getFileByExtension(value, ".html");
    
    if(jsonFile != null && htmlFile != null)
    {
        var obj = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
        var html = fs.readFileSync(htmlFile, 'utf8');  
        obj.Content = html;
        // push the path to this directory
        obj.Path = value;
        posts.push(obj);
    }
});

// now sort the array based upon file timestamps
posts.sort(function(a, b){
    var keyA = a.Timestamp,
        keyB = b.Timestamp;
    // Compare the 2 dates
    if(keyA < keyB) return 1;
    if(keyA > keyB) return -1;
    return 0;
});

let uniqueSections = ['Main'];

// go through each blog
for(let post of posts) {
    // check for any sections identified, if none is found, default to 'Main'
    if(!post.hasOwnProperty('Sections') || !Array.isArray(post.Sections)) {
      post.Sections = ['Main'];
    }
    
    for(let section of post.Sections) {
      if(!uniqueSections.includes(section)) {
        uniqueSections.push(section);
      }
    }

    // make the URL lowercase
    post.URL = post.URL.toLowerCase();
    // look through the html for movies, copy their paths
    let revideo = /<source[^\<]*src=[\"|']([a-zA-Z0-9_\-\/\.]{1,25})+[\"|'][^\<]*>/mg
    while ((match = revideo.exec(post.Content)) != null) {
      let localPathToImage = match[1];
      let afterCopyPathToImage = convertAndCopyImage(localPathToImage, post.URL, post.Path);
      post.Content = post.Content.replace(localPathToImage, afterCopyPathToImage);
    }
    // look through the html for pictures
    let blogPics = [];
    let re1 = /<img[^\<]*src=[\"|']([a-zA-Z0-9_\-\/\.]{1,25})+[\"|'][^\<]*>/mg
    while ((match = re1.exec(post.Content)) != null) {
        // convert and copy 
        let localPathToImage = match[1];
        let afterCopyPathToImage = convertAndCopyImage(localPathToImage, post.URL, post.Path);
        post.Content = post.Content.replace(localPathToImage, afterCopyPathToImage);
        blogPics.push(afterCopyPathToImage);
    }
    post.Pictures = [];

    let popped = blogPics.pop();
    while(popped) {
        post.Pictures.push(popped);
        popped = blogPics.pop();
    }

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
        throw new Error(`No square image found and no picutres available: ${post.Title}`);
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
      let newRelativeFilePath = post.SquareImage.replace(fileNamePortion, `${fileNamePortion}_350`);
      let smallSquareImage = path.join("docs", newRelativeFilePath);
      if(fs.existsSync(fullImage)) {
        // see if _350 image has already been created, if so, don't need to do it again
        if(!fs.existsSync(smallSquareImage) || fs.statSync(smallSquareImage).size < 5) {
          sharp(fullImage)
            .resize(350, 350)
            .toFile(smallSquareImage, (err, info) => {
              if(err) {
                console.log(`Sharp Resize Error: ${err}`);
              }
            });
        }
        post.SquareImage = newRelativeFilePath;
      } else {
        throw new Error("Square image does not exist");
      }
    }

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
      URL = wordToUrl(URL);
      post.URL = URL;
    }
}

// process the unique sections and turn them into links within the content header
let headerDropDownContent = "";
for(let section of uniqueSections) {
  // main is always present so we skip it
  if(section != 'Main') {
    // convert word to URL
    let sectionUrl = wordToUrl(section);
    headerDropDownContent += `<li role="presentation"><a role="menuitem" tabindex="-1" href="${sectionUrl}">${section}</a></li>\n`
  }
}

commonHeaderHtml = commonHeaderHtml.replace("<!--additionalSections-->", headerDropDownContent);

let sized = []

for(let post of posts) {
  let imageIndex = post.Pictures.length;
  for(let img of post.Pictures) {
    let obj = {};
    try {
        var dimensions = sizeOf(path.join(__dirname,'docs',img));
        obj.src = img;
        obj.h = dimensions.height;
        obj.w = dimensions.width;
        obj.title = `${DateTime.fromSeconds(post.Timestamp).toFormat('LLL d, yyyy')} <a href='${post.URL}'>${post.Title}</a> - image ${imageIndex}/${post.Pictures.length}`;
        sized.push(obj);
    }
    catch(e) {
        console.log(`Couldn't find: ${img}`);
    }
    imageIndex--;
  }
}

let gallery = sized;

// now create the index page
createListingPage("Main", "Posts", "index", posts, gallery);

// create the listing page for each Section
for(let section of uniqueSections) {
  // main is always present so we skip it
  if(section != 'Main') {
    let sectionUrl = wordToUrl(section);
    createListingPage(section, section, sectionUrl, posts);
  }
}

// create the pages for each individual blog
var postTemplateHtml = fs.readFileSync(path.join(__dirname,'source','post.html'), 'utf8');

// we want to output a page for each blog entry
for(let i = 0; i < posts.length; i++) {
  let post = posts[i];
  let nextPost = i > 0 ? posts[i-1] : null;
  let previousPost = i < (posts.length-1) ? posts[i+1] : null;
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

    modifiedPostTemplate = modifiedPostTemplate.replace("<!--bannerImage-->", post.BannerImage);
    modifiedPostTemplate = modifiedPostTemplate.replace("<!--author-->", "FourFeetOnAdventure");
    modifiedPostTemplate = modifiedPostTemplate.replace("<!--content-->", post.Content);
    modifiedPostTemplate = modifiedPostTemplate.replace("<!--day-->", DateTime.fromSeconds(post.Timestamp).toFormat('d'));
    modifiedPostTemplate = modifiedPostTemplate.replace("<!--month-->", DateTime.fromSeconds(post.Timestamp).toFormat('LLL'));
    modifiedPostTemplate = modifiedPostTemplate.replace("<!--year-->", DateTime.fromSeconds(post.Timestamp).toFormat('yyyy'));

    let paginationButtons = "";
    if(previousPost) {
      paginationButtons += `<li><a href="${previousPost.URL}">Previous - ${previousPost.Title}</a></li>`;
    }
    if(nextPost) {
      paginationButtons += `<li><a href="${nextPost.URL}">Next - ${nextPost.Title}</a></li>`;
    }
    modifiedPostTemplate = modifiedPostTemplate.replace("<!--paginationbuttons-->", paginationButtons);

    // create the extra headers
    let headers = `<meta property='og:title' content='${post.Title.replace("'", "&#39;")}' />\n`;
    headers += `<meta name='twitter:title' content='${post.Title.replace("'", "&#39;")}' />\n`;
    headers += `<meta property='og:image' content='https://fourfeetonadventure.com/${post.SquareImage}'/>\n`;
    headers += `<meta name='twitter:image' content='https://fourfeetonadventure.com/${post.SquareImage}'/>\n`;

    var shortDesc = striptags(post.Content).substr(0,200);
    shortDesc = shortDesc.replace("\n", "");
    shortDesc = shortDesc.replace("\r", "");
    shortDesc = shortDesc.replace("'", "&#39;");
    var lastSpace = shortDesc.lastIndexOf(" ");
    shortDesc = shortDesc.substr(0, lastSpace) + "...";

    // save this for later
    post.ShortDesc = shortDesc;

    headers += `<meta property='og:description' content='${shortDesc}' />\n`;
    headers += `<meta name='twitter:description' content='${shortDesc}'/>\n`;
    headers += `<meta property='og:url' content='https://fourfeetonadventure.com/${post.URL}' />\n`;
    headers += `<meta property='og:type' content='website' />\n`;
    headers += `<meta name='twitter:card' content='summary_large_image'></meta>\n`;

    // and output this file
    outputPost += modifiedPostTemplate;
    outputPost += commonFooterHtml;

    outputPost = outputPost.replace("<!--extraheaders-->", headers);

    fs.writeFileSync(path.join(__dirname,"docs", post.URL + ".html"), outputPost, 'utf8');
}

// create the about page
var aboutContentHtml = fs.readFileSync(path.join(__dirname,'source','about.html'), 'utf8');

// combine these together
var completeAbout = commonHeaderHtml + aboutContentHtml + commonFooterHtml;
fs.writeFileSync(path.join(__dirname,"docs","about.html"), completeAbout, 'utf8');

// make a newsletter
var post = posts[0];
var post2 = posts[1];
var post3 = posts[2];
var emailTemplateHtml = fs.readFileSync(path.join(__dirname,'source','email.html'), 'utf8');
var emailTemplateHtml2 = fs.readFileSync(path.join(__dirname,'source','email2.html'), 'utf8');
var emailTemplateHtml3 = fs.readFileSync(path.join(__dirname,'source','email3.html'), 'utf8');

emailTemplateHtml = emailTemplateHtml.replace("<!--PostURL-->", `https://fourfeetonadventure.com/${post.URL}`);
emailTemplateHtml = emailTemplateHtml.replace("<!--PostTitle-->", post.Title);
emailTemplateHtml = emailTemplateHtml.replace("<!--PostAltText-->", post.Title);
emailTemplateHtml = emailTemplateHtml.replace("<!--PostBanner-->", `https://fourfeetonadventure.com/${post.BannerImage}`);
emailTemplateHtml = emailTemplateHtml.replace("<!--PostImage-->", `https://fourfeetonadventure.com/${post.SquareImage}`);
emailTemplateHtml = emailTemplateHtml.replace("<!--PostContent-->", post.ShortDesc);

emailTemplateHtml2 = emailTemplateHtml2.replace("<!--PostURL-->", `https://fourfeetonadventure.com/${post.URL}`);
emailTemplateHtml2 = emailTemplateHtml2.replace("<!--PostTitle-->", post.Title);
emailTemplateHtml2 = emailTemplateHtml2.replace("<!--PostAltText-->", post.Title);
emailTemplateHtml2 = emailTemplateHtml2.replace("<!--PostBanner-->", `https://fourfeetonadventure.com/${post.BannerImage}`);
emailTemplateHtml2 = emailTemplateHtml2.replace("<!--PostImage-->", `https://fourfeetonadventure.com/${post.SquareImage}`);
emailTemplateHtml2 = emailTemplateHtml2.replace("<!--PostContent-->", post.ShortDesc);

emailTemplateHtml3 = emailTemplateHtml3.replace("<!--PostURL-->", `https://fourfeetonadventure.com/${post.URL}`);
emailTemplateHtml3 = emailTemplateHtml3.replace("<!--PostTitle-->", post.Title);
emailTemplateHtml3 = emailTemplateHtml3.replace("<!--PostAltText-->", post.Title);
emailTemplateHtml3 = emailTemplateHtml3.replace("<!--PostBanner-->", `https://fourfeetonadventure.com/${post.BannerImage}`);
emailTemplateHtml3 = emailTemplateHtml3.replace("<!--PostImage-->", `https://fourfeetonadventure.com/${post.SquareImage}`);
emailTemplateHtml3 = emailTemplateHtml3.replace("<!--PostContent-->", post.ShortDesc);

emailTemplateHtml2 = emailTemplateHtml2.replace("<!--PostURL2-->", `https://fourfeetonadventure.com/${post2.URL}`);
emailTemplateHtml2 = emailTemplateHtml2.replace("<!--PostTitle2-->", post2.Title);
emailTemplateHtml2 = emailTemplateHtml2.replace("<!--PostAltText2-->", post2.Title);
emailTemplateHtml2 = emailTemplateHtml2.replace("<!--PostImage2-->", `https://fourfeetonadventure.com/${post2.SquareImage}`);
emailTemplateHtml2 = emailTemplateHtml2.replace("<!--PostContent2-->", post2.ShortDesc);

emailTemplateHtml3 = emailTemplateHtml3.replace("<!--PostURL2-->", `https://fourfeetonadventure.com/${post2.URL}`);
emailTemplateHtml3 = emailTemplateHtml3.replace("<!--PostTitle2-->", post2.Title);
emailTemplateHtml3 = emailTemplateHtml3.replace("<!--PostAltText2-->", post2.Title);
emailTemplateHtml3 = emailTemplateHtml3.replace("<!--PostImage2-->", `https://fourfeetonadventure.com/${post2.SquareImage}`);
emailTemplateHtml3 = emailTemplateHtml3.replace("<!--PostContent2-->", post2.ShortDesc);

emailTemplateHtml3 = emailTemplateHtml3.replace("<!--PostURL3-->", `https://fourfeetonadventure.com/${post3.URL}`);
emailTemplateHtml3 = emailTemplateHtml3.replace("<!--PostTitle3-->", post3.Title);
emailTemplateHtml3 = emailTemplateHtml3.replace("<!--PostAltText3-->", post3.Title);
emailTemplateHtml3 = emailTemplateHtml3.replace("<!--PostImage3-->", `https://fourfeetonadventure.com/${post3.SquareImage}`);
emailTemplateHtml3 = emailTemplateHtml3.replace("<!--PostContent3-->", post3.ShortDesc);

// decide which email gets written out to 'email1.html' (our only free template)
let postsToEmail = 2;

let emailContent = emailTemplateHtml;
switch(postsToEmail) {
  default:
    emailContent = emailTemplateHtml;
    break;
  case 2:
    emailContent = emailTemplateHtml2;
    break;
  case 3:
    emailContent = emailTemplateHtml3;
    break;
}

fs.writeFileSync(path.join(__dirname,"docs", "email1.html"), emailContent, 'utf8');

console.log("Build Complete");
