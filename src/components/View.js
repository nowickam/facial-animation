import React, { Component } from 'react'
import './View.css'
import Model from './Model.js'
import axios from 'axios';
import AudioRecorder from './AudioRecorder.js'
import './Slider.css'
import { Transition } from 'react-transition-group';

const AUDIO_FRAME = 10
const FPS = 60

const defaultStyle = {
  transition: `opacity ${300}ms ease-in-out`,
  opacity: 0,
}

const transitionStyles = {
  entering: { opacity: 1 },
  entered:  { opacity: 1 },
  exiting:  { opacity: 0 },
  exited:  { opacity: 0 },
};

class View extends Component {
  constructor(props) {
    super(props)
    this.state = {
      file: undefined,
      animationStatus: 'STOP',
      visemes: undefined,
      inputProcessed: false,
      sliderValue: 0.4,
      popup: false,
      popupText: '',
    }

    this.move = 0.02
    this.delta = 0

    this.modelControlActive = false

    this.currentFrame = 0

    this.lidMove = 0.1
    this.lidSpeed = 0.1
    this.lidWait = 1

    this.processResponse = this.processResponse.bind(this)
    this.fetchInput = this.fetchInput.bind(this)
    this.playAnimation = this.playAnimation.bind(this)
    this.pauseAnimation = this.pauseAnimation.bind(this)
    this.stopAnimation = this.stopAnimation.bind(this)
    this.handleFile = this.handleFile.bind(this)
    this.sendFile = this.sendFile.bind(this)
    this.handleSlider = this.handleSlider.bind(this)
    this.handleRecording = this.handleRecording.bind(this)
    this.openPopup = this.openPopup.bind(this)
    this.closePopup = this.closePopup.bind(this)
  }

  componentDidMount() {
    this.fetchInput()

    this.audio = new Audio()
    this.audio.loop = true
    this.setState({
      mounted: true
    })
  }

  componentDidUpdate() {

  }


  fetchInput() {
    fetch('/time').then(res => res.json()).then(data => {
      console.log(data);
    });
  }

  calculateDistance(point1, point2) {
    return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2))
  }

  processResponse(response) {
    // console.log(response)
    const step = 1000 / AUDIO_FRAME / FPS
    var result = [], maxViseme = undefined
    for (var i = 0; i < response.length; i += step) {
      maxViseme = this.maxElement(response.slice(i, i + step))
      result.push(maxViseme)
    }
    this.setState({
      animationStatus: 'STOP',
      visemes: result,
      inputProcessed: true
    })
  }

  maxElement(array) {
    if (array.length === 0)
      return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for (var i = 0; i < array.length; i++) {
      var el = array[i];
      if (modeMap[el] == null)
        modeMap[el] = 1;
      else
        modeMap[el]++;
      if (modeMap[el] > maxCount) {
        maxEl = el;
        maxCount = modeMap[el];
      }
    }
    return maxEl;
  }


  playAnimation() {
    if ((this.state.animationStatus === 'STOP' || this.state.animationStatus === 'PAUSE') && this.state.inputProcessed) {
      this.audio.play()
      this.setState({ animationStatus: 'PLAY' });
    }
  }

  stopAnimation() {
    if ((this.state.animationStatus === 'PLAY' || this.state.animationStatus === 'PAUSE') && this.state.inputProcessed) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.setState({ animationStatus: 'STOP' });
    }
  }

  pauseAnimation() {
    if ((this.state.animationStatus === 'PLAY') && this.state.inputProcessed) {
      this.audio.pause();
      this.setState({ animationStatus: 'PAUSE' });
    }
  }

  handleFile(event) {
    if (event.target.files.length > 0) {
      var fileData = event.target.files[0];
      var fileSource = URL.createObjectURL(fileData)

      this.setState({ file: fileData, inputProcessed: false })
      this.audio.src = fileSource
    }
  }

  handleRecording(recording) {
    this.setState({ file: recording, inputProcessed: false })
    this.audio.src = URL.createObjectURL(recording)

    console.log(this.state.file, this.audio.src)
  }

  async sendFile() {
    if (this.state.file) {
      const data = new FormData();
      data.append('file', this.state.file)
      this.setState({ inputProcessed: undefined })

      const res = await axios.post("http://localhost:5000/upload", data, {});
      // response obtained
      if (res.status === 200) {
        if (res.data.status === 200) {
          this.processResponse(res.data.result);
        }
        else if (res.data.message === "Extension") {
          this.setState({ inputProcessed: false })
          this.openPopup("Incorrect extension! Upload .wav and .mp3 files.")
        }
        else if (res.data.message === "Model") {
          this.setState({ inputProcessed: false })
          this.openPopup("Model failure!")
        }
      }
      // no response
      else {
        this.setState({ inputProcessed: false })
        this.openPopup("No connection with the server!")
      }
    }
    else {
      this.openPopup("Choose a file!")
    }
  }

  handleSlider(event) {
    this.setState({
      sliderValue: event.target.value
    })
  }

  openPopup(text) {
    this.setState({
      popup: true,
      popupText: text
    })
  }

  closePopup() {
    this.setState({
      popup: false,
      popupText: ''
    })
  }

  render() {
    return (
      <div id="view-container">
        <Transition
          in={this.state.popup}>
            {state => (
              <div style={{
                ...defaultStyle,
                ...transitionStyles[state]
              }}>
                <div className="background">
                  <div className="popup">
                    <div>{this.state.popupText}</div>
                    <button id="popup-close" onClick={this.closePopup}>X</button>
                  </div>
                </div>
                </div>
            )}
        </Transition >
        <Transition 
          in={this.state.inputProcessed === undefined}>
            {state => (
              <div style={{
                ...defaultStyle,
                ...transitionStyles[state]
              }}>
                <div className="background">
                  <div className="loader">
                  </div>
                </div> 
              </div>
            )}
        </Transition >
        <div className="top vertical">
          <AudioRecorder newRecording={this.handleRecording} />
          <label className="styled-button narrow">
            <div>Choose file</div>
            <input type="file" accept="audio/wav, audio/mp3" onChange={this.handleFile} multiple={false} />
          </label>
          <button id="upload-button" className="styled-button narrow" onClick={this.sendFile}>Upload</button>
        </div>
        <Model id="model" animationStatus={this.state.animationStatus} visemes={this.state.visemes} sliderValue={this.state.sliderValue} />
        <div className="bottom horizontal">
          <button id="play" className="player styled-button" onClick={this.playAnimation}>Play</button>
          <button id="pause" className="player styled-button" onClick={this.pauseAnimation}>Pause</button>
          <button id="stop" className="player styled-button" onClick={this.stopAnimation}>Stop</button>
          <span className="spacer" />
          <div id="slider-container" className="player">
            <input type="range" id="slider" min={0.1} max={1} value={this.state.sliderValue} step={0.05} onChange={this.handleSlider} />
            <div>{this.state.sliderValue}</div>
          </div>
        </div>
      </div>
    )
  }
}

export default View