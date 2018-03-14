import os

from flask import Flask, jsonify, redirect, render_template, request, session, url_for
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

app.secret_key = os.urandom(24) # Configure a secret key for sessions

socketio = SocketIO(app)

USER_SIGNED_IN  = 'user_signed_in'
CURRENT_CHANNEL = 'current_channel'

chat_messages = { 
    'general' : [],
    'spam'    : [],
}


@app.route("/")
def index():
    
    active_channel = _current_channel()

    return render_template('_home.html',
            current_channel=active_channel,
            chat_history=chat_messages[active_channel], 
            chat_channels=list(chat_messages.keys()))


@app.route("/signin", methods=['POST'])
def signin():

    username = request.form.get('userid')
    _signin_user(username)

    return redirect(url_for('index'))


@app.route("/signout", methods=['POST'])
def signout():

    _signout_user()

    return render_template('_home.html')


@app.route("/manage_channels", methods=['POST'])
def manage_channels():

    channel_name = request.form.get('channel')

    if channel_name not in chat_messages:
        chat_messages[channel_name] = []
        success = True

    else:
        success = False

    return jsonify(success=success, channel=channel_name)


@socketio.on('client send message')
def handle_message(message):

    sender = message['sender']
    content = message['content']

    chat_messages[message['channel']].append(message)

    emit('server broadcast', message, broadcast=True)


@socketio.on('client select channel')
def handle_message(message):

    session['current_channel'] = message['channel']
    history = chat_messages[message['channel']]

    emit('server send history', history)


def _is_signed_in():

    if not USER_SIGNED_IN in session:
        return False

    else:
        return True


def _current_channel(channel=None):

    if channel:

        session[CURRENT_CHANNEL] = channel
        return True

    elif not 'current_channel' in session:
         
        return 'general'

    else:

        return session[CURRENT_CHANNEL]


def _signin_user(username):

    session.clear()
    session[USER_SIGNED_IN] = username


def _signout_user():

    session.clear()
