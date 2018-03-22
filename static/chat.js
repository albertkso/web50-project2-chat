document.addEventListener('DOMContentLoaded', () => {

    let socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

 // Define function and template that updates DOM upon receipt of chat
 // message(s)

    let messageTemplate = 
        `<div class='msg_container' id='{{ messageId }}'>
            <div>
                <span class='msg_sender'> {{ sender }} </span>
                <span class='msg_time'> {{ mesgTime }} </span>
            </div>
            <div style='display:flex; justify-content: space-between;' class='msg_content'> 
                <div> {{ content }} </div>
                <div class='delete_msg'> [X] </div>
            </div>
         </div>`;

    function _writeMessageToDOM(message) {

        let messageDiv = document.createElement('div');

        let messageId = 't' + 
            message.sender.replace(/\s+/g, '_') + '_' + 
            message.mesgTime.replace(/:/g, '_');
        message.messageId = messageId;

        messageDiv.innerHTML = Mustache.render(messageTemplate, message);

        document.querySelector('.content').append(messageDiv);

        let deleteLinkDiv = document.querySelector('#' + messageId + ' .delete_msg');
        deleteLinkDiv.addEventListener('click', (evt) => {
            console.log('click');
        });

    }

 // Set up listener for chat channel creation notifications and update
 // local chat client interface upon receipt of such a notification

    socket.on('server broadcast new channel', data => {

        let select = document.querySelector('select');
        let chatOption = document.createElement('option');

        chatOption.innerText = data.channel;
        select.append(chatOption);

    });

 // Set up listener for any messages sent by other chat clients, and
 // update local chat client interface with message contents upon receipt
 // of message
 
    socket.on('server broadcast new message', data => {

        let channelName = localStorage.getItem('activeChannel');
        if (channelName != data.channel) {
            return;
        }
        _writeMessageToDOM(data);

    });

 // Set up listener to receive message history from server, and update 
 // local chat client interface with history upon receipt of history

    socket.on('server send history', data => {

        let contentdiv = document.querySelector('.content');
        contentdiv.innerHTML = "";        

        for (i = 0; i < data.length; i++) {
            _writeMessageToDOM(data[i]);
        }

    });

 // Define event handler to manage chat channel creation requests
  
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

        message_parameters = { channel: channelName };
        socket.emit('client create channel', message_parameters);

        return false;

    })

 // Define event handler to handle client send message requests

    let sendMessageButton = document.querySelector('#send_message');
    sendMessageButton.addEventListener('click', (evt) => {

        let allChannels = document.querySelector('select');
        let channelName = allChannels.options[allChannels.selectedIndex].value;
        let sender = document.querySelector('#current_user').innerText;
        let content = document.querySelector('#message').value;

        console.log(channelName);

        document.querySelector('#message').value = "";

        message_parameters = { channel: channelName, sender: sender, content: content };
        socket.emit('client send message', message_parameters);

        evt.preventDefault() // prevent further event propagation, we are good here

        return false;
    
    });

 // Define event handler to manage active chat channel selection

    let channelSelect =  document.querySelector('#select_channel');
    channelSelect.addEventListener('change', () => {

        let allChannels = document.querySelector('select');
        let channelName = allChannels.options[allChannels.selectedIndex].value;
        let sender = document.getElementById('current_user').innerText;
        let channelDisplay = document.querySelector('#channel_name');

        channelDisplay.innerText = '#' + channelName;

        console.log(channelName);

        localStorage.setItem('activeChannel', channelName);

        message_parameters = { channel: channelName, sender: sender };
        socket.emit('client select channel', message_parameters);

    });

 // Define event handler to hide or display chat channel creation form

    let toggleAddControl = document.querySelector('#enable_channel_edit');
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
