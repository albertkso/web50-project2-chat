import os

from flask import Flask, jsonify, redirect, render_template, request, session, url_for
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

app.secret_key = os.urandom(24) # Configure a secret key for sessions

socketio = SocketIO(app)

logged_in_key = 'user_signed_in'
channels_list = [ 'general', 'spam' ]


@app.route("/")
def index():

    return render_template('_home.html', channels_list=channels_list)


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

    channel = request.form.get('channel')

    if channel not in channels_list:
        channels_list.append(channel)
        success = True

    else:
        success = False

    return jsonify(success=success, channel=channel)


@socketio.on('client send message')
def handle_message(message):

    emit('server broadcast', message, broadcast=True)


@socketio.on('client select channel')
def handle_channel(message):

    print('select channel notification received')


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
