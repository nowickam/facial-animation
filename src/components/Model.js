import React, { Component } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { bgColor, fontColor, fontColorFocus, visemeMap } from '../Config.js'


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
    this.moveLights = this.moveLights.bind(this)
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

    var light = new THREE.HemisphereLight(bgColor, fontColorFocus, 1.1);
    this.scene.add(light)
    var spotLight = new THREE.SpotLight(fontColor, 0.75);
    spotLight.position.set(-80,100,10);
    spotLight.castShadow = true;
    this.scene.add(spotLight)

    const sphere = new THREE.SphereBufferGeometry( 0.1, 16, 8 );

    this.light1 = new THREE.PointLight( 0xFFFFFF, 0.1, 50 );
    this.light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: fontColor } ) ) );
    this.scene.add( this.light1 );

    this.light2 = new THREE.PointLight( 0xFF715B, 0.1, 50 );
    this.light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: fontColor } ) ) );
    this.scene.add( this.light2 );

    this.light3 = new THREE.PointLight( 0x1EA896, 0.1, 50 );
    this.light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: fontColor } ) ) );
    this.scene.add( this.light3 );

    this.light4 = new THREE.PointLight( fontColorFocus, 0.1, 50 );
    this.light4.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: fontColor } ) ) );
    this.scene.add( this.light4 );

    this.light5 = new THREE.PointLight( fontColor, 0.1, 50 );
    this.light5.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: fontColor } ) ) );
    this.scene.add( this.light5 );

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
    // console.log(visemeMap)
    // console.log(this.visemes)
    // console.log(this.modelControl, this.modelControlDict)
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

    loader.load('model/head_new_visemes.gltf', gltf => {
      this.model = SkeletonUtils.clone(gltf.scene)
      console.log(this.model)
      this.scene.add(this.model)
      this.getModelControl()
      this.model.traverse(o => {
        if (o.isMesh && (o.name === 'head' || o.name === 'eye4')) {
          var newMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, shininess: 150 } );
          newMaterial.emissive = new THREE.Color(bgColor)
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

  moveLights(){
    const time = Date.now() * 0.0005;

    this.light1.position.x = Math.sin( time * 0.7 ) * 10;
    this.light1.position.y = Math.cos( time * 0.5 ) * 20;
    this.light1.position.z = Math.cos( time * 0.3 ) * 10;

    this.light2.position.x = Math.cos( time * 0.3 ) * 10;
    this.light2.position.y = Math.sin( time * 0.5 ) * 20;
    this.light2.position.z = Math.sin( time * 0.7 ) * 10;

    this.light3.position.x = Math.sin( time * 0.7 ) * 10;
    this.light3.position.y = Math.cos( time * 0.3 ) * 20;
    this.light3.position.z = Math.sin( time * 0.5 ) * 10;

    this.light4.position.x = Math.cos( time * 0.3 ) * 10;
    this.light4.position.y = Math.cos( time * 0.7 ) * 20;
    this.light4.position.z = Math.sin( time * 0.5 ) * 10;

    this.light5.position.x = Math.cos( time * 0.3 ) * 10;
    this.light5.position.y = Math.sin( time * 0.7 ) * 20;
    this.light5.position.z = Math.cos( time * 0.5 ) * 10;
  }

  // nextViseme(){
  //   if(this.currentFrame < 1)
  //     this.currentFrame = 1

  //   var currViseme = this.visemes[this.currentFrame]
  //   var prevViseme = this.visemes[this.currentFrame-1]
  //   for(var visemeName of this.visemesNames){
  //     if(visemeName === currViseme){
  //       this.modelControl[this.modelControlDict[visemeName]] += this.state.intensity / this.exponent //Math.pow(this.state.intensity, this.exponent)
  //       if(this.modelControl[this.modelControlDict[visemeName]]>1)
  //         this.modelControl[this.modelControlDict[visemeName]] = 1
  //     }
  //     else{
  //       this.modelControl[this.modelControlDict[visemeName]] -= this.state.intensity / (10-this.exponent) //Math.pow(this.state.intensity, this.exponent)
  //       if(this.modelControl[this.modelControlDict[visemeName]]<0)
  //         this.modelControl[this.modelControlDict[visemeName]] = 0
  //     }
  //   }

  //   if(currViseme === prevViseme){
  //     this.exponent -= 1
  //     if(this.exponent < 2) this.exponent = 2;
  //   }
  //   else
  //     this.exponent = 8
  // }

  nextViseme(){
    // decrease added value
    if(this.currentFrame > 0 && this.visemes[this.currentFrame] === this.visemes[this.currentFrame-1]){
      this.exponent -= 0.1
    }
    else
      this.exponent = 10
    // decrease all visemes
    for(var visemeName of Object.keys(this.modelControlDict)){
      this.modelControl[this.modelControlDict[visemeName]] -= this.state.intensity / 10
      if(this.modelControl[this.modelControlDict[visemeName]]<0)
          this.modelControl[this.modelControlDict[visemeName]] = 0
    }
    // increase the current visemes
    var mapping = visemeMap[this.visemes[this.currentFrame]]
    for(var currentVisemeName of Object.keys(mapping)){
      console.log("ADD", this.visemes[this.currentFrame], currentVisemeName, this.modelControl[this.modelControlDict[currentVisemeName]])
      // calculate the added value
      var inc = Math.pow(this.state.intensity, this.exponent)
      // check if the visime is relative
      if(mapping[currentVisemeName] > 1)
        inc /= 4
      // add the value
      this.modelControl[this.modelControlDict[currentVisemeName]] += this.state.intensity / 15
      this.modelControl[this.modelControlDict[currentVisemeName]] += inc
      // check constraints
      if(this.modelControl[this.modelControlDict[currentVisemeName]] > 1 && mapping[currentVisemeName] > 1)
          this.modelControl[this.modelControlDict[currentVisemeName]] = 1
      if(this.modelControl[this.modelControlDict[currentVisemeName]] > mapping[currentVisemeName]*this.state.intensity && !(mapping[currentVisemeName] > 1))
        this.modelControl[this.modelControlDict[currentVisemeName]] = mapping[currentVisemeName]*this.state.intensity
    }
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

      this.currentFrame += 1

      if (this.currentFrame >= this.visemes.length) {
        this.currentFrame = 0
      }
    }
    else if(this.state.animationStatus === "STOP"){
        this.currentFrame = 0
        this.resetModel()
    }
    
    this.moveLights()
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