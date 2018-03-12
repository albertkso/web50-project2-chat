document.addEventListener('DOMContentLoaded', () => {

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

 /*
  * Receive any messages / updates from other chat clients and update
  * local client
  */

    socket.on('server broadcast', data => {
        const messagediv = document.createElement('div');
        messagediv.innerHTML = 
            `<div style='margin: 0.5em 0.5em;'>
                <div style='font-weight: bold'> ${data.sender} </div>
                <div style='font-size: 95%'> ${data.message} </div>
             </div>`;
        document.querySelector('.content').append(messagediv);
    });

    socket.on('server send history', data => {
        for (i = 0; i <= data.length; i++) {
            console.log(data[i]);
        }
    });
    
 /*
  * Create a new chat channel
  */

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

 /*
  * Send message to chat server for broadcast on the active channel
  */

    document.querySelector('#send_message').onclick = () => {
        const channel = 'general';
        const sender = document.getElementById('current_user').innerText;
        const message = document.querySelector('#message').value;

        document.querySelector('#message').value = "";

        message_parameters = { channel: channel, sender: sender, message: message };
        socket.emit('client send message', message_parameters);

        return false;
    }

 /*
  * Configure the active chat channel
  */

    document.querySelector('#channels').onclick = (evt) => {
        if (evt.target.tagName != 'LI')
            return;

        const activeChannel = evt.target;
        const channelName = activeChannel.innerText;
        const allChannels = document.querySelectorAll('#channels li');
        const sender = document.getElementById('current_user').innerText;

        for (i = 0; i < allChannels.length; i++) {
            allChannels[i].classList.remove('active_channel');
        }
        activeChannel.classList.add('active_channel');

        message_parameters = { channel: channelName, sender: sender };
        socket.emit('client select channel', message_parameters);
    }

})
