## ChangeLog ##
### Greasemonkey script ###
#### 0.7 (12/20/06) ####
  * escape the post title in savePostValues()
  * fixed bug where navigating to earlier page in thread was overwriting last read value
#### 0.6 (12/02/06) - changes from [Collin](http://collingrady.com/) ####
  * tweaked the JS so if it gets invalid entries it still prints the menu - before it would die if it ran into, say, a string instead of a link. (usually due to the stop tracking issue earlier, but not always)
#### 0.5 (11/06/06) ####
  * Applied [patch](http://geekforhire.org/files/lastreadpostserver.user.js.patch)

### PHP script ###
#### 0.2 (12/02/06) - changes from [Collin](http://collingrady.com/) ####
  * address the length issue for the most part - setHistory now truncates it to 15 entries
  * strips out any invalid keys (for instance if you stop tracking a post in your history).
