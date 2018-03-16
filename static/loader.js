
//
//  Gets the currently selected chat channel when the page is first loaded 
//

document.addEventListener('DOMContentLoaded', () => {

    const sender = document.getElementById('current_user').innerText;
    const channelDisplay = document.querySelector('#channel_name');
    const currentChannel = localStorage.getItem('activeChannel');

    if (currentChannel) {
        channelDisplay.innerText = '#' + currentChannel;
    }
    else {
        channelDisplay.innerText = '#general';
        localStorage.setItem('activeChannel', 'general');
    }
    
});