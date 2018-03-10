import os

from flask import Flask, jsonify, redirect, render_template, request, session, url_for
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

app.secret_key = os.urandom(24) # Configure a secret key for sessions

socketio = SocketIO(app)

USER_SIGNED_IN = 'user_signed_in'
all_channels  = [ 'spam1', 'spam2', 'spam3' ]

@app.route("/")
def index():

    return render_template('_home.html', chats=all_channels)


@app.route("/signin", methods=['POST'])
def signin():

    username = request.form.get('userid')
    session[USER_SIGNED_IN] = username

    return redirect(url_for('index'))


@app.route("/signout", methods=['POST'])
def signout():

    session.clear()
    return redirect(url_for('index'))


@app.route("/manage_channels", methods=['POST'])
def manage_channels():

    channel = request.form.get('channel')
    return jsonify(success=True, channel=channel)


def _is_signed_in():

    return session[USER_SIGNED_IN]

