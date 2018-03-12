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
                `<div style='margin: 0.5em 0.5em;'>
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
        const sender = document.getElementById('current_user').innerText;
        const channel = document.querySelector('.active_channel').innerText;
        const content = document.querySelector('#message').value;

        document.querySelector('#message').value = "";

        message_parameters = { channel: channel, sender: sender, content: content };
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
