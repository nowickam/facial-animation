import React, { Component } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

class View extends Component {
  constructor(props) {
    super(props)
    this.move = 0.01
    this.delta = 0
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this.animate = this.animate.bind(this)
    this.onWindowResize = this.onWindowResize.bind(this)
    this.addCube = this.addCube.bind(this)
    this.addModel = this.addModel.bind(this)
  }

  componentDidMount() {
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
    // this.addCube()
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

    loader.load('model/head.gltf', gltf => {
      console.log(gltf)
      this.model = SkeletonUtils.clone(gltf.scene)
      this.scene.add(this.model)
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

  animate() {
    if (this.model) {
      this.model.traverse(o => {
        this.delta += this.move
        if (o.isBone && o.name.includes("down_control")) {
          o.position.y -= this.move
        }
        if (o.isBone && o.name.includes("top_control")) {
          o.position.y += this.move/2
        }
        if (o.isBone && o.name.includes("left_control")) {
          o.position.x -= this.move
        }
        if (o.isBone && o.name.includes("right_control")) {
          o.position.x += this.move
        }
        if(this.delta > 15 || this.delta < 0){
            this.move = -this.move
        }
      })
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