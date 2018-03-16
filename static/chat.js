document.addEventListener('DOMContentLoaded', () => {

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

 /*
  * Receive any messages / updates from other chat clients and update
  * local client
  */

    socket.on('server broadcast', data => {
        const messagediv = document.createElement('div');
        messagediv.innerHTML = 
            `<div class='msg_container'>
                <div>
                    <span class='msg_sender'> ${data.sender} </span>
                    <span class='msg_time'> ${data.mesg_time} </span>
                </div>
                <div class ='msg_content'> ${data.content} </div>
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
                `<div class='msg_container'>
                    <div>
                        <span class='msg_sender'> ${message.sender} </span>
                        <span class='msg_time'> ${message.mesg_time} </span>
                    </div>
                    <div class ='msg_content'> ${message.content} </div>
                </div>`;
            document.querySelector('.content').append(messagediv);    
        }
    });
    
 /*
  * Create a new chat channel
  */

    document.querySelector('#create_channel').onsubmit = () => {
        const data = new FormData();
        const channelName = document.querySelector('#channel').value;
        const request = new XMLHttpRequest();

        if (channelName.length > 0) {

            data.append('channel', channelName);

            request.open('POST', '/manage_channels');

            request.onload = () => {
                const data = JSON.parse(request.responseText);
                if (data.success) {
                    const channelSelector = document.querySelector('#select_channel');
                    const newChannel = document.createElement('option')
                    newChannel.innerHTML = channelName;
                    newChannel.value = channelName;
                    channelSelector.appendChild(newChannel);
                }
            }

            request.send(data);

            const actionButton = document.querySelector('#enable_channel_edit');
            const createChannelSpan = document.querySelector('#channel_create_fields');
            createChannelSpan.className = 'hidden_form';
            createChannelSpan.style.display = '';
            actionButton.innerText = 'New';
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

    document.querySelector('#select_channel').onchange = () => {

        const allChannels = document.querySelector('select');
        const channelName = allChannels[allChannels.selectedIndex].value;
        const sender = document.getElementById('current_user').innerText;

        const channelDisplay = document.querySelector('#channel_name');
        channelDisplay.innerText = '#' + channelName;

        message_parameters = { channel: channelName, sender: sender };
        socket.emit('client select channel', message_parameters);
    }

 /*
  * Allow channel creation form to be displayed or hidden
  */

    document.querySelector('#enable_channel_edit').onclick = () => {
        let createChannelSpan = document.querySelector('#channel_create_fields');
        let actionButton = document.querySelector('#enable_channel_edit');

        if (createChannelSpan.className == 'hidden_form') {
            createChannelSpan.className = '';
            createChannelSpan.style.display = 'inline-block';
            actionButton.innerText = 'Cancel';
        }
        else {
            createChannelSpan.className = 'hidden_form';
            createChannelSpan.style.display = '';
            actionButton.innerText = 'New';
        }

        return false;
    }
})
