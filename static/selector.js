
function getCurrentChannel() {
            
    const selectMenu = document.querySelector('select');
    const currentChannel = localStorage.getItem('currentChannel');
    const sender = document.getElementById('current_user').innerText;

    for (i=0; i < selectMenu.options.length; i++) {
        if (selectMenu.options[i].value === currentChannel) {
            selectMenu.selectedIndex = i;
            break;
        }
    }

    message_parameters = { channel: currentChannel, sender: sender };
    console.log('getCurrentChannel');

}

function saveCurrentChannel() {

    const allChannels = document.querySelector('select');
    const channelName = allChannels[allChannels.selectedIndex].value;
    const sender = document.getElementById('current_user').innerText;

    const channelDisplay = document.querySelector('#channel_name');
    channelDisplay.innerText = '#' + channelName;

    message_parameters = { channel: channelName, sender: sender };

    localStorage.setItem('currentChannel', channelName);
    console.log('setCurrentChannel');

}

window.addEventListener('load', getCurrentChannel);
window.addEventListener('change', saveCurrentChannel);

