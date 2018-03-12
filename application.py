import os

from flask import Flask, jsonify, redirect, render_template, request, session, url_for
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

app.secret_key = os.urandom(24) # Configure a secret key for sessions

socketio = SocketIO(app)

logged_in_key = 'user_signed_in'
chat_channels = { 
    'general' : [],
    'spam'    : [],
}


@app.route("/")
def index():

    return render_template('_home.html', chat_channels=list(chat_channels.keys()))


@app.route("/signin", methods=['POST'])
def signin():

    username = request.form.get('userid')
    _signin_user(username)

    return redirect(url_for('index'))


@app.route("/signout", methods=['POST'])
def signout():

    _signout_user()
    return redirect(url_for('index'))


@app.route("/manage_channels", methods=['POST'])
def manage_channels():

    channel_name = request.form.get('channel')

    if channel_name not in chat_channels:
        chat_channels[channel_name] = []
        success = True

    else:
        success = False

    return jsonify(success=success, channel=channel_name)


@socketio.on('client send message')
def handle_message(message):

    sender = message['sender']
    content = message['content']

    chat_channels[message['channel']].append(message)

    emit('server broadcast', message, broadcast=True)


@socketio.on('client select channel')
def handle_message(message):

    history = chat_channels[message['channel']]
    emit('server send history', history)


def _is_signed_in(username):

    if not logged_in_key in session:
        return False

    else:
        return True


def _signin_user(username):

    session.clear()
    session[logged_in_key] = username


def _signout_user():

    session.clear()
