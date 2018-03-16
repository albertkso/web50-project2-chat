document.addEventListener('DOMContentLoaded', () => {

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

 // Receive any messages / updates from other chat clients and display
 // locally

    socket.on('server broadcast', data => {
        const activeChannel = localStorage.getItem('activeChannel');
        const messagediv = document.createElement('div');

        if (activeChannel != data.channel)
            return;

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

 // Receive chat channel's message history to display locally

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

 // Define handler to manage channel creation
  
    let createChannelForm = document.querySelector('#toggle_create');
    createChannelForm.addEventListener('click', () => {

        const data = new FormData();
        const channelName = document.querySelector('#channel').value;
        const request = new XMLHttpRequest();

     // Check if channel name is valid
        if (channelName.length == 0) 
            return false;

        data.append('channel', channelName);

     // Create new channel and notify and sync with server
        request.open('POST', '/manage_channels');
        request.onload = () => {
            const responsedata = JSON.parse(request.responseText);
            if (responsedata.success) {
                const channelSelector = document.querySelector('#select_channel');
                const newChannel = document.createElement('option')
                newChannel.innerHTML = channelName;
                newChannel.value = channelName;
                channelSelector.appendChild(newChannel);
            }
        }
        request.send(data);

     // Hide form again after create channel request submission
        const actionButton = document.querySelector('#enable_channel_edit');
        const createChannelSpan = document.querySelector('#channel_create_fields');
        createChannelSpan.className = 'hidden_form';
        createChannelSpan.style.display = '';
        actionButton.innerText = 'New';

        return false;

    })

 // Define handler that manages the sending of messages originating from client

    sendMessageButton = document.querySelector('#send_message');
    sendMessageButton.addEventListener('click', () => {

        const allChannels = document.querySelector('select');
        const activeChannel = allChannels[allChannels.selectedIndex].value;
        const sender = document.querySelector('#current_user').innerText;
        const content = document.querySelector('#message').value;

        document.querySelector('#message').value = "";

        message_parameters = { channel: activeChannel, sender: sender, content: content };
        socket.emit('client send message', message_parameters);

        return false;
    
    });

 // Define handler that manages active chat channel configuration

    channelSelect =  document.querySelector('#select_channel');
    channelSelect.addEventListener('change', () => {

        const allChannels = document.querySelector('select');
        const channelName = allChannels[allChannels.selectedIndex].value;
        const sender = document.getElementById('current_user').innerText;

        const channelDisplay = document.querySelector('#channel_name');
        channelDisplay.innerText = '#' + channelName;

        localStorage.setItem('activeChannel', channelName);

        message_parameters = { channel: channelName, sender: sender };
        socket.emit('client select channel', message_parameters);

    });

 // Define handler that displays or hides channel creation form

    toggleAddControl = document.querySelector('#enable_channel_edit');
    toggleAddControl.addEventListener('click', (evt) => {

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
        
        evt.preventDefault();

        return false;

    });

})
