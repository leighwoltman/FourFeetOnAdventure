# FourFeetOnAdventure

## Post Folder Naming

* Follow the format ```YYYY-MM-DD_name_underscored``` For example: ```2020-01-01_skye```
* The date is up to the day, in the ISO format
* Then an underscore, followed by a description, with words all lowercase, seperated by underscores

## To create a new post

1. Sign into Github. Open the GitHub page for the repository in two browser tabs. Navigate one to an example post under ```/posts```. 

2. On the other tab, create a new branch (drop down menue on the left, this often says "master"). The branch name should have a reference to which post or posts are being created. If you are creating one post: name the branch the same as the post folder naming. Once in the branch, navigate to ```/posts``` and click to create a new file.

3. Create the name of the file, so it has a folder name as per the post folder naming and a file name of `data.json` by putting a / after the folder naming and write `data.json`. Go in your example `data.json` and copy the content from a file in your example tab. The fields are as follows within `data.json`:

    a. Update the *Title* field.

    b. Update the *Timestamp* field. This is the date of the post. This is the number of seconds since epoch in Unix time. Search the internet for "current epoch time" to find a calculator.

    c. [Optional] Make a *URL* field, this should be all lowercase and contain no spaces or special characters. Put underscores between words. You can use the main part of the title.

    d. [Optional] Make a *BannerImage* field, this should be a path to an image relative to this file. Only start the path in the img directory, ie: the picture as "img/PICTURE.jpg"

    e. [Optional] Make a *SquareImage* field, this should be a path to an image relative to this file. Only start the path in the img directory, ie: the picture as "img/PICTURE.jpg"
    
4. After filling out the content, head to to bottom and type a title for the commit, it should be short and descriptive. We can just use the default option. Make sure you are committing to the branch you just created.

5. Then navigate into your new directory under ```/posts```

6. Upload pictures in this directory, by convention in a subdirectory named ```img```. GitHub allows uploading all pictures at once, if you place all the photos in a folder named ```img``` and drop the whole folder in the 'Upload files` dialog, and GitHub will make the same folder structure, ie: create the ```img``` directory.

7. Update any references to pictures in ```data.json```

8. Navigate back into the new post directory under ```/posts```

9. Create a new file here, called `content.html` and put the text as follows:

    a. All text paragraphs and images should be encased in HTML paragraph tags, ie: ```<p>Your paragraph</p>```

    b. The first character of the first paragraph should be put in ```<strong>Your character</strong>``` tags. ie: ```<p><strong>I</strong>t started ...</p>```

    c. All images should be in the format: ```<p><img src="img/PICTURE.jpg"/></p>```

    d. All images with a caption should be: ```<p><img src="img/PICTURE.jpg"/><figcaption>Caption Text</figcaption></p>```
    
    e. All videos should be in the format: ```<p><video autoplay loop muted><source src="img/VIDEO.webm" type="video/webm"/></video></p>```

10. Once complete, commit it to the new branch you are working on.

11. Navigate back to 'Code' tab, and then to the 'N Branches' list. Beside the branch you created, click 'New pull request'

12. Add a reviewer, and then 'Create pull request'

13. When the pull request is merged to master, it will automatically be deployed with GitHub actions.

Note: Currently using https://video.online-convert.com/convert-to-webm with bitrate of 10000 for video encoding.

Note: To change the number of posts in the email template, open `build.js` and change the variable `postsToEmail`