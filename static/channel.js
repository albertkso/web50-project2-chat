document.addEventListener('DOMContentLoaded', () => {

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

 /*
  * Receive any messages / updates from other chat clients and update
  * local client
  */

    socket.on('server broadcast', data => {
        const messagediv = document.createElement('div');
        messagediv.innerHTML = 
            `<div>
                <div style='font-weight: bold'> ${data.sender} </div>
                <div style='font-size: 95%'> ${data.content} </div>
             </div>`;
        document.querySelector('.content').append(messagediv);
    });

    socket.on('server send history', data => {

        const contentdiv = document.querySelector('.content');
        contentdiv.innerHTML = "";        

        for (i = 0; i < data.length; i++) {
            message = data[i];
            const messagediv = document.createElement('div');
            messagediv.innerHTML = 
                `<div>
                    <div style='font-weight: bold'> ${message.sender} </div>
                    <div style='font-size: 95%'> ${message.content} </div>
                 </div>`;
            document.querySelector('.content').append(messagediv);    
        }
    });
    
 /*
  * Create a new chat channel
  */

    document.querySelector('#add_channel').onclick = () => {
        const data = new FormData();
        const channelName = document.querySelector('#channel').value;
        const request = new XMLHttpRequest();

        if (channelName.length > 0) {

            data.append('channel', channelName);

            request.open('POST', '/manage_channels');

            request.onload = () => {
                const data = JSON.parse(request.responseText);
                if (data.success) {
                    const channelSelector = document.querySelector('#channelselector');
                    const newChannel = document.createElement('option')
                    newChannel.innerHTML = channelName;
                    newChannel.value = channelName;
                    channelSelector.appendChild(newChannel);
                }
            }

            request.send(data);

            const createChannelSpan = document.querySelector('#toggle_create');
            createChannelSpan.style.display = 'none';
            
        }

        return false;
    };

 /*
  * Send message to chat server for broadcast on the active channel
  */

    document.querySelector('#send_message').onclick = () => {

        const allChannels = document.querySelector('select');
        const activeChannel = allChannels[allChannels.selectedIndex].value;
        const sender = document.querySelector('#current_user').innerText;
        const content = document.querySelector('#message').value;

        document.querySelector('#message').value = "";

        message_parameters = { channel: activeChannel, sender: sender, content: content };
        socket.emit('client send message', message_parameters);

        return false;
    }

 /*
  * Configure the active chat channel
  */

    document.querySelector('#channelselector').onchange = () => {

        const allChannels = document.querySelector('select');
        const channelName = allChannels[allChannels.selectedIndex].value;
        const sender = document.getElementById('current_user').innerText;

        message_parameters = { channel: channelName, sender: sender };
        socket.emit('client select channel', message_parameters);
    }

 /*
  * Allow channel creation to be enabled / disabled
  */

    document.querySelector('#new_channel').onclick = () => {
        const createChannelSpan = document.querySelector('#toggle_create');

        if (createChannelSpan.style.display == '') {
            createChannelSpan.style.display = 'none';
        }
        else {
            createChannelSpan.style.display = '';
        }
    }
})
