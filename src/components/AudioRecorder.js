import React, { Component } from 'react'
import { ReactMic } from 'react-mic';

class AudioRecorder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      record: false,
      downloadLinkURL: null
    }
  }

  startRecording = () => {
    this.setState({ record: true });
  }

  stopRecording = () => {
    this.setState({ record: false });
  }

  onData = (recordedBlob) => {
    console.log('chunk of real-time data is: ', recordedBlob);
  }

  onStop = (recordedBlob) => {
    console.log('recordedBlob is: ', recordedBlob);
    this.props.newRecording(new File([recordedBlob.blob], "recording.wav", {type: 'audio/wav', lastModified: Date.now()}))
    // this.props.newRecording(recordedBlob.blobURL)

  }

  onSave = (recordedBlob) => {
    this.setState({
        downloadLinkURL: recordedBlob.blobURL
    })
  }

  render() {
    return (
      <div>
        <ReactMic
          record={this.state.record}
          className="sound-wave"
          onStop={this.onStop}
          onData={this.onData}
          onSave={this.onSave}
          strokeColor="#000000"
          backgroundColor="#FFFFFF"
          mimeType="audio/wav"  />
        <button onClick={this.startRecording} type="button">Start</button>
        <button onClick={this.stopRecording} type="button">Stop</button>
        <a href={this.state.downloadLinkURL} download="recording.wav">Download</a>
      </div>
    );
  }
}

export default AudioRecorder