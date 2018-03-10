import os

from flask import Flask, redirect, render_template, request, session, url_for
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

app.secret_key = os.urandom(24) # Configure a secret key for sessions

socketio = SocketIO(app)

USER_SIGNED_IN = 'user_signed_in'


@app.route("/")
def index():

    return render_template('_home.html')


@app.route("/signin", methods=['POST'])
def signin():

    username = request.form.get('userid')
    session[USER_SIGNED_IN] = username
    return render_template('_home.html')


@app.route("/signout", methods=['POST'])
def signout():

    session.clear()
    return redirect(url_for('index'))


def _is_signed_in():

    return session[USER_SIGNED_IN]

