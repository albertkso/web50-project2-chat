document.addEventListener('DOMContentLoaded', () => {

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('server broadcast', data => {
        const li = document.createElement('li');
        li.innerHTML = `${data.subject} ${data.message}`;
        document.querySelector('#messages').append(li);
    });

    document.querySelector('#add').onclick = () => {
        const data = new FormData();
        const channelName = document.querySelector('#channel').value;
        const request = new XMLHttpRequest();

        data.append('channel', channelName);

        request.open('POST', '/manage_channels');

        request.onload = () => {
            const data = JSON.parse(request.responseText);
            if (data.success) {
                console.log(channel)
                const channelsList = document.querySelector('#channels');
                const newChannel = document.createElement('li');
                newChannel.innerHTML = channelName;
                channelsList.appendChild(newChannel);
            }
        }

        request.send(data);
        return false;
    };

    document.querySelector('#send').onclick = () => {
        const message = document.querySelector('#message').value;
        socket.emit('client send', { subject: 'subject', message: message })
        return false;
    }

})
