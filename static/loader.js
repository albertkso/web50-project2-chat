
//
//  Sets current chat channel whenever page is first loaded 
//

document.addEventListener('DOMContentLoaded', () => {

    const sender = document.getElementById('current_user').innerText;
    const currentChannel = localStorage.getItem('activeChannel');
    const channelDisplay = document.querySelector('#channel_name');

    if (currentChannel) {
        channelDisplay.innerText = '#' + currentChannel;
    }
    else {
        channelDisplay.innerText = '#general';
        localStorage.setItem('activeChannel', 'general');
    }
    
});