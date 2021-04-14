//can ask August or YG if you have questions about this!
//models from YG using Vectary ~ * ~ * ../assets/models/portals

import * as THREE from 'three'
// import { Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import debugModule from 'debug'
const log = debugModule('YORB:MiscModel')

export class MiscModel {
    constructor(scene, model, position, rotation) {
        this.scene = scene; //da sceneee
        this.model = model; //path to glb
        this.position = position; //vec3
        this.rotation = rotation;
        this.portalLoader = new GLTFLoader();
        this.loadPortalModel(this.model);
    }

    loadPortalModel(modelPath) {
        this.portalLoader.load(
            modelPath,
            (gltf) => {
                var modelScene = gltf.scene
                modelScene.rotateY(this.rotation)
                modelScene.position.set(this.position.x, this.position.y, this.position.z)
                // modelScene.scale.set(.1, .1, .1)
                modelScene.scale.set(4, 4, 4)
                modelScene.traverse((child) => {
                    if (child.isMesh) {
                        // child.material = _material
                        child.castShadow = true
                        child.receiveShadow = true
                    }
                })
                this.scene.add(modelScene)
            },
            undefined,
            (error) => {
                log('trying to load model');
                console.error(error)
            }
        )
    }
}
