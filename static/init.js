
//
//  Gets the currently selected chat channel when the page is first loaded 
//

document.addEventListener('DOMContentLoaded', () => {

    let socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    let sender = document.getElementById('current_user').innerText.trim();
    let channelDisplay = document.querySelector('#channel_name');
    let channelSelector = document.querySelector('select');
    let currentChannel = _activeChannel(sender);

    channelDisplay.innerText = '#' + currentChannel;

    if (currentChannel) {
        for (i = 0; i < channelSelector.options.length; i++) {
            if (channelSelector.options[i].text == currentChannel) {
                channelSelector.options[i].selected = true;
            }
        }
    }
    else {
        currentChannel = 'general';
        currentChannel = _activeChannel(sender, currentChannel);
    }

    message_parameters = { channel: currentChannel, sender: sender };
    socket.emit('client select channel', message_parameters);

});