# FourFeetOnAdventure

## Prerequisites: 

1. Node.js installed

2. Use the command line to navigate to the root folder of the project.

3. To prepare for build ```npm install``` must be run within the directory (once) of the repository on the local machine.

## To create a new post

1. Put full size pictures in ```/docs/img```

2. Within ```/posts``` create a new folder with a higher numeric postfix

3. Copy a content.html and data.json from another folder into this new folder.

4. Within data.json:

    a. Update the *Title* field.

    b. Update the *Timestamp* field. This is the number of seconds since epoch in Unix time. Search the internet for "current epoch time" to find a calculator.

    c. [Optional] Make a *URL* field, this should be all lowercase and contain no spaces or special characters.

    d. [Optional] Make a *BannerImage* field, this should be a path to an image in the /docs image folder. Only start the path in the img directory, ie: the picture as "img/PICTURE.jpg"

    e. [Optional] Make a *SquareImage* field, this should be a path to an image in the /docs image folder. Only start the path in the img directory, ie: the picture as "img/PICTURE.jpg"

5. Put the content into the content.html:

    a. All text and images should be encased in HTML paragraph tags, ie: <p></p>

    b. The first character of the first paragraph should be put in <strong></strong> tags.

    c. All images should be in the format: <p><img src="img/PICTURE.jpg"/></p>

6. Check in these changes to GitHub.

7. Go back to the command line in the main directory of the project, and execute ```npm run build```. Check in the resulting changes to GitHub.
