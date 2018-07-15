const fs = require('fs')
const path = require('path');

// read the common-header and common footer
var commonHeaderHtml = fs.readFileSync(path.join(__dirname,'source','common-header.html'), 'utf8');
var commonFooterHtml = fs.readFileSync(path.join(__dirname,'source','common-footer.html'), 'utf8');

// create the about page
var aboutContentHtml = fs.readFileSync(path.join(__dirname,'source','about.html'), 'utf8');

// combine these together
var completeAbout = commonHeaderHtml + aboutContentHtml + commonFooterHtml;

fs.writeFileSync(path.join(__dirname,"docs","about.html"), completeAbout, 'utf8');
