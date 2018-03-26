document.addEventListener('DOMContentLoaded', () => {

    document.querySelector('#signout_form button').onclick = () => {
        console.log('logout button clicked');
        username = document.querySelector('#current_user').value;
        localStorage.setItem('activeuser', username);
    };

});
