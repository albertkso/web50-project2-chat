document.addEventListener('DOMContentLoaded', () => {

    let socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

 // Receive messages in real time from other chat clients and updates
 // local client display, if necessary
 
    socket.on('server broadcast', data => {

        channelName = localStorage.getItem('activeChannel');
        if (channelName != data.channel) {
            return;
        }

        let messagediv = document.createElement('div');
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

 // Receive messages / message history from server and updates local client
 // display

    socket.on('server send history', data => {

        let contentdiv = document.querySelector('.content');
        contentdiv.innerHTML = "";        

        for (i = 0; i < data.length; i++) {
            message = data[i];
            let messagediv = document.createElement('div');
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

 // Define event handler to manage chat channel creation
  
    let createChannelForm = document.querySelector('#toggle_create');
    createChannelForm.addEventListener('click', () => {

        let data = new FormData();
        let channelName = document.querySelector('#channel').value;
        let request = new XMLHttpRequest();

     // Check if channel name is valid
        if (channelName.length == 0) 
            return false;

        data.append('channel', channelName);

     // Create new channel and notify and sync with server
        request.open('POST', '/manage_channels');
        request.onload = () => {
            let responsedata = JSON.parse(request.responseText);
            if (responsedata.success) {
                let channelSelector = document.querySelector('#select_channel');
                let newChannel = document.createElement('option')
                newChannel.innerHTML = channelName;
                newChannel.value = channelName;
                channelSelector.appendChild(newChannel);
            }
        }
        request.send(data);

     // Hide form again after create channel request submission
        let actionButton = document.querySelector('#enable_channel_edit');
        let createChannelSpan = document.querySelector('#channel_create_fields');
        createChannelSpan.className = 'hidden_form';
        createChannelSpan.style.display = '';
        actionButton.innerText = 'New';

        return false;

    })

 // Define event handler to manage sending of messages originating from client

    sendMessageButton = document.querySelector('#send_message');
    sendMessageButton.addEventListener('click', () => {

        let allChannels = document.querySelector('select');
        let channelName = allChannels.options[allChannels.selectedIndex].value;
        let sender = document.querySelector('#current_user').innerText;
        let content = document.querySelector('#message').value;

        console.log(channelName);

        document.querySelector('#message').value = "";

        message_parameters = { channel: channelName, sender: sender, content: content };
        socket.emit('client send message', message_parameters);

        return false;
    
    });

 // Define event handler that manages active chat channel selection

    channelSelect =  document.querySelector('#select_channel');
    channelSelect.addEventListener('change', () => {

        let allChannels = document.querySelector('select');
        let channelName = allChannels.options[allChannels.selectedIndex].value;
        let sender = document.getElementById('current_user').innerText;
        let channelDisplay = document.querySelector('#channel_name');

        channelDisplay.innerText = '#' + channelName;

        console.log(channelName);

        if (channelName) {
            localStorage.setItem('activeChannel', channelName);
        }

        message_parameters = { channel: channelName, sender: sender };
        socket.emit('client select channel', message_parameters);

    });

 // Define handler that hides or displays chat channel creation form

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
        
        evt.preventDefault(); // prevent further event propagation, we are good here

        return false;

    });

})
