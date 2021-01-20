import React, { Component } from "react";
import "./css/AudioRecorder.css";
import { bgColor, fontColor } from '../Config.js'
import { Transition } from "react-transition-group";
// import { ReactMic } from "react-mic";
import {transitionStyles, defaultStyle, darkFocus } from "../Config.js";

let ReactMic;
class AudioRecorder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      record: false,
      downloadLinkURL: null,
      timer: "00:00",
    };
    if (!ReactMic) {
      try {
        ReactMic = require("react-mic").ReactMic;
      } catch (err) {
        console.log(err);
      }
    }
  }

  startRecording = () => {
    setInterval(this.setTimer, 1000)
    this.setState({ record: true, start: Date.now() });
  };

  setTimer = () => {
    var seconds = Math.floor((Date.now() - this.state.start)/1000);
    var minutes = Math.floor(seconds/60);
    var time = "";
    if(seconds<10){
      seconds = "0"+seconds
    }
    if(minutes > 0){
      if(minutes>9){
        time = minutes+":"+seconds
      }
      else{
        time = "0"+minutes+":"+seconds
      }
    }
    else{
      time="00:"+seconds;
    }
    this.setState({timer: time})
  }

  stopRecording = () => {
    clearInterval();
    this.setState({ record: false, timer: "00:00" });
  };

  onData = (recordedBlob) => {
  };

  onStop = (recordedBlob) => {
    console.log("recordedBlob is: ", recordedBlob);
    this.props.newRecording(
      new File([recordedBlob.blob], "recording.wav", {
        type: "audio/wav",
        lastModified: Date.now(),
      })
    );
  };

  onSave = (recordedBlob) => {
    this.setState({
      downloadLinkURL: recordedBlob.blobURL,
    });
  };

  render() {
    return (
      <div id="recorder-container">
        <div className="horizontal-recorder">
          {!this.state.record &&
        <button
          className="record-button record"
          onClick={this.startRecording}
          type="button"
        >
          Record
        </button>
  }
{this.state.record &&
        <button
          className="record-button record"
          onClick={this.stopRecording}
          type="button"
        >
          Stop recording
        </button>}
        </div>
        <Transition timeout={300} in={!this.state.record && this.state.downloadLinkURL}>
        {(state) => (
          <div
            style={{
              ...defaultStyle,
              ...transitionStyles[state],
            }}
          >
        <a
          className="record download"
          href={this.state.downloadLinkURL}
          download="recording.wav"
        >
          Download
        </a>
        </div>
        )}
      </Transition>
        <Transition timeout={300} in={this.state.record}>
        {(state) => (
          <div
            style={{
              ...defaultStyle,
              ...transitionStyles[state],
            }}
          >
        <ReactMic
          record={this.state.record}
          className="sound-wave visualization"
          onStop={this.onStop}
          onData={this.onData}
          onSave={this.onSave}
          mimeType="audio/wav"
          width={0}
          height={0}
          noiseSuppression={true}
        />
        <div id="timer">{this.state.timer}</div>
        </div>
        )}
      </Transition>
      </div>
    );
  }
}

export default AudioRecorder;
