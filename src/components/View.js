import React, { Component } from "react";
import "./css/View.css";
import Model from "./Model.js";
import AudioRecorder from "./AudioRecorder.js";
import "./css/Slider.css";
import "./css/Toggle.css";
import "./css/Progress.css";
import { Transition } from "react-transition-group";
import { login, authFetch, useAuth, logout } from "../auth";
import {
  AUDIO_FRAME,
  FPS,
  transitionStyles,
  defaultStyle,
  defaultStyleMount,
  darkBg,
  darkFont,
  darkFocus,
  lightBg,
  lightFont,
  lightFocus,
  darkBack1,
  darkBack2,
  lightBack1,
  lightBack2,
} from "../Config.js";

class View extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: undefined,
      animationStatus: "STOP",
      visemes: undefined,
      inputProcessed: false,
      sliderValue: 0.55,
      popup: false,
      mounted: false,
      popupText: "",
      menu: false,
      progress: 0,
    };

    this.theme = this.props.theme;
    this.themeSlider = React.createRef();

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
    this.modelLoaded = this.modelLoaded.bind(this);
    this.setTheme = this.setTheme.bind(this);
    this.themeHandler = this.themeHandler.bind(this);
    this.showMenu = this.showMenu.bind(this);
    this.setProgress = this.setProgress.bind(this);
  }

  componentDidMount() {
    this.fetchInput();

    if (this.theme === "light" && this.themeSlider.current)
      this.themeSlider.current.checked = true;
    this.setTheme(this.theme);
    this.audio = new Audio();
    this.audio.loop = false;
  }

  componentDidUpdate() {}

  fetchInput() {
    // test server fetch
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
    // process the viseme list from the server
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
    // stops the audio file and corresponding animation
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
    // plays the audio file and corresponding animation
    if (
      this.state.animationStatus === "STOP" ||
      this.state.animationStatus === "PAUSE"
    ) {
      this.audio.play();
      this.setState({ animationStatus: "PLAY" });
    }
  }

  pause() {
    // pauses the audio file and corresponding animation
    if (this.state.animationStatus === "PLAY") {
      this.audio.pause();
      this.setState({ animationStatus: "PAUSE" });
    }
  }

  playAnimation() {
    // handler for Play button
    if (!this.state.inputProcessed) {
      this.openPopup("Upload the audio file to the server!");
    } else {
      this.play();
    }
  }

  stopAnimation() {
    // handler for Stop button
    if (!this.state.inputProcessed) {
      this.openPopup("Upload the audio file to the server!");
    } else {
      this.stop();
    }
  }

  pauseAnimation() {
    // handler for Pause button
    if (!this.state.inputProcessed) {
      this.openPopup("Upload the audio file to the server!");
    } else {
      this.pause();
    }
  }

  handleFile(event) {
    // registers the newly uploaded file
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
    // registers the newly recorded file
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
    // send the request to the server with the current audio file
    if (this.state.file) {
      // prepare audio file for request
      const data = new FormData();
      data.append("file", this.state.file);

      this.setState({ inputProcessed: undefined });
      this.stop();

      // authenticated fetch by JWT
      authFetch("/api/upload", { method: "POST", body: data })
        // handle the response
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

  mapSliderValue(x) {
    return 0.5 + 0.5 * x;
  }

  handleSlider(event) {
    this.setState({
      sliderValue: event.target.value,
    });
  }

  showMenu() {
    // toggle the menu view
    this.setState(
      {
        menu: !this.state.menu,
      },
      () => {
        if (this.state.menu) {
          if (this.theme === "light" && this.themeSlider.current)
            this.themeSlider.current.checked = true;
          else if (this.theme === "dark" && this.themeSlider.current) {
            this.themeSlider.current.checked = false;
          }
        }
      }
    );
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

  modelLoaded() {
    this.setState({
      mounted: true,
    });
  }

  themeHandler(e) {
    if (e.target.checked) this.setTheme("light");
    else this.setTheme("dark");
  }

  setProgress(p) {
    this.setState({
      progress: p,
    });
  }

  setTheme(newTheme) {
    // set the colors corresponding to the current theme
    if (newTheme !== this.theme) {
      this.theme = newTheme;
    }
    this.props.setTheme(this.theme);
    if (this.theme === "light") {
      document.body.style.setProperty("--primary", lightBg);
      document.body.style.setProperty("--secondary", lightFont);
      document.body.style.setProperty("--focus", lightFocus);
      document.body.style.setProperty("--back1", lightBack1);
      document.body.style.setProperty("--back2", lightBack2);
    } else {
      document.body.style.setProperty("--primary", darkBg);
      document.body.style.setProperty("--secondary", darkFont);
      document.body.style.setProperty("--focus", darkFocus);
      document.body.style.setProperty("--back1", darkBack1);
      document.body.style.setProperty("--back2", darkBack2);
    }
  }

  render() {
    return (
      <Transition timeout={500} in={this.state.mounted}>
        {(state) => (
          <div
            style={{
              ...defaultStyleMount,
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
                          <button
                            id="popup-close"
                            className="styled-button"
                            onClick={this.closePopup}
                          >
                            X
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Transition>

              <Transition
                timeout={300}
                in={this.state.inputProcessed === undefined}
              >
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

              <Transition timeout={300} in={this.state.infoPopup}>
                {(state) => (
                  <div
                    style={{
                      ...defaultStyle,
                      ...transitionStyles[state],
                    }}
                  >
                    {this.state.infoPopup && (
                      <div className="background">
                        <div className="popup">
                          <div id="info-head">
                            Audio-driven facial animation
                          </div>
                          <div id="info-authors">
                            Authors: Małgorzata Nowicka, Filip Zawadka
                          </div>
                          <div id="info-text">
                            This application is a realization of the author's
                            Bachelor's thesis project at the Warsaw University
                            of Technology. It generates animation for given
                            speech recording. The application integrates the
                            trained long short-term memory neural network model,
                            residing on the remote server.
                          </div>
                          <div id="info-inst-head">Instruction:</div>
                          <div id="info-inst">
                            Press the icon in the top-left corner to display the
                            menu.
                          </div>
                          <div id="info-inst">
                            Press <b>Choose file</b> to upload a <b>wav</b> or{" "}
                            <b>mp3</b> audio file with speech. Press{" "}
                            <b>Record</b> to record the speech in real-time.
                          </div>
                          <div id="info-inst">
                            Press <b>Upload</b> to send the speech recording to
                            the server.
                          </div>
                          <div id="info-inst">
                            When the model is performing the computations on the
                            server, a loading spinner is displayed. Wait until
                            it disappears.
                          </div>
                          <div id="info-inst">
                            The <b>player</b> options in the bottom-right corner
                            handle the animation. Change the intensity of the
                            avatar's expression with the <b>slider</b>.
                          </div>
                          <button
                            id="popup-close"
                            className="styled-button"
                            onClick={(e) => this.setState({ infoPopup: false })}
                          >
                            X
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Transition>

              <button
                id="info-button"
                className="styled-button"
                onClick={(e) => this.setState({ infoPopup: true })}
              >
                &#9432;
              </button>
              <button
                id="logout-button"
                className="styled-button right"
                onClick={logout}
              >
                <i className="fa fa-power-off logout"></i>
              </button>

              <div id="menu-icon" onClick={this.showMenu}>
                <div className="menu-bar"></div>
                <div className="menu-bar"></div>
                <div className="menu-bar"></div>
              </div>

              <Transition timeout={300} in={this.state.menu}>
                {(state) => (
                  <div
                    style={{
                      ...defaultStyle,
                      ...transitionStyles[state],
                    }}
                  >
                    {this.state.menu && (
                      <div id="main-container">
                        <label class="switch">
                          <div id="dark">Dark</div>
                          <div className="span"></div>
                          <input
                            type="checkbox"
                            onChange={this.themeHandler}
                            ref={this.themeSlider}
                          />
                          <span class="slider round"></span>
                          <div>Light</div>
                        </label>
                        <label id="choose-file" className="horizontal vert">
                          <div className="styled-button">Choose file</div>

                          <input
                            id="choose-file"
                            type="file"
                            accept="audio/wav, audio/mp3"
                            onChange={this.handleFile}
                            multiple={false}
                          />
                        </label>
                        <div className="recorder">
                          <AudioRecorder
                            id="audio-recorder"
                            newRecording={this.handleRecording}
                            theme={this.theme}
                          />
                        </div>

                        <div id="chosen-file">{this.state.filename}</div>
                        <button
                          id="upload-button"
                          className="styled-button narrow"
                          onClick={this.sendFile}
                        >
                          Upload
                        </button>
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
                        <div id="exp-int">
                          Expression <br /> intensity:
                        </div>
                        <div id="slider-value">{this.state.sliderValue}</div>
                        <input
                          type="range"
                          id="slider"
                          min={0}
                          max={1}
                          value={this.state.sliderValue}
                          step={0.05}
                          onChange={this.handleSlider}
                        />
                        {!this.state.popup && (
                          <progress
                            id="progress"
                            max="1"
                            value={this.state.progress}
                          ></progress>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Transition>
              <Model
                id="model"
                animationStatus={this.state.animationStatus}
                visemes={this.state.visemes}
                sliderValue={this.mapSliderValue(this.state.sliderValue)}
                mounted={this.modelLoaded}
                theme={this.theme}
                setProgress={this.setProgress}
                audio={this.audio}
                stopAnimation={this.stopAnimation}
              />
            </div>
          </div>
        )}
      </Transition>
    );
  }
}

export default View;
