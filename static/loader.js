
//
//  Gets the currently selected chat channel when the page is first loaded 
//

document.addEventListener('DOMContentLoaded', () => {

    let socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    let sender = document.getElementById('current_user').innerText;
    let channelDisplay = document.querySelector('#channel_name');
    let currentChannel = localStorage.getItem('activeChannel');

    if (currentChannel) {
        channelDisplay.innerText = '#' + currentChannel;
    }
    else {
        channelDisplay.innerText = '#general';
        localStorage.setItem('activeChannel', 'general');
        currentChannel = 'general';
    }

    message_parameters = { channel: currentChannel, sender: sender };
    socket.emit('client select channel', message_parameters);

});