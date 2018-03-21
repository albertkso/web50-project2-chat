import os
from datetime import datetime

from flask import Flask, jsonify, redirect, render_template, request, session, url_for
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

app.secret_key = os.urandom(24) # Configure a secret key for sessions

socketio = SocketIO(app)

USER_SIGNED_IN      = 'user_signed_in'
CURRENT_CHANNEL     = 'current_channel'

# Create message storage along with two channels out of the box

MESSAGE_HISTORY_CAP = 100
chat_messages = { 
    'general' : [],
    'spam'    : [],
}


# Make session persist until the user either signs out or session is cleared
# https://tinyurl.com/y7dqvr5a

@app.before_request
def session_management():
    session.permanent = True


# Login / home page

@app.route("/", methods=['GET', 'POST'])
def index():
    
    active_channel = _current_channel()

    return render_template('_home.html',
            current_channel=active_channel,
            chat_history=chat_messages[active_channel], 
            chat_channels=list(chat_messages.keys()))


# Sign in user to chat session

@app.route("/signin", methods=['POST'])
def signin():

    _signin_user(request.form.get('userid'))
    return redirect(url_for('index'))


# Sign out user from chat session

@app.route("/signout", methods=['POST'])
def signout():

    _signout_user()
    return redirect(url_for('index'))


# Handle new channel creation requests and propagate new channel info
# to other clients

@app.route("/manage_channels", methods=['POST'])
def manage_channels():

    channel_name = request.form.get('channel')

    if channel_name not in chat_messages:
        chat_messages[channel_name] = []
        success = True

    else:
        success = False

    return jsonify(success=success, channel=channel_name)


# Add metadata to message received from chat client and forward to other
# chat clients

@socketio.on('client send message')
def handle_message(message):

  # Add server timestamp to message and add message to message history
  # A channel's message history is capped at MESSAGE_HISTORY_CAP messages
    current_time = datetime.now()
    message['mesg_time'] = current_time.strftime('%H:%M')
    message['mesg_date'] = current_time.strftime('%Y-%m-%d')

    chat_messages[message['channel']].append(message)
    if len(chat_messages[message['channel']]) > MESSAGE_HISTORY_CAP:
        del chat_messages[message['channel']][0]

    emit('server broadcast new message', message, broadcast=True)


# Receive create chat channel request from chat client and forward new
# chat channel information to other chat clients

@socketio.on('client create channel')
def handle_message(message):

    emit('server broadcast new channel', message, broadcast=True)


# Receive chat channel selection request from client and send channel
# chat history to client in response

@socketio.on('client select channel')
def handle_message(message):

    session[CURRENT_CHANNEL] = message['channel']
    history = chat_messages[message['channel']]

    emit('server send history', history)


# Define supporting functions

def _is_signed_in():

    if not USER_SIGNED_IN in session:
        return False

    else:
        return True


def _current_channel(channel=None):

    if channel:
        session[CURRENT_CHANNEL] = channel
        return True

    elif not CURRENT_CHANNEL in session:
        return 'general'

    else:
        return session[CURRENT_CHANNEL]


def _signin_user(username):

    session.clear()
    session[USER_SIGNED_IN] = username


def _signout_user():

    session.clear()
