document.addEventListener('DOMContentLoaded', () => {

    let socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

 // Define template and function used to update the DOM upon receipt of chat
 // message

    let messageTemplate = 
        `<div class='msg_container' id='{{ messageId }}'>
            <div>
                <span class='msg_sender'> {{ sender }} </span>
                <span class='msg_time'> {{ mesgTime }} </span>
            </div>
            <div style='display:flex; justify-content: space-between;' class='msg_content'> 
                <div> {{ content }} </div>
                <div class='delete_msg'> delete <span class='delete_box'> [X] </span> </div>
            </div>
         </div>`;
 
    function _generateMessageId(message) {

     // Generate unique ID to be assigned to each message

        let messageId = message.sender.replace(/\s+/g, '_') + '_' + 
                        message.mesgDate.replace(/-/g, '') + '_' + 
                        message.mesgTime.replace(/:/g, '');

        return messageId;

    }

    function _writeMessageToDOM(message) {

        let currentUser = document.getElementById('current_user').innerText.trim();
        let messageDiv = document.createElement('div');
        let messageId = _generateMessageId(message);

     // Assemble DIV and insert into DOM

        message.messageId = messageId;
        if (message.content.length == 0) {
            message.content = '- message deleted -';
        }
        messageDiv.innerHTML = Mustache.render(messageTemplate, message);
        document.querySelector('.content').append(messageDiv);

     // Configure delete message event handler for newly inserted DOM and enable
     // if current user is author of message

        let deleteLinkDiv = document.querySelector('#' + messageId + ' .delete_msg');
        if (currentUser != message.sender || message.content == '- message deleted -') {  
            deleteLinkDiv.style.display = 'none';
        }

        let deleteBox = document.querySelector('#' + messageId + ' .delete_box');
        deleteBox.addEventListener('click', (evt) => {
            let message_params = {
                channel:  message.channel,
                sender:   message.sender,
                mesgDate: message.mesgDate, 
                mesgTime: message.mesgTime 
            };
            socket.emit('client delete message', message_params);
        });

    }

 // Set up listener for delete message notifications and update local
 // chat client upon receipt of such a notification

    socket.on('server broadcast delete message', data => {

        let messageId = _generateMessageId(data);

        contentDiv = document.querySelector('#' + messageId + ' .msg_content');
        contentDiv.innerHTML = 
            '<div> - message deleted - </div> <div> </div>';

    });

 // Set up listener for chat channel creation notifications and update
 // local chat client upon receipt of such a notification

    socket.on('server broadcast new channel', data => {

        let select = document.querySelector('select');
        let chatOption = document.createElement('option');

        chatOption.innerText = data.channel;
        select.append(chatOption);

    });

 // Set up listener for any messages sent by other chat clients, and
 // update local chat client with message contents upon receipt of message
 
    socket.on('server broadcast new message', data => {

     // Add new message notification to client's display

        let currentUser = document.getElementById('current_user').innerText.trim();

        if (currentUser != data.sender) {
            _showNotification(data.channel, true)
        }

        let channelName = _activeChannel(currentUser);
        if (channelName != data.channel) {
            return;
        }

        _writeMessageToDOM(data);

    });

 // Set up listener to receive message history from server, and update 
 // local chat client upon receipt of history

    socket.on('server send history', data => {

        let contentdiv = document.querySelector('.content');
        contentdiv.innerHTML = "";        

        for (i = 0; i < data.length; i++) {
            _writeMessageToDOM(data[i]);
        }

    });

 // Define event handler to manage new message notification display

    window.addEventListener('scroll', () => {

     // Remove new message notification from channel name upon scrolling
     // of chat window to bottom of screen

        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {

            let currentUser = document.getElementById('current_user').innerText.trim();
            let channelName = _activeChannel(currentUser);
            let channelsWithUnreadMessages = _showNotification(channelName, false);

            if (channelsWithUnreadMessages == 0) {
                let statusDiv = document.querySelector('#status');
                statusDiv.innerText = '';
            }
        }

    })

 // Define event handler to manage chat channel creation requests
  
    let createChannelForm = document.querySelector('#toggle_create');
    createChannelForm.addEventListener('click', () => {

        let data = new FormData();
        let rawChannelName = document.querySelector('#channel').value;
        let request = new XMLHttpRequest();

     // Check if channel name is valid

        let channelName = rawChannelName.trim().replace(/\s+/g, '_');
        channelName = channelName.match(/[A-Za-z0-9_]+/g).join('');
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

    let sendMessageForm = document.querySelector('#message_form');
    sendMessageForm.addEventListener('submit', (evt) => {

        let allChannels = document.querySelector('select');
        let channelName = allChannels.options[allChannels.selectedIndex].innerText.trim();
        let sender = document.querySelector('#current_user').innerText.trim();
        let content = document.querySelector('#message').value;

        document.querySelector('#message').value = "";

        message_parameters = { channel: channelName, content: content, sender: sender };
        socket.emit('client send message', message_parameters);

        let messagesDiv = document.querySelector('.content');
        scrollParameters = { behavior: 'smooth', block: 'end', inline: 'nearest' }
        messagesDiv.scrollIntoView(scrollParameters);

        evt.preventDefault() // prevent further event propagation, we are good here

        return false;
    
    });

 // Define event handler to manage active chat channel selection

    let channelSelect =  document.querySelector('#select_channel');
    channelSelect.addEventListener('change', () => {

        let allChannels = document.querySelector('select');
        let rawChannelName = allChannels.options[allChannels.selectedIndex].innerText;
        let currentUser = document.getElementById('current_user').innerText.trim();
        let channelDisplay = document.querySelector('#channel_name');

        let channelName = rawChannelName.match(/[A-Za-z0-9_]+/g).join('');
        channelDisplay.innerText = '#' + channelName;

        _activeChannel(currentUser, channelName);

        message_parameters = { channel: channelName, sender: currentUser };
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

 // Define event handler to acknowledge unread message notification on
 // channels that don't have a scrollbar (i.e. have less than one page in 
 // content)

    window.addEventListener('click', () => {

        let currentUser = document.getElementById('current_user').innerText.trim();
        let channelName = _activeChannel(currentUser);
        let chatContent = document.querySelector('.content');

        if (chatContent.clientHeight <= window.innerHeight) {
            _showNotification(channelName, false);
        }

    });

})
