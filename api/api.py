import os
import flask
import flask_sqlalchemy
import flask_praetorian
import flask_cors
from werkzeug.utils import secure_filename
from phoneme_to_viseme import viseme_char_map
from phoneme_decoder import timit_index_map
from tensorflow import keras
import numpy as np
from python_speech_features import mfcc
from librosa import load, resample
import time


# Backend database, cors initalization
db = flask_sqlalchemy.SQLAlchemy()
guard = flask_praetorian.Praetorian()
cors = flask_cors.CORS()


# A generic user model that might be used by an app powered by flask-praetorian
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, unique=True)
    password = db.Column(db.Text)
    roles = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True, server_default='true')

    @property
    def rolenames(self):
        try:
            return self.roles.split(',')
        except Exception:
            return []

    @classmethod
    def lookup(cls, username):
        return cls.query.filter_by(username=username).one_or_none()

    @classmethod
    def identify(cls, id):
        return cls.query.get(id)

    @property
    def identity(self):
        return self.id

    def is_valid(self):
        return self.is_active


# Initialize flask app for the example
app = flask.Flask(__name__, static_folder='../build', static_url_path=None)
app.debug = True
app.config['SECRET_KEY'] = 'top secret'
app.config['JWT_ACCESS_LIFESPAN'] = {'hours': 24}
app.config['JWT_REFRESH_LIFESPAN'] = {'days': 30}
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['UPLOAD_EXTENSIONS'] = {'.wav', '.mp3', '.mp4'}
app.config['STATIC_SOURCE'] = 'static'

try:
    model = keras.models.load_model(os.path.join(app.config['STATIC_SOURCE'],'BI_LSTM_512_30epochs_dropout01.h5'))
except OSError as e:
    model = None

SAMPLE_RATE = 16000

# Initialize the flask-praetorian instance for the app
guard.init_app(app, User)

# Initialize a local database for the example
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.getcwd(), 'database.db')}"
db.init_app(app)

# Initializes CORS so that the api_tool can talk to the example app
cors.init_app(app)

# Add users for the example
with app.app_context():
    db.create_all()
    if db.session.query(User).filter_by(username='1').count() < 1:
        db.session.add(User(
          username='1',
          password=guard.hash_password('1'),
          roles='admin'
		))
    db.session.commit()


# Set up some routes for the example
@app.route('/api/')
def home():
  	return {"Hello": "World"}, 200

@app.route('/api/time')
def get_current_time():
    return{'time': time.time()}

@app.route('/api/login', methods=['POST'])
def login():
    """
    Logs a user in by parsing a POST request containing user credentials and
    issuing a JWT token.
    .. example::
       $ curl http://localhost:5000/api/login -X POST \
         -d '{"username":"1","password":"1"}'
    """
    req = flask.request.get_json(force=True)
    username = req.get('username', None)
    password = req.get('password', None)
    user = guard.authenticate(username, password)
    ret = {'access_token': guard.encode_jwt_token(user)}
    return ret, 200

@app.route('/api/refresh', methods=['POST'])
def refresh():
    """
    Refreshes an existing JWT by creating a new one that is a copy of the old
    except that it has a refrehsed access expiration.
    .. example::
       $ curl http://localhost:5000/refresh -X GET \
         -H "Authorization: Bearer <your_token>"
    """
    print("refresh request")
    old_token = flask.request.get_data()
    new_token = guard.refresh_jwt_token(old_token)
    ret = {'access_token': new_token}
    return ret, 200


@app.route('/api/protected')
@flask_praetorian.auth_required
def protected():
    """
    A protected endpoint. The auth_required decorator will require a header
    containing a valid JWT
    .. example::
       $ curl http://localhost:5000/api/protected -X GET \
         -H "Authorization: Bearer <your_token>"
    """
    return {"message": f'protected endpoint (allowed user {flask_praetorian.current_user().username})'}


@app.route('/api/upload', methods=['POST'])
@flask_praetorian.auth_required
def file_upload():
    """
    Endpoint for receiving the uploaded file and returning the mapped model prediction
    """
    file = flask.request.files['file']
    filename = secure_filename(file.filename)
    print(file)
    print(filename)

    if filename != '':
        file_ext = os.path.splitext(filename)[1]
        print(file_ext)
        if file_ext not in app.config['UPLOAD_EXTENSIONS']:
            return flask.jsonify(status=404, message='Extension')

    destination = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(destination)

    if model == None:
        return flask.jsonify(status=404, message='Model')

    # Pass the file to the ml model
    audio_file, loaded_sample_rate = load(destination)
    # Change the frequency
    audio_file = resample(audio_file, loaded_sample_rate, SAMPLE_RATE)
    # Extract mfcc
    mfcc_coeff = mfcc(audio_file, SAMPLE_RATE)
    # Use the model
    prediction = model.predict(mfcc_coeff[np.newaxis,:,:])
    # Map from model encoding to phones
    phone_result = [timit_index_map[np.argmax(ph)] for ph in prediction[0]]
    # Map from phones to visemes
    viseme_result = [viseme_char_map[ph] for ph in phone_result]

    return flask.jsonify(status=200, result=viseme_result)

@app.route('/<path:path>')
def catch_all(path):
    print("Hello from catch all")
    if path != "" and os.path.exists(os.path.join('..','build',path)):
        return app.send_static_file(path)
    else:
        return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)