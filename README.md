###To generate data using your posts you have to:
  1. $ gem install bundler
  2. $ bundle install
  3. Run Jekyll with one of these commands:
  ```
    $ grunt
  ```
  ```
    $ rake jekyll:generate
  ```

Notice: Jekyll is running after changes when **grunt** started. Or you can regenerate data with rake command manually.

###Add new post with a rake task:

  NOTICE: Params are not neccessary, but post date depends on date in name of file).

  ```
    $ rake jekyll:task TITLE='your title' DATE='2014-10-15'
  ```
  * go and edit this file in 'jekyll/_posts' folder

### OR add a post manually:
  * go to 'jekyll/_posts' folder
  * add post with title formatted so: 'yyyy-mm-dd-posttitle.markdown'
  * fulfill the created file with data:

  Example:
  ```
    ---
    title: "Second post."
    cover: "blog/covers/coverImg.jpg"
    author: "Dima Guck"
    ava: "blog/avatars/dimaGuck.jpg"
    post: "Lorem Ipsum is simply dummy text. Nothing Special."
    ---
  ```