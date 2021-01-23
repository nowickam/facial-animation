# Audio driven facial animation

Bachelor thesis project providing an interactive web application with the core functionality of uploading an audio file with human speech and displaying the corresponding lip movements on the provided avatar basing on the output of an LSTM neural network model on the remote server.

## Quickstart

1. Press the icon in the top-left corner to display the menu.
2. <b>Choose file</b> to upload a <b>wav</b> or <b>mp3</b> audio file with speech. Press <b>Record</b> to record the speech in real-time.
3. Press <b>Upload</b> to send the speech recording to the server.
4. When the model is performing the computations on the server, a loading spinner is displayed. Wait until it disappears.
5. The <b>player</b> options in the bottom-left corner handle the animation. Change the intensity of the avatar's expression with the <b>slider</b>.

![image](https://user-images.githubusercontent.com/49707233/105201992-c91c2980-5b41-11eb-9c3f-6c266a8e274e.png)


## Public access

You can access the web application through the link: https://facialanimation.page/. Contact one of the contributors of the project to gain the valid credentials.

## Running locally

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `yarn start-api-win`
### `yarn start-api-mac`

Runs backend on the http://localhost:5000 port.
First you need to prepare virtual environment using commands:
#### Windows
```
cd api
python3 -m venv venv
. venv\Scripts\activate
pip install flask python-dotenv
```

#### macOS
```
cd api
python3 -m venv venv
source venv/bin/activate
pip install flask python-dotenv
```

### `npm test`

Launches the unit tests for the presentation module.

### See the Model preparation on google colab

https://drive.google.com/file/d/1T6DWKNVQZMKijlfK4iaIJit4xSIvozJ8/view?usp=sharing

## Authors

Małgorzata Nowicka and Filip Zawadka
