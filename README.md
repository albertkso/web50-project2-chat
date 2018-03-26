# Project 2

## Web Programming with Python and JavaScript ##

### Setup ###

To set up the web application do the following

* create a new virtual environment (for example through `mkvirtualenv`)
* execute the following commands
```
  pip install -r requirements.txt
  export FLASK_APP=application.py
  flask run
```
### Implementation Notes ###

The key files of the chat web application are as follows.

* `main.html` - the main page of the web application
* `chat.js` - manages channels and the sending and receiving and display of messages
* `init.js` - loads saved application state (e.g. current channel) upon http page load
* `misc.js` - placeholder for functions
* `mustache.js` - third party library template library https://mustache.github.io

Mustache was used to provide some separation of markup from the rest of the code.

### Additional Functionality (Personal Touch) ###

The ability to delete messages was implemented - a link is displayed for
every eligible message. 

Also, new message notifications were added. During implementation and testing
it became apparent there was a need for new message notifications.

Some bits were added to try to enhance user experience in the remaining time
available (for example scrolling the chat window to the bottom upon message
send).
