# Project 2

## Web Programming with Python and JavaScript ##

### Setup ###

To set up the web application do the following

* create a new virtual environment
* execute the following commands

  pip install -r requirements.txt
  export FLASK_APP=application.py
  flask run

### Implementation Notes ###

The key files of the chat web application are as follows.

* chat.js - manages incoming and outgoing messages
* init.js - loads saved application state (current schannel) upon http page load
* misc.js - placeholder for functions
* mustache.js - third party library template library https://mustache.github.io

Mustache was used to try to separate the markup from the rest of the code.

### Additional Functionality ###

The ability to delete messages was implemented - a link is displayed for
every eligible message. 

Also, new message notifications were added. During implementation and testing
it became apparent there was a need for new message notifications.

