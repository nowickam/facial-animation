import React, { Component } from 'react'
import './View.css'
import  Model from './Model.js'
import axios from 'axios';

const AUDIO_FRAME = 10
const FPS = 60

class View extends Component {
  constructor(props) {
    super(props)
    this.state={
      file : undefined,
      animationStatus: 'STOP',
      visemes: undefined,
      inputProcessed : false
    }

    this.move = 0.02
    this.delta = 0

    this.modelControlActive = false

    this.currentFrame = 0

    this.lidMove = 0.1
    this.lidSpeed = 0.1
    this.lidWait = 1

    this.obamaRatio = [0.8, 0.8]

    this.processResponse = this.processResponse.bind(this)
    this.fetchInput = this.fetchInput.bind(this)
    this.playAnimation = this.playAnimation.bind(this)
    this.pauseAnimation = this.pauseAnimation.bind(this)
    this.stopAnimation = this.stopAnimation.bind(this)
    this.handleFile = this.handleFile.bind(this)
    this.sendFile = this.sendFile.bind(this)
  }

  componentDidMount() {
    // this.input = require('C:/Users/Gosia/Documents/CS/BSc thesis/web/src/components/obama2.json');
    this.fetchInput()
    // this.processInput()

    this.audio = new Audio()
    this.audio.loop = true
    // this.audio.src = 'obama.mp4'
  }

  componentDidUpdate(){
    // console.log("View "+this.state.animationStatus)
    // console.log("View "+this.state.mouthMoves)
  }


  fetchInput() {
    fetch('/time').then(res => res.json()).then(data => {
      console.log(data);
    });
  }

  calculateDistance(point1, point2) {
    return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2))
  }

  // processObama(input){
  //   var mouthHeight = []
  //   var mouthWidth = []

  //   for(var i=0; i<input.length-1; i+=2){
  //     mouthWidth.push(input[i]/this.obamaRatio[0]-1)
  //     mouthHeight.push(input[i+1]/this.obamaRatio[1])
  //   }

  //   this.setState({
  //     animationStatus: 'STOP',
  //     mouthMoves: [mouthWidth, mouthHeight],
  //     inputProcessed : true
  //   })
  // }

  processResponse(response){
    // console.log(response)
    const step = 100/FPS
    var result = [], maxViseme = undefined
    for(var i = 0; i < response.length; i += step){
      maxViseme = this.maxElement(response.slice(i, i+step))
      result.push(maxViseme)
    }
    this.setState({
      animationStatus: 'STOP',
      visemes : result,
      inputProcessed : true
    })
  }

  maxElement(array){
    if(array.length == 0)
        return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for(var i = 0; i < array.length; i++)
    {
        var el = array[i];
        if(modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;  
        if(modeMap[el] > maxCount)
        {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
  }


  playAnimation(){
    if((this.state.animationStatus == 'STOP' || this.state.animationStatus == 'PAUSE') && this.state.inputProcessed){
      this.audio.play()
      this.setState({animationStatus: 'PLAY'});
    }
  }

  stopAnimation(){
    if((this.state.animationStatus == 'PLAY' || this.state.animationStatus == 'PAUSE') && this.state.inputProcessed){
      this.audio.pause();
      this.audio.currentTime = 0;
      this.setState({animationStatus: 'STOP'});
    }
  }

  pauseAnimation(){
    if((this.state.animationStatus == 'PLAY') && this.state.inputProcessed){
      this.audio.pause();
      this.setState({animationStatus: 'PAUSE'});
    }
  }

  handleFile(event){
    if(event.target.files.length > 0)
    {
      var fileData = event.target.files[0];
      var fileSource = URL.createObjectURL(fileData)

      this.setState({file : fileData, inputProcessed : false})
      this.audio.src = fileSource
    }
  }

  async sendFile(){
    if(this.state.file){
      const data = new FormData();
      data.append('file', this.state.file)
      this.setState({inputProcessed : undefined})

      const res = await axios.post("http://localhost:5000/upload", data, {});
      this.processResponse(res.data);
    }
  }

  render() {
    return (
      <div>
        <input id="upload-input" className="upload" type="file" accept="audio/wav, audio/mp3" onChange={this.handleFile} multiple={false}/>
        <button id="upload-button" className="upload" onClick={this.sendFile}>Upload</button>
        {this.state.inputProcessed == undefined && <div id="upload-text" className="upload">Loading...</div>}
        <Model id="model" animationStatus={this.state.animationStatus} visemes = {this.state.visemes}/>
        <button id="play" className="player" onClick={this.playAnimation}>Play</button>
        <button id="pause" className="player" onClick={this.pauseAnimation}>Pause</button>
        <button id="stop" className="player" onClick={this.stopAnimation}>Stop</button>
      </div>
    )
  }
}

export default View