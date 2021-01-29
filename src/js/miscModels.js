//can ask August or YG if you have questions about this!
//models from YG using Vectary ~ * ~ * ../assets/models/portals

import * as THREE from 'three'
import { Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import debugModule from 'debug'
const log = debugModule('YORB:MovieRoom')

/* WOULD LIKE TO MOVE THIS TO movieRoom.js */
const DriveInModel = require('../assets/models/misc/driveInMovie.glb');
//this reference holds all info about which portal goes to where, used by both yorblet.js and winterShow2020.js
const modelReference = [
    {url: 'https://yorblet1.itp.io', model: require('../assets/models/misc/driveInMovie.glb'), label: {text:"Welcome to TNO Movie Room!", color:0xffffff, size:0.4, rotateY:Math.PI / 2, xOff:45, yOff:5, zOff:2}}
]

//yorblet.js uses yorblet_index, which gets passed here to
//the portal trigger is checked in the update method of yorb.js
export class MiscModel {
    // constructor(scene, portal, destination, label) {
    constructor(scene, position) {
        //using the index of the destination because this portal doesn't need to know anything about where it is (besides position), only where it's going
        this.scene = scene; //da sceneee
        this.model = modelReference[0].model; //path to glb
        this.position = position; //vec3
        this.destination = modelReference[0].url; //url
        this.radius = 1; //trigger distance
        this.label = modelReference[0].label; //a label object that contains the text, color, size, rotation Y, x/y/z position offset of the label (do we need more?)

        this.portalLoader = new GLTFLoader();
        log(this.model);
        this.loadPortalModel(this.model);
    }

    loadPortalModel(modelPath) {
        this.portalLoader.load(
            modelPath,
            (gltf) => {
                let portalScene = gltf.scene
                portalScene.position.set(this.position.x, this.position.y, this.position.z)
                // portalScene.scale.set(.1, .1, .1)
                portalScene.scale.set(4, 4, 4)
                portalScene.traverse((child) => {
                    if (child.isMesh) {
                        // child.material = _material
                        child.castShadow = true
                        child.receiveShadow = true
                    }
                })
                this.scene.add(portalScene)

                // --------------- add portal label -------------------------
                const fontJson = require('../assets/fonts/helvetiker_regular_copy.typeface.json')
                const font = new THREE.Font(fontJson)

                const text = this.label.text

                const fontGeometry = new THREE.TextBufferGeometry(text, {
                    font: font,
                    size: this.label.size,
                    height: 0.01,
                    curveSegments: 11,
                    bevelEnabled: true,
                    bevelThickness: 0.01,
                    bevelSize: 0.01,
                    bevelSegments: 1,
                })

                const fontMaterial = new THREE.MeshPhongMaterial({ color: this.label.color, flatShading: true })
                const fontMesh = new THREE.Mesh(fontGeometry, fontMaterial)
                fontMesh.rotateY(this.label.rotateY)
                fontMesh.position.set(this.position.x + this.label.xOff, this.position.y + this.label.yOff, this.position.z +  + this.label.zOff) // make it floating right above the portal shape

                this.scene.add(fontMesh)
            },
            undefined,
            function (e) {
                log('trying to load portal');
                console.error(e)
            }
        )
    }

    teleportCheck(userPosition) {
        //needed to convert because getPlayerPosition doesn't return a vec3
        let userVec3 = new Vector3(userPosition[0], userPosition[1], userPosition[2]);

        // log(this.position.distanceTo(userVec3));


        if (this.position.distanceTo(userVec3) <= this.radius) {
            log('teleporting');
            //if doing modal, would need to do so here, but would have to change the return timing
            // window.open(this.destination);
            location.href = this.destination; //suggestion from shawn/billy so that it doesn't open new window
            return true; //for the trigger that removes the user from this yorblet
        }
        return false;
    }
}
