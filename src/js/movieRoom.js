import * as THREE from 'three'
import { create3DText, createSimpleText } from './utils'
import { hackToRemovePlayerTemporarily } from './index'
import { Vector3 } from 'three'
import { MiscModel } from './miscModels'

// set which YORBLET we're in based on hostname
const hostname = window.location.hostname

import debugModule from 'debug'
const log = debugModule('YORB:Yorblet')

log('hostname:', hostname)

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

export class MovieRoom {
    constructor(scene, projectionScreenManager, mouse, camera, controls) {
        this.scene = scene
        this.mouse = mouse
        this.camera = camera
        this.projectionScreenManager = projectionScreenManager
        this.controls = controls

        // we need some stuff to operate:
        this.raycaster = new THREE.Raycaster()
        this.textureLoader = new THREE.TextureLoader()
        this.textParser = new DOMParser()

        // finally, call the setup function:
        this.setup()

        //add all models
        this.portal = new MiscModel(this.scene, new Vector3(0, 0, 0)) //third param is index of lobby
    }

    setup() {
        //
        var loader = new THREE.FontLoader()
        let fontJSON = require('../assets/fonts/helvetiker_bold.json')
        this.font = loader.parse(fontJSON)

        // then the stages and styling fo those stages
        this.createMovieStage()

        this.parachuteIn()
    }

    parachuteIn() {
        // PARACHUTE IS BACK...
        // Start us up high on the Y axis and outside a circular Yorblet
        var randX = 56 + Math.random() * 4
        var randZ = -2 + Math.random() * 4
        this.camera.position.set(randX, 100, randZ)
        this.camera.lookAt(0, 0, 0)
    }

    createMovieStage() {
        let projectIndex = 0;
        let centerX = 0;
        let centerZ = 0;
        let lookAtX = 58;
        let lookAtZ = 0;
        let scaleFactor = 1
        let angle = 0;
        this.addPresentationStage(projectIndex, centerX, centerZ, lookAtX, lookAtZ, scaleFactor = 1, angle)
        // this.addPresentationStage(0, 0, 0, 0, 0, 1, 0)
    }

    addPresentationStage(projectIndex, centerX, centerZ, lookAtX, lookAtZ, scaleFactor = 1, angle) {
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

  updateProjects(projects) {
      // do nothing
  }

  _updateProjects() {
    // do nothing
  }

  update() {
    // do nothing
  }
}
