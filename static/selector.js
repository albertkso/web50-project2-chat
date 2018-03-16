
document.addEventListener('DOMContentLoaded', () => {

    const selectMenu = document.querySelector('select');

 /*
  * Write the current chat channel to storage
  */

    document.querySelector('select').onchange = () => {
    
        let channelName = selectMenu[selectMenu.selectedIndex].value;
        localStorage.setItem('currentChannel', channelName);
        
    }

 /*
  * Retrieve the current chat channel from storage
  */

    window.onload = () => {

        let currentChannel = localStorage.getItem('currentChannel');

        for (i = 0; i < selectMenu.options.length; i++) {
            if (selectMenu.options[i].value === currentChannel) {
                selectMenu.selectedIndex = i;
                break;
            }
        }

    }

});

