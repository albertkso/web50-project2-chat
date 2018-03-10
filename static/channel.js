document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.channel_form').onclick = () => {

        // Initialize new request
        const request = new XMLHttpRequest();
        const channel = document.querySelector('#channel').value;
        request.open('POST', '/load_config');

        // Callback function for when request completes
        request.onload = () => {

            // Extract JSON data from request
            const data = JSON.parse(request.responseText);

            // Update the result div
            if (data.success) {
                console.log(data)
            }
            else {
            }
            
        }

        // Add data to send with request
        const data = new FormData();
        data.append('channel', channel);

        // Send request
        request.send(data);
        return false;
    };
})
