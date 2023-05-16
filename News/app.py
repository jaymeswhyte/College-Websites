from flask import Flask, render_template, session, redirect, url_for, g
from forms import articleForm, commentForm, deleteForm, signUpForm, loginForm
from flask_session import Session
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db, close_db
from functools import wraps
from datetime import datetime

'''
-Admin Login-
username: Admin
pw: TPH4dm1n01
'''


app = Flask(__name__)
app.teardown_appcontext(close_db)
app.config["SECRET_KEY"] = "o@Mn#h4CmBmLy:cY8aF;VAd`5RYSRo"
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

@app.before_request
def load_logged_in_user():
    g.user = session.get("username", None)
    g.admin = session.get("is_admin", False)

    if "username" in session:
        g.username = session["username"]
        g.loginMessage = f"Logged in as {g.username}"

    else:
        g.loginMessage = "Not currently logged in"

def login_required(view):
    @wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for("login"))
        return view(**kwargs)
    return wrapped_view

def admin_required(view):
    @wraps(view)
    def wrapped_view(**kwargs):
        if g.admin == False:
            return redirect(url_for("index"))
        return view(**kwargs)
    return wrapped_view

@app.route("/")
def index():
    db = get_db()
    articles = db.execute("""SELECT * FROM articles;""")

    return render_template("index.html", articles = articles)


@app.route("/signup", methods=["GET", "POST"])
def signup():
    form = signUpForm()
    message=""
    if form.validate_on_submit():
        db = get_db()
        
        username = form.username.data
        password = form.password.data

        clash = db.execute("""SELECT * FROM users WHERE username = ?;""", (username,)).fetchone()
        if clash is not None:
            form.username.errors.append("Username is already in use.")
        else:
            db.execute("""INSERT INTO users (username, password)
                            VALUES (?, ?)""", (username, generate_password_hash(password)))
            db.commit()
            return redirect( url_for("login"))

    return render_template("signup.html", form=form, message=message)


@app.route("/login", methods=["GET", "POST"])
def login():
    form = loginForm()
    message=""
    if form.validate_on_submit():
        db = get_db()
        
        username = form.username.data
        password = form.password.data

        user_exists = db.execute("""SELECT * FROM users WHERE username = ?;""", (username,)).fetchone()
        user_isAdmin = db.execute("""SELECT is_admin FROM users WHERE username = ?;""", (username,)).fetchone()
        if user_exists is None:
            form.username.errors.append("User not found.")
        elif not check_password_hash(user_exists["password"], password):
            form.password.errors.append("Incorrect Password.")
        else:
            session.clear()
            session["username"] = username
            if user_isAdmin[0] == 1:
                session["is_admin"] = True
            return redirect( url_for("index") )

    return render_template("login.html", form=form, message=message)

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))

@app.route("/article/<int:article_id>", methods=["GET", "POST"])
def article(article_id):
    db = get_db()
    form = commentForm()
    g.currentArticle = article_id
    article_exists = db.execute("""SELECT * FROM articles WHERE id = ?;""", (article_id,)).fetchone()
    if article_exists is not None:
        article_content = article_exists["content"].split("\n")
        comments = db.execute("""SELECT * FROM comments WHERE article_id = ?
                                ORDER BY id DESC;""", (article_id,)).fetchall()

        if form.validate_on_submit():
            if "username" not in session:
                return redirect(url_for("login"))

            else:
                comment = form.comment.data
                current_date = datetime.today().strftime('%Y-%m-%d')
                db.execute("""INSERT INTO comments (article_id, username, comment, date)
                            VALUES (?, ?, ?, ?)""", (article_id, session["username"], comment, current_date))
                db.commit()
                return redirect(url_for("article", article_id=article_id))

        return render_template("article.html", article = article_exists, article_content = article_content, comments = comments, form = form)

    else:
        return redirect(url_for("index"))



# -- ADMIN FUNCTIONS -- #

@app.route("/admin_menu")
@admin_required
def admin_menu():
    return render_template("admin_menu.html")

@app.route("/users", methods=["GET", "POST"])
@admin_required
def users():
    db = get_db()
    users = db.execute("""SELECT * FROM users;""").fetchall()
    return render_template("users.html", users=users)

@app.route("/create_article", methods=["GET", "POST"])
@admin_required
def create_article():
    form = articleForm()

    if form.validate_on_submit():
        title = form.title.data
        content = form.content.data
        current_date = datetime.today().strftime('%Y-%m-%d')
        db = get_db()
        article_exists = db.execute("""SELECT * FROM articles WHERE title = ?;""", (title,)).fetchone()

        if article_exists is not None:
            form.title.errors.append("Article already exists!")
        
        else:
            db.execute("""INSERT INTO articles (title, content, date) VALUES (?, ?, ?);""", (title, content, current_date))
            db.commit()
            return redirect(url_for("index"))

    return render_template("create_article.html", form=form)

@app.route("/delete_article/<int:article_id>", methods=["GET", "POST"])
@admin_required
def delete_article(article_id):
    form = deleteForm()
    db = get_db()

    article_exists = db.execute("""SELECT * FROM articles WHERE id = ?;""", (article_id,)).fetchone()
    if article_exists is not None:
        if form.validate_on_submit():
            db.execute("""DELETE FROM articles WHERE id = ?;""", (article_id,))
            db.commit()
            return redirect(url_for('index'))
    
    else: return redirect(url_for('index'))

    return render_template("delete_article.html", form=form)