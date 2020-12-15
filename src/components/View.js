import React, { Component } from "react";
import "./View.css";
import Model from "./Model.js";
import axios from "axios";
import AudioRecorder from "./AudioRecorder.js";
import "./Slider.css";
import { Transition } from "react-transition-group";
import { login, authFetch, useAuth, logout } from "../auth";
import { AUDIO_FRAME, FPS, transitionStyles, defaultStyle } from '../Config.js'

class View extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: undefined,
      animationStatus: "STOP",
      visemes: undefined,
      inputProcessed: false,
      sliderValue: 0.4,
      popup: false,
      mounted: false,
      popupText: "",
    };

    this.move = 0.02;
    this.delta = 0;

    this.modelControlActive = false;

    this.currentFrame = 0;

    this.lidMove = 0.1;
    this.lidSpeed = 0.1;
    this.lidWait = 1;

    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.stop = this.stop.bind(this);
    this.processResponse = this.processResponse.bind(this);
    this.fetchInput = this.fetchInput.bind(this);
    this.playAnimation = this.playAnimation.bind(this);
    this.pauseAnimation = this.pauseAnimation.bind(this);
    this.stopAnimation = this.stopAnimation.bind(this);
    this.handleFile = this.handleFile.bind(this);
    this.sendFile = this.sendFile.bind(this);
    this.handleSlider = this.handleSlider.bind(this);
    this.handleRecording = this.handleRecording.bind(this);
    this.openPopup = this.openPopup.bind(this);
    this.closePopup = this.closePopup.bind(this);
    this.modelLoaded = this.modelLoaded.bind(this)
  }

  componentDidMount() {
    this.fetchInput();

    this.audio = new Audio();
    this.audio.loop = true;
  }

  componentDidUpdate() {}

  fetchInput() {
    fetch("/api/time")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
  }

  calculateDistance(point1, point2) {
    return Math.sqrt(
      Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2)
    );
  }

  processResponse(response) {
    const step = 1000 / AUDIO_FRAME / FPS;
    var result = [],
      frame = undefined,
      j = undefined;
    for (var i = 0; i < response.length; i += step) {
      // change the frequency of the visemes from 100Hz to 60Hz
      frame = response.slice(i, i + step)[0];
      result.push(frame);
      j = result.length - 1;
      if (j >= 3) {
        // eliminate singular visemes
        if (result[j - 2] !== result[j - 1] && result[j - 1] !== result[j]) {
          result[result.length - 2] = result[result.length - 3];
        }
      }
      if (j >= 4) {
        // eliminate double visemes
        if (result[j] !== result[j - 1]) {
          if (
            !(
              result[j - 1] === result[j - 2] && result[j - 2] === result[j - 3]
            )
          ) {
            result[j - 1] = result[j];
            result[j - 2] = result[j - 3];
          }
        }
      }
    }
    this.setState({
      visemes: result,
      inputProcessed: true,
    });
  }

  maxElement(array) {
    if (array.length === 0) return null;
    var modeMap = {};
    var maxEl = array[0],
      maxCount = 1;
    for (var i = 0; i < array.length; i++) {
      var el = array[i];
      if (modeMap[el] == null) modeMap[el] = 1;
      else modeMap[el]++;
      if (modeMap[el] > maxCount) {
        maxEl = el;
        maxCount = modeMap[el];
      }
    }
    return maxEl;
  }

  stop() {
    if (
      this.state.animationStatus === "PLAY" ||
      this.state.animationStatus === "PAUSE"
    ) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.setState({ animationStatus: "STOP" });
    }
  }

  play() {
    if (
      this.state.animationStatus === "STOP" ||
      this.state.animationStatus === "PAUSE"
    ) {
      this.audio.play();
      this.setState({ animationStatus: "PLAY" });
    }
  }

  pause() {
    if (this.state.animationStatus === "PLAY") {
      this.audio.pause();
      this.setState({ animationStatus: "PAUSE" });
    }
  }

  playAnimation() {
    if (!this.state.inputProcessed) {
      this.openPopup("Upload the audio file to the server!");
    } else {
      this.play();
    }
  }

  stopAnimation() {
    if (!this.state.inputProcessed) {
      this.openPopup("Upload the audio file to the server!");
    } else {
      this.stop();
    }
  }

  pauseAnimation() {
    if (!this.state.inputProcessed) {
      this.openPopup("Upload the audio file to the server!");
    } else {
      this.pause();
    }
  }

  handleFile(event) {
    if (event.target.files.length > 0) {
      var fileData = event.target.files[0];
      var fileSource = URL.createObjectURL(fileData);

      this.stop();
      this.setState({
        file: fileData,
        inputProcessed: false,
        filename: fileData.name,
      });
      this.audio.src = fileSource;
    }
  }

  handleRecording(recording) {
    this.stop();
    this.setState({
      file: recording,
      inputProcessed: false,
      filename: "Recording",
    });
    this.audio.src = URL.createObjectURL(recording);

    console.log(this.state.file, this.audio.src);
  }

  async sendFile() {
    if (this.state.file) {
      const data = new FormData();
      data.append("file", this.state.file);

      this.setState({ inputProcessed: undefined });
      this.stop();

      authFetch("/api/upload", { method: "POST", body: data })
        .then((res) => {
          if (res.status === 401) {
            this.setState({ inputProcessed: false });
            this.openPopup("Sorry you aren't authorized!");
            return null;
          } else if (res.status !== 200) {
            this.setState({ inputProcessed: false });
            this.openPopup("Server failure!");
            return null;
          }
          return res.json();
        })
        .then((res) => {
          if (res) {
            if (res.status === 200) {
              this.processResponse(res.result);
            } else if (res.message === "Extension") {
              this.setState({ inputProcessed: false });
              this.openPopup(
                "Incorrect extension! Upload .wav and .mp3 files."
              );
            } else if (res.message === "Model") {
              this.setState({ inputProcessed: false });
              this.openPopup("Model failure!");
            }
          }
        });
    } else {
      this.openPopup("Choose a file!");
    }
  }

  handleSlider(event) {
    this.setState({
      sliderValue: event.target.value,
    });
  }

  openPopup(text) {
    this.setState({
      popup: true,
      popupText: text,
    });
  }

  closePopup() {
    this.setState({
      popup: false,
      popupText: "",
    });
  }

  modelLoaded(){
    this.setState({
      mounted: true
    })
  }

  render() {
    return (
      <Transition timeout={500} in={this.state.mounted}>
      {(state) => (
        <div
          style={{
            ...defaultStyle,
            ...transitionStyles[state],
          }}
        >
      <div id="view-container">
        <Transition timeout={300} in={this.state.popup}>
          {(state) => (
            <div
              style={{
                ...defaultStyle,
                ...transitionStyles[state],
              }}
            >
              {this.state.popup && (
                <div className="background">
                  <div className="popup">
                    <div id="popup-text">{this.state.popupText}</div>
                    <button id="popup-close" className="styled-button" onClick={this.closePopup}>
                      X
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Transition>

        <Transition timeout={300} in={this.state.inputProcessed === undefined}>

          {(state) => (
            <div
              style={{
                ...defaultStyle,
                ...transitionStyles[state],
              }}
            >
              {this.state.inputProcessed === undefined && (
                <div className="background">
                  <div className="loader"></div>
                </div>
              )}
            </div>
          )}
        </Transition>
        <button
            id="logout-button"
            className="styled-button right"
            onClick={logout}>
              Logout
          </button>
        <div className="top vertical margin-left">
          <AudioRecorder
            id="audio-recorder"
            newRecording={this.handleRecording}
          />
          <label className="horizontal">
            <div className="styled-button">Choose file</div>
            <div id="chosen-file">{this.state.filename}</div>
            <input
              id="choose-file"
              type="file"
              accept="audio/wav, audio/mp3"
              onChange={this.handleFile}
              multiple={false}
            />
          </label>
          <button
            id="upload-button"
            className="styled-button narrow"
            onClick={this.sendFile}
          >
            Upload
          </button>
        </div>
        <Model
          id="model"
          animationStatus={this.state.animationStatus}
          visemes={this.state.visemes}
          sliderValue={this.state.sliderValue}
          mounted={this.modelLoaded}
        />
        <div className="bottom horizontal">
          <button
            id="play"
            className="player styled-button"
            onClick={this.playAnimation}
          >
            Play
          </button>
          <button
            id="pause"
            className="player styled-button"
            onClick={this.pauseAnimation}
          >
            Pause
          </button>
          <button
            id="stop"
            className="player styled-button"
            onClick={this.stopAnimation}
          >
            Stop
          </button>
          </div>
          <div id="slider-value">{this.state.sliderValue}</div>
          <input
            type="range"
            id="slider"
            min={0.1}
            max={1}
            value={this.state.sliderValue}
            step={0.05}
            onChange={this.handleSlider}
          />
      </div>
      </div>
    )}
    </Transition>
    );
  }
}

export default View;
