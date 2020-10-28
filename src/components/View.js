import React, { Component } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js'

var VIDEO_WINDOW = 5

class View extends Component {
  constructor(props) {
    super(props)
    this.move = 0.02
    this.delta = 0
    this.mouthControlActive = false
    this.currentFrame = 0

    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this.animate = this.animate.bind(this)
    this.onWindowResize = this.onWindowResize.bind(this)
    this.addCube = this.addCube.bind(this)
    this.addModel = this.addModel.bind(this)
    this.getMouthControl = this.getMouthControl.bind(this)
    this.processInput = this.processInput.bind(this)
    this.fetchInput = this.fetchInput.bind(this)
  }

  componentDidMount() {
    this.input = require('C:/Users/Gosia/Documents/CS/BSc thesis/web/src/components/pbwp6n.json');
    console.log(this.input)
    this.fetchInput()
    this.processInput()

    const width = window.innerWidth
    const height = window.innerHeight

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    )
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    var light = new THREE.HemisphereLight(0xffffff, 0x444444);
    this.scene.add(light)

    this.addModel()

    this.camera.position.z = 0.5
    this.camera.position.y = 0

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();

    this.renderer.setClearColor('#ffffff')
    this.renderer.setSize(width, height)

    window.addEventListener('resize', this.onWindowResize, false);

    this.mount.appendChild(this.renderer.domElement)

    this.audio = new Audio()
    this.audio.src='pbwp6n.wav'
    this.start()
  }


  addCube() {
    var geometry = new THREE.BoxGeometry(1, 1, 1)
    var material = new THREE.MeshBasicMaterial({ color: '#433F81' })
    var cube = new THREE.Mesh(geometry, material)
    this.scene.add(cube)
  }

  addModel() {
    var loader = new GLTFLoader();

    loader.load('model/head_shape_keys.gltf', gltf => {
      this.model = SkeletonUtils.clone(gltf.scene)
      console.log(this.model)
      this.scene.add(this.model)
      this.getMouthControl()
    }, undefined, function (error) {
      console.error(error);
    }
    )
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);

  }

  componentWillUnmount() {
    this.stop()
    this.mount.removeChild(this.renderer.domElement)
  }

  start() {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate)
    }
  }

  stop() {
    cancelAnimationFrame(this.frameId)
  }

  getMouthControl() {
    if (this.model) {
      this.model.traverse(o => {
        if (o.isSkinnedMesh && o.name == 'head') {
          this.mouthControl = o.morphTargetInfluences;
        }
      })
      this.mouthControlActive = true
    }
  }

  fetchInput() {
    fetch('/time').then(res => res.json()).then(data => {
      console.log(data);
    });
  }

  calculateDistance(point1, point2) {
    return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2))
  }

  processInput() {
    var newInput = []
    for (var i = 0; i <= this.input.length - VIDEO_WINDOW; i += VIDEO_WINDOW) {
      var k = Math.floor(VIDEO_WINDOW / 2);
      var newFrame = [];
      for (var j = 0; j < this.input[0].length - 1; j += 2) {
        var sumX = 0;
        var sumY = 0;
        for (var k = 0; k < VIDEO_WINDOW; k++) {
          sumX += this.input[i + k][j];
          sumY += this.input[i + k][j + 1];
        }
        newFrame.push([sumX / k, sumY / k]);
      }
      newInput.push(newFrame);
    }
    console.log(newInput);
    this.mouthHeight = []
    this.mouthWidth = []
    for (const frame of newInput) {
      this.mouthHeight.push(this.calculateDistance(frame[18], frame[14]))
      this.mouthWidth.push(this.calculateDistance(frame[16], frame[12]))
    }

    var heightMax = Math.max.apply(Math, this.mouthHeight)
    console.log(heightMax)
    this.mouthHeight.forEach(function (height, idx) {
      this[idx] = Math.round(height / heightMax * 100) / 100
    }, this.mouthHeight)
    console.log(this.mouthHeight)

    var widthMax = Math.max.apply(Math, this.mouthWidth)
    console.log(widthMax)
    this.mouthWidth.forEach(function (width, idx) {
      this[idx] = Math.round(width / widthMax * 100) / 100
    }, this.mouthWidth)
    var widthMin = Math.min.apply(Math, this.mouthWidth)

    this.mouthWidth.forEach(function (width, idx) {
      this[idx] -= widthMin
      this[idx] = Math.round(this[idx] * 100) / 100
    }, this.mouthWidth)
    console.log(this.mouthWidth)
  }

  animate() {
    if (this.mouthControlActive) {
      //   this.delta += this.move
      //   this.mouthControl[0] += this.move
      //   this.mouthControl[1] += this.move
      //   if(this.delta > 1.0 || this.delta < 0){
      //             this.move = -this.move
      //         }

      this.mouthControl[0] = this.mouthHeight[this.currentFrame]
      this.mouthControl[1] = this.mouthWidth[this.currentFrame]

      this.currentFrame += 1

      if (this.currentFrame >= this.mouthHeight.length) {
        this.currentFrame = 0
        this.audio.play()
      }
      
    }

    if (this.currentHeight === 0) {
      console.log("START")
    }

    setTimeout(() => {
      this.controls.update()
      this.renderScene()
      this.frameId = window.requestAnimationFrame(this.animate)
    }, 1000 / 25)   // 25 fps

  }

  renderScene() {
    this.renderer.render(this.scene, this.camera)
  }

  render() {
    return (
      <div
        ref={(mount) => { this.mount = mount }}
      />
    )
  }
}

export default View