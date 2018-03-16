
//
//  Load chat channel contents to page, whenever page is first loaded or
//  refreshed
//

document.addEventListener('DOMContentLoaded', () => {

    let socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    const sender = document.getElementById('current_user').innerText;
    const currentChannel = localStorage.getItem('activeChannel');
    const channelDisplay = document.querySelector('#channel_name');

    if (currentChannel) {
        channelDisplay.innerText = '#' + currentChannel;
    }
    else {
        channelDisplay.innerText = '#general';
    }

    message_parameters = { channel: currentChannel, sender: sender };
    socket.emit('client select channel', message_parameters);
    
});