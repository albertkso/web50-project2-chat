document.addEventListener('DOMContentLoaded', () => {

    document.querySelector('#signin_form button').onclick = () => {
        console.log('login button clicked');
        username = document.querySelector('#userid').value;
        localStorage.getItem('activeuser');
    };

});
