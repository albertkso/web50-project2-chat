document.addEventListener('DOMContentLoaded', () => {

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('server broadcast', data => {
        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = 
            `<div style='margin: 0.5em 0.5em;'>
                <div style='font-weight: bold'> ${data.sender} </div>
                <div style='font-size: 95%'> ${data.message} </div>
             </div>`;
        document.querySelector('.content').append(messageDiv);
    });

    document.querySelector('#add_channel').onclick = () => {
        const data = new FormData();
        const channelName = document.querySelector('#channel').value;
        const request = new XMLHttpRequest();

        data.append('channel', channelName);

        request.open('POST', '/manage_channels');

        request.onload = () => {
            const data = JSON.parse(request.responseText);
            if (data.success) {
                const channelsList = document.querySelector('#channels');
                const newChannel = document.createElement('li');
                newChannel.innerHTML = channelName;
                channelsList.appendChild(newChannel);
            }
        }

        request.send(data);
        return false;
    };

    document.querySelector('#send_message').onclick = () => {
        const channel = 'general';
        const sender = document.getElementById('current_user').innerText;
        const message = document.querySelector('#message').value;

        message_parameters = { channel : channel, sender: sender, message: message }
        socket.emit('client send', message_parameters)
        document.querySelector('#message').value = "";

        return false;
    }

    document.querySelector('#channels').onclick = (evt) => {
        if (evt.target.tagName != 'LI') {
            return;
        }
 
        const channelItems = document.querySelectorAll('.channel_item');
        for (i = 0; i < channelItems.length; i++) {
            channelItems[i].style.fontWeight = 'normal';
        }

        const listElement = evt.target;
        listElement.style.fontWeight = 'bold';
    }

})
