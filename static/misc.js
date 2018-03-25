
//
// Gets and sets the currently active chat channel
//

function _activeChannel(username, channel=null) {

    let currentUser = username.replace(/\s+/g, "_")
    let storageKey = 'activeChannel_' + currentUser;

    if (channel) {
        localStorage.setItem(storageKey, channel);
    }

    let config = localStorage.getItem(storageKey);
    if (config == null) {
        localStorage.setItem(storageKey, 'general');
        config = localStorage.getItem(storageKey);
    }
    
    return config;
    
}

//
// Display or hide unread message notifications
//

function _showNotification(channel, hasNewMessages) {

    let unreadChannels = 0;
    let channelSelector = document.querySelectorAll('option');
    let statusDiv = document.querySelector('#status');

    // Remove unread message notification from display

    if (hasNewMessages == false) { 
        for (i = 0; i < channelSelector.length; i++) {
            let option = channelSelector[i];
            if (option.text == channel + ' **') {
                option.text = channel;
            }
            else if (option.text.search(/\*\*/) > 0) {
                unreadChannels++;
            }
        }
    }

    // Add unread message notification ('**') to display

    if (hasNewMessages == true) { 
        for (i = 0; i < channelSelector.length; i++) {
            let option = channelSelector[i];
            if (option.text == channel) {
                option.text = channel + ' **';
                unreadChannels++;
            }
            else if (option.text.search(/\*\*/) > 0) {
                unreadChannels++;
            }
        }
    }

    if (unreadChannels > 0) {
        statusDiv.innerText = 'new messages';
    }
    else {
        statusDiv.innerText = '';
    }

    // Return the number of chat channels with unread messages

    return unreadChannels;
}
