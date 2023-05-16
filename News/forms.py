from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, PasswordField, TextAreaField
from wtforms.validators import InputRequired, EqualTo, Length

class signUpForm(FlaskForm):
    username = StringField("Username:", validators=[InputRequired()])
    password = PasswordField("Password:", validators=[InputRequired()])
    confirm_password = PasswordField("Confirm Password:", validators=[InputRequired(), EqualTo("password")])
    submit = SubmitField("Submit")

class loginForm(FlaskForm):
    username = StringField("Username:", validators=[InputRequired()])
    password = PasswordField("Password:", validators=[InputRequired()])
    submit = SubmitField("Submit")

class articleForm(FlaskForm):
    title = StringField("Title:", validators=[InputRequired()])
    content = TextAreaField("Content:", validators=[InputRequired()])
    submit = SubmitField("Submit")

class commentForm(FlaskForm):
    comment = StringField("Make a comment:", validators=[InputRequired(), Length(max=128, message = "128 character limit.")])
    submit = SubmitField("Post Comment")

class deleteForm(FlaskForm):
    submit = SubmitField("Delete article? This can't be undone!")