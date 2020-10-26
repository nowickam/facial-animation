import React, { Component } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js'

class View extends Component {
  constructor(props) {
    super(props)
    this.move = 0.02
    this.delta = 0
    this.mouthControlActive = false
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this.animate = this.animate.bind(this)
    this.onWindowResize = this.onWindowResize.bind(this)
    this.addCube = this.addCube.bind(this)
    this.addModel = this.addModel.bind(this)
    this.getMouthControl = this.getMouthControl.bind(this)
  }

  componentDidMount() {
    this.json = require('C:/Users/Gosia/Documents/CS/BSc thesis/web/src/components/data.json');
    console.log(this.json)

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
    // this.mouthWidth = t

    this.camera.position.z = 0.5
    this.camera.position.y = 0

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();

    this.renderer.setClearColor('#ffffff')
    this.renderer.setSize(width, height)

    window.addEventListener('resize', this.onWindowResize, false);

    this.mount.appendChild(this.renderer.domElement)
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

  getMouthControl(){
    if (this.model) {
      this.model.traverse(o => {
        if(o.isSkinnedMesh && o.name == 'head'){
          this.mouthControl = o.morphTargetInfluences;
        }
      })
      this.mouthControlActive = true
    }
  }

  animate() {
    if(this.mouthControlActive){
      this.delta += this.move
      this.mouthControl[0] += this.move
      this.mouthControl[1] += this.move
      if(this.delta > 1.0 || this.delta < 0){
                this.move = -this.move
            }
    }
    this.controls.update()
    this.renderScene()
    this.frameId = window.requestAnimationFrame(this.animate)
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