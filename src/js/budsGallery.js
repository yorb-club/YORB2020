import * as THREE from 'three'
import { create3DText, createSimpleText } from './utils'
import { hackToRemovePlayerTemporarily } from './index'
import { Vector3 } from 'three'
import { MiscModel } from './miscModels'

import debugModule from 'debug'
const log = debugModule('YORB:Gallery')

export class BudsGallery {
    constructor(
      scene,
      camera,
      mouse,
      controls,
      projectionScreens,
      position
    ) {
        this.scene = scene
        this.mouse = mouse
        this.camera = camera
        this.controls = controls
        this.projectionScreenManager = projectionScreens
        this.position = position || new Vector3(68.64, 0.0, 21.11)
        this.rotation = 195 + 180 + 30;
        // this.path = require('../assets/models/buds/buds-trees.glb')
        this.path = require('../assets/models/buds/buds-gallery-trees-plants_cast_shadow_test.glb')
        this.model;

        // we need some stuff to operate:
        this.raycaster = new THREE.Raycaster()
        this.textureLoader = new THREE.TextureLoader()
        this.textParser = new DOMParser()

        // finally, call the setup function:
        this.setup()
    }

    setup() {
      if(window.location.hash == '#buds') {
        console.log('entering buds gallery')

        let spawn = new Vector3(
          60.90 + Math.random()*-1,
          0.25,
          9.88 + Math.random()*-1
        )
        this.camera.position.set(spawn.x, spawn.y, spawn.z)

        let look = new Vector3(
          this.position.x + 2,
          4,
          this.position.z + 6
        )
        this.camera.lookAt(look)
      }

      // this.camera.rotateY(75)

      let geometry = new THREE.BufferGeometry();
      // create a simple square shape. We duplicate the top left and bottom right
      // vertices because each vertex needs to appear once per triangle.
      let vertices = new Float32Array( [
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,

         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0, -1.0,  1.0
      ] );

      // itemSize = 3 because there are 3 values (components) per vertex
      geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) )
      let material = new THREE.MeshBasicMaterial( { color: 0xff0000 } )
      const entrance = new THREE.Mesh( geometry, material )
      entrance.position.set(this.position)
      this.scene.add(entrance)

      this.model = new MiscModel(this.scene, this.path, this.position, this.rotation)
      // font stuffs if we need them
      var loader = new THREE.FontLoader()
      let fontJSON = require('../assets/fonts/helvetiker_bold.json')
      this.font = loader.parse(fontJSON)

        // then the stages and styling fo those stages
        // this.createMovieStage()
      this.addLights();

    }

    // createMovieStage() {
    //     let projectIndex = 0;
    //     let centerX = 0;
    //     let centerZ = 0;
    //     let lookAtX = 58;
    //     let lookAtZ = 0;
    //     let scaleFactor = 1
    //     let angle = 0;
    //     this.addPresentationStage(projectIndex, centerX, centerZ, lookAtX, lookAtZ, scaleFactor = 1, angle)
    //     // this.addPresentationStage(0, 0, 0, 0, 0, 1, 0)
    // }

    addLights() {

      let { x, y, z } = new Vector3(this.position.x + 40, this.position.y, this.position.z + 40)
      // const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
      // hemiLight.color.setHSL( 0.6, 1, 1 );
      // hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
      // hemiLight.position.set( this.position.x + 20, this.position.y + 20, this.position.z + 40 );
      // this.scene.add( hemiLight );
      //
      // const hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 10 );
      // this.scene.add( hemiLightHelper );

      // const dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
			// 	dirLight.color.setHSL( 0.1, 1, 0.95 );
			// 	dirLight.position.set( x, y, z );
			// 	// dirLight.position.multiplyScalar( 30 );
      //   // dirLight.rotateX(45)
      //   // dirLight.rotateX(45)
      //   // dirLight.rotateY(180)
      //   const target= new THREE.Object3D()
      //   target.position.set(this.position.x, this.position.y, this.position.z)
      //   this.scene.add( target )
      //   dirLight.target = target
      //
			// 	this.scene.add( dirLight )
      //
			// 	dirLight.castShadow = true;
      //
			// 	dirLight.shadow.mapSize.width = 2048;
			// 	dirLight.shadow.mapSize.height = 2048;
      //
			// 	const d = 50;
      //
			// 	dirLight.shadow.camera.left = - d;
			// 	dirLight.shadow.camera.right = d;
			// 	dirLight.shadow.camera.top = d;
			// 	dirLight.shadow.camera.bottom = - d;
      //
			// 	dirLight.shadow.camera.far = -3500;
			// 	dirLight.shadow.bias = - 0.0001;
      //
			// 	const dirLightHelper = new THREE.DirectionalLightHelper( dirLight, 10 );
			// 	this.scene.add( dirLightHelper );
      for(let i = 0; i < 4; i++) {
        let width = 20;
        let light = new THREE.PointLight( 0xffffff, 3, 2000, 2 );
        light.position.set(
          x + Math.sin(Math.PI*2/i)*width,
          5,
          z + Math.cos(Math.PI*2/i)*width
        );
        this.scene.add( light );
      }


    }

    addPresentationStage(projectIndex, centerX, centerZ, lookAtX, lookAtZ, scaleFactor = 1, angle) {
      // The alphabet (for project labels)
      const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' // now i know by ABCs next time won't you sing with me
      // pick colors
      const OUTER_FENCE_COLOR = 0x232323 //0x232378
      const ENTRANCE_COLOR = 0xf9f910
      const STAGE_COLOR = 0x232323
      const DOME_COLOR = 0x232323
      const PROJECT_NUMBER_COLOR = 0xffffff

      //sky colors -- same as fences
      const SKY_COLOR_BLUE_ROOM = 0x1250CC;
      const SKY_COLOR_PINK_ROOM = 0xe49add;
      const SKY_COLOR_YELLOW_ROOM = 0xfd8f20;
      const SKY_COLOR_GREEN_ROOM = 0x18DD6C;

      //room colors
      //all have two colors plus one accent color. all use accen colors that are main colors from other rooms except the greenn room
      //blue
      const COL_MAIN_BLUE = 0x4b4ff4
      const COL_SECOND_BLUE = 0x05c1da
      //accent: colmainPink = 0xfc3691
      //COL_MAIN_BLUE, COL_SECOND_BLUE, COL_MAIN_PINK

      //pink rooms
      const COL_MAIN_PINK = 0xfc3691
      const COL_SECOND_PINK = 0xfb69b9
      const COL_MAIN_GREEN = 0x9be210
      //accent: colmainGreen = 0x9be210
      // COL_MAIN_PINK, COL_SECOND_PINK, COL_MAIN_GREEN

      //yellow rooms
      const COL_MAIN_YELLOW = 0xffd810
      const COL_SECOND_YELLOW = 0xf4d01d
      // accent: const colmainBlue = 0x4b4ff4
      //COL_MAIN_YELLOW, COL_SECOND_YELLOW, COL_MAIN_BLUE


      //green rooms
      const COL_ACCENT_BLUE = 0x67D6B5;
      const COL_SECOND_GREEN = 0x77E424;
      const COL_ACCENT_YELLOW = 0xF9F912;
      //
      // COL_ACCENT_BLUE, COL_SECOND_GREEN, COL_ACCENT_YELLOW

      // other parameters:
      const NUMBER_OF_PROJECTS = 8
      const RADIUS = 30
      const FENCE_RADIUS = RADIUS + 10
      const FENCE_HEIGHT = 12

        // add the stage itself
        const cylinderGeometry = new THREE.CylinderBufferGeometry(3 * scaleFactor, 3 * scaleFactor, 1, 32, 1, false)
        const cylinderMaterial = new THREE.MeshPhongMaterial({ color: STAGE_COLOR, side: THREE.DoubleSide })
        const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
        cylinder.position.set(centerX, 0, centerZ)
        this.scene.add(cylinder)


        // making a mini dome
        //https://threejsfundamentals.org/threejs/lessons/threejs-primitives.html
        //trying sphereGeometryconst radius = 7;
        const radius = 7
        const widthSegments = 12
        const heightSegments = 8
        const phiStart = Math.PI * 0
        const phiLength = Math.PI * 1
        const thetaStart = Math.PI * 0.0
        const thetaLength = Math.PI * 0.9
        const domeGeometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength)

        domeGeometry.scale(0.7, 0.7, 0.7)
        const domeMaterial = new THREE.MeshPhongMaterial({ color: DOME_COLOR, side: THREE.DoubleSide })
        const domeMesh = new THREE.Mesh(domeGeometry, domeMaterial)
        domeMesh.position.set(centerX, 1, centerZ)
        domeMesh.lookAt(lookAtX, 2, lookAtZ)
        // domeMesh.translateZ(-6.5)
        domeMesh.rotateY(Math.PI)
        // domeMesh.rotateX(Math.PI/2)
        // domeMesh.rotateZ(Math.PI/2)
        this.scene.add(domeMesh)

        /// Font for back walls
        this.projectionScreenManager.addScreen(centerX, 2, centerZ, lookAtX, 2, lookAtZ, scaleFactor)
  }

  // updateProjects(projects) {
  //     // do nothing
  // }
  //
  // _updateProjects() {
  //   // do nothing
  // }
  //
  // update() {
  //   // do nothing
  // }
}
