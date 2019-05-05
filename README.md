# FourFeetOnAdventure

## Prerequisites: 

1. Node.js installed

1.1 If not installed go to nodejs.org and download the current LTS (long term support version).

1.2 Clone the project on the computer. This example uses vs code.

1.2.1 Download vs code. 

1.2.2 Download git. git-scm.com.

1.2.3 Open vs code.

1.2.4 Clone repository: View menu ->  Command Palette -> ```git clone``` -> https://github.com/leighwoltman/FourFeetOnAdventure

2. Open the project. File -> Open folder -> select cloned repository, folder nam should be FourFeetOnAdventure

3. Open terminal window: View -> Terminal  Type: ```npm install```

## To create a new post

1. Put full size pictures in ```/docs/img```

2. Within ```/posts``` create a new folder with a higher numeric postfix

3. Copy a content.html and data.json from another folder into this new folder.

3.1 Steps 2 and 3: copy the last post folder, and paste in parent ```posts``` folder

4. Within data.json:

    a. Update the *Title* field.

    b. Update the *Timestamp* field. This is the date of the post. This is the number of seconds since epoch in Unix time. Search the internet for "current epoch time" to find a calculator.

    c. [Optional] Make a *URL* field, this should be all lowercase and contain no spaces or special characters. Put underscores between words. 

    d. [Optional] Make a *BannerImage* field, this should be a path to an image in the /docs image folder. Only start the path in the img directory, ie: the picture as "img/PICTURE.jpg"

    e. [Optional] Make a *SquareImage* field, this should be a path to an image in the /docs image folder. Only start the path in the img directory, ie: the picture as "img/PICTURE.jpg"

5. Put the content into the content.html:

    a. All text and images should be encased in HTML paragraph tags, ie: <p></p>

    b. The first character of the first paragraph should be put in <strong></strong> tags.

    c. All images should be in the format: <p><img src="img/PICTURE.jpg"/></p>

6. Check in these changes to GitHub.

7. Open terminal window: View -> Terminal  Type:  ```npm run build```. Check in the resulting changes to GitHub.
