import React, { Component } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { bgColor, fontColor, fontColorFocus } from '../Config.js'


class Model extends Component {
  constructor(props) {
    super(props)
    this.state = {
        animationStatus: this.props.animationStatus,
        intensity: this.props.sliderValue
    }
    console.log("color", bgColor)
    this.visemes = undefined
    this.visemesNames = undefined

    this.move = 0.02
    this.delta = 0

    this.modelControlActive = false

    this.currentFrame = 1

    this.lidMove = 0.1
    this.lidSpeed = 0.1
    this.lidWait = 1

    this.exponent = 6

    this.obamaRatio = [0.8, 0.8]

    this.start = this.start.bind(this)
    this.animate = this.animate.bind(this)
    this.onWindowResize = this.onWindowResize.bind(this)
    this.addCube = this.addCube.bind(this)
    this.addModel = this.addModel.bind(this)
    this.getMouthControl = this.getModelControl.bind(this)
    this.moveLid = this.moveLid.bind(this)
    this.nextViseme = this.nextViseme.bind(this)
    this.resetModel = this.resetModel.bind(this)
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
    this.renderer = new THREE.WebGLRenderer({ antialias: true , alpha:true})
    // this.scene.background = new THREE.Color( bgColor );
    // this.renderer.setClearColor( 0x000000, 0 );

    var light = new THREE.HemisphereLight(bgColor, fontColorFocus, 0.75);
    this.scene.add(light)
    var spotLight = new THREE.SpotLight(fontColor, 0.4);
    spotLight.position.set(-80,100,100);
    spotLight.castShadow = true;
    this.scene.add(spotLight)

    // var light = new THREE.DirectionalLight( 0xd9d9d9 );
		// 	light.position.set( 0.5, 0.5, 1 );
		// 	this.scene.add( light );

		// 	var pointLight = new THREE.PointLight( 0x3c6e71 );
		// 	pointLight.position.set( 0, 0, 100 );
		// 	this.scene.add( pointLight );

			// var ambientLight = new THREE.AmbientLight( 0x404040 );
			// this.scene.add( ambientLight );


    this.addModel()

    this.camera.position.z = 0.5
    this.camera.position.y = 0

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update();

    // this.renderer.setClearColor('#ffffff')
    this.renderer.setSize(width, height)

    window.addEventListener('resize', this.onWindowResize, false);

    this.mount.appendChild(this.renderer.domElement)

    this.start()
  }

  componentDidUpdate(prevProps){
      if(prevProps.animationStatus !== this.props.animationStatus){
          this.setState({
              animationStatus: this.props.animationStatus
          })
      }
      if(prevProps.visemes !== this.props.visemes){
        this.visemes = this.props.visemes
        this.visemesNames = [...new Set(this.props.visemes)]
        this.currentFrame = 1
        console.log(this.visemes)
        console.log(this.visemesNames)
    }
    if(prevProps.sliderValue !== this.props.sliderValue){
      this.setState({
        intensity: this.props.sliderValue
      })
    }
  }


  addCube(x, y, z) {
    var geometry = new THREE.BoxGeometry(.1,.1,.1)
    geometry.translate(x, y, z)
    var material = new THREE.MeshBasicMaterial({ color: '#433F81' })
    var cube = new THREE.Mesh(geometry, material)
    this.scene.add(cube)
  }

  addModel() {
    var loader = new GLTFLoader();

    loader.load('model/head_visemes.gltf', gltf => {
      this.model = SkeletonUtils.clone(gltf.scene)
      console.log(this.model)
      this.scene.add(this.model)
      this.getModelControl()
      this.model.traverse(o => {
        if (o.isMesh && (o.name === 'head' || o.name === 'eye4')) {
          var newMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, shininess: 150 } );
          newMaterial.skinning = o.material.skinning;
          newMaterial.morphTargets = o.material.morphTargets;
          newMaterial.morphNormals = o.material.morphNormals;
          o.material = newMaterial
        }
      })
      this.renderScene()
      this.props.mounted()
      console.log(this.model)
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
    this.mount.removeChild(this.renderer.domElement)
  }

  start() {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate)
    }
  }


  getModelControl() {
    if (this.model) {
      this.model.traverse(o => {
        if (o.isMesh && o.name === 'head') {
          this.modelControl = o.morphTargetInfluences;
          this.modelControlDict = o.morphTargetDictionary;
          this.modelControlActive = true
        }
      })
    }
  }


  calculateDistance(point1, point2) {
    return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2))
  }


  moveLid(){
    if(this.modelControl[this.modelControlDict['wink']] <= 0){
      if (this.lidWait > 100){
        this.lidMove = this.lidSpeed;
        this.lidWait = 0
      }
      else {
        this.lidMove = 0
      }
      this.lidWait += 1
    }
    else if (this.modelControl[this.modelControlDict['wink']] > 1) {
      this.lidMove = -this.lidMove;
    }

    this.modelControl[this.modelControlDict['wink']] = this.modelControl[this.modelControlDict['wink']] + this.lidMove;
  }

  nextViseme(){
    if(this.currentFrame < 1)
      this.currentFrame = 1

    var currViseme = this.visemes[this.currentFrame]
    var prevViseme = this.visemes[this.currentFrame-1]
    for(var visemeName of this.visemesNames){
      if(visemeName === currViseme){
        this.modelControl[this.modelControlDict[visemeName]] += this.state.intensity / this.exponent //Math.pow(this.state.intensity, this.exponent)
        if(this.modelControl[this.modelControlDict[visemeName]]>1)
          this.modelControl[this.modelControlDict[visemeName]] = 1
      }
      else{
        this.modelControl[this.modelControlDict[visemeName]] -= this.state.intensity / (10-this.exponent) //Math.pow(this.state.intensity, this.exponent)
        if(this.modelControl[this.modelControlDict[visemeName]]<0)
          this.modelControl[this.modelControlDict[visemeName]] = 0
      }
    }

    if(currViseme === prevViseme){
      this.exponent -= 1
      if(this.exponent < 2) this.exponent = 2;
    }
    else
      this.exponent = 8
  }

  resetModel(){
    this.lidWait = 0
    if(this.modelControl){
      for(var i=0; i<this.modelControl.length; i++){
        this.modelControl[i] = 0;
      }
    }
  }

  animate() {
    if (this.state.animationStatus === 'PLAY' && this.modelControlActive) {
      this.nextViseme()
      this.moveLid()

      if (this.currentFrame >= this.visemes.length) {
        this.currentFrame = 0
      }

      this.currentFrame += 1
    }
    else if(this.state.animationStatus === "STOP"){
        this.currentFrame = 1
        this.resetModel()
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

export default Model