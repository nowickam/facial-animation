from flask import Flask, request, abort, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS, cross_origin
import time
import os
import json
import pickle
from users import load_user
from phoneme_to_viseme import timit_char_map
from phoneme_decoder import timit_index_map
from tensorflow import keras
import numpy as np
from python_speech_features import mfcc
from librosa import load, resample


app = Flask(__name__)

CORS(app, expose_headers='Authorization')

app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['UPLOAD_EXTENSIONS'] = {'.wav', '.mp3', '.mp4'}
app.config['STATIC_SOURCE'] = 'static'

try:
    model = keras.models.load_model(os.path.join(app.config['STATIC_SOURCE'],'anylength_1024lstm_55acc.h5'))
except OSError as e:
    model = None

SAMPLE_RATE = 16000

@app.route('/api/time')
def get_current_time():
    return{'time': time.time()}

@app.route('/api/upload', methods=['POST'])
def file_upload():
    # save the file
    print("READ")
    file = request.files['file'] 
    filename = secure_filename(file.filename)
    print(file)
    print(filename)

    if filename != '':
        file_ext = os.path.splitext(filename)[1]
        print(file_ext)
        if file_ext not in app.config['UPLOAD_EXTENSIONS']:
            return jsonify(status=404, message='Extension')

    destination = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(destination)

    if model == None:
        return jsonify(status=404, message='Model')

    # pass the file to the ml model
    audio_file, loaded_sample_rate = load(destination)
    audio_file = resample(audio_file, loaded_sample_rate, SAMPLE_RATE)
    mfcc_coeff = mfcc(audio_file, SAMPLE_RATE)
    prediction = model.predict(mfcc_coeff[np.newaxis,:,:])
    phoneme_result = [timit_index_map[np.argmax(ph)] for ph in prediction[0]]
    viseme_result = [timit_char_map[ph] for ph in phoneme_result]

    return jsonify(status=200, result=viseme_result)


@app.route('/api/login', methods=['GET', 'POST'])
def login():
    user = load_user(request.get_json(force=True)['username'])
    if user is None or not user.verify_password(request.get_json(force=True)['password']):
        return jsonify(status=404, message='Wrong username of password')
    return jsonify(status=200, username=user.name)


if __name__ == "__main__":
    app.run(debug=True)