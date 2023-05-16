from flask import Flask, session, url_for, render_template
from flask_session import Session

app = Flask("__name__")
app.config["SECRET_KEY"] = "shush"
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

@app.route("/")
def index():
    return render_template("chase.html")