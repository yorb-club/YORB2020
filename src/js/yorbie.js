/*
* ask August for any info
*
*/
import * as THREE from "three";
import { BoxGeometry, Vector3 } from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
const yorbieModel = require('../assets/models/yorbie-small.glb');

import {launchTutorial} from "./index";






export class Yorbie {
    constructor (scene, position, layer) {

        this.scene = scene;
        this.model = yorbieModel;
        this.position = position;
        this.modelLoader = new GLTFLoader();
        this.yorbie;
        this.loadYorbie(this.model, layer);
    // this code will be called once inside of the 'addYORBParts()' function
    // in the yorb.js file
    
    // let geometry = new THREE.BoxGeometry(1,1,1);
    // let material = new THREE.MeshNormalMaterial();
    
    // myMesh = new THREE.Mesh(geometry, material);

    // scene.add(myMesh);
    }

    loadYorbie(modelPath, layer) { //not using layers anymore
        this.modelLoader.load(
            modelPath,
            (gltf) => {
                this.yorbie = gltf.scene;
                this.yorbie.position.set(this.position.x, this.position.y, this.position.z)
                this.yorbie.scale.set(.005, .005, .005);
                this.yorbie.lookAt(new Vector3(15,0,-2))
                this.yorbie.traverse((child) => {
                    if (child.isMesh) {
                        // child.material = _material
                        child.castShadow = true
                        child.receiveShadow = true
                        // child.layers.set(layer);
                    }
                })

                //add box collider
                let box = new THREE.Mesh(new THREE.BoxGeometry(250, 250, 250));
                box.visible = false;
                this.yorbie.add(box);

                // if (layer > 0){
                    // this.yorbie.layers.disableAll();
                    // this.yorbie.layers.set(layer);
                    // console.log(this.yorbie.layers)
                // }
                this.scene.add(this.yorbie);
                this.yorbie.visible = true;

                // activate tutorial button once yorbie is loaded
                var tutorialButton = document.getElementById('tutorialButton');
    tutorialButton.addEventListener('click', launchTutorial);
            },
            undefined,
            function (e) {
                // log('trying to load yorbie');
                console.error(e);
            }
        )
    }

    updateYorbie(lookTarget){
        // console.log(this.yorbie.rotation);
        // console.log(lookTarget);
        this.yorbie.lookAt(lookTarget);
        // console.log(this.yorbie.rotation);
        this.yorbie.position.set = this.yorbie.position.lerp(lookTarget, .05);
        

    }
}