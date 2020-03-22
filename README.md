# FourFeetOnAdventure

## To create a new post

1. Put full size pictures in ```/docs/img``` (This will probably be a direct commit to the 'master' branch.)

2. Open the GitHub page for the repository in two browser tabs. Navigate one to an example post under ```/posts```. On the other tab, navigate to ```/posts``` and click to create a new file.

3. Create the name of the file, so it has a folder name as a new post folder and a file name of `data.json`. For example, ```post50/data.json```. Copy the content from a file in your example tab. The fields are as follows within `data.json`:

    a. Update the *Title* field.

    b. Update the *Timestamp* field. This is the date of the post. This is the number of seconds since epoch in Unix time. Search the internet for "current epoch time" to find a calculator.

    c. [Optional] Make a *URL* field, this should be all lowercase and contain no spaces or special characters. Put underscores between words. You can use the main part of the title.

    d. [Optional] Make a *BannerImage* field, this should be a path to an image in the /docs image folder. Only start the path in the img directory, ie: the picture as "img/PICTURE.jpg"

    e. [Optional] Make a *SquareImage* field, this should be a path to an image in the /docs image folder. Only start the path in the img directory, ie: the picture as "img/PICTURE.jpg"
    
4. After filling out the content, head to to bottom and type a title for the commit, it should be short and descriptive. Then chose 'create a new branch...' option, ideally, name the branch after the post, but it doesn't matter. Then finish the creation of the branch by clicking 'Propose new file'

5. Navigate back to 'Code' tab, and then to the 'N Branches' list. Choose the new branch you created.

6. Then navigate into your new directory under ```/posts```

7. Create a new file here, called `content.html`. And copy in the content from another post that you had open in another tab.

8. Put the content into the `content.html`:

    a. All text paragraphs and images should be encased in HTML paragraph tags, ie: ```<p>Your paragraph</p>```

    b. The first character of the first paragraph should be put in ```<strong>Your character</strong>``` tags.

    c. All images should be in the format: ```<p><img src="img/PICTURE.jpg"/></p>```
    
    d. All videos should be in the format: ```<p><video autoplay loop muted><source src="img/VIDEO.webm" type="video/webm"/></video></p>```

9. At the bottom, type a name for this commit, and commit it directly to the branch you created previously.

10. Navigate back to 'Code' tab, and then to the 'N Branches' list. Beside the branch you created, click 'New pull request'

11. Add a reviewer, and then 'Create pull request'

12. When the pull request is merged to master, it will automatically be deployed with GitHub actions.
