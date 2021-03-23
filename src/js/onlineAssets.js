import * as THREE from 'three'
import { Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { YorbFirebase } from './yorbFirebase.js'

import debugModule from 'debug'
const log = debugModule('YORB:OnlineAssets')

export class OnlineAssets {
    constructor(scene) {
        this.scene = scene; //da sceneee
        this.loader = new GLTFLoader();
        this.firebase = new YorbFirebase();
    }

    /**
     * An abtracted function to load 3D assets (i.e. glbs/gltfs) from the connected Yorb Firebase. 
     * It'll pull the asset file from the storage, and the transformation info from the database.
     * Can be extended to support more file types in the future.
     * @param {*} ref a string representing the ref path to the assets, e.g. "glbs", "images/posters"
     */
    async load3DAssets(ref) {
        const assetsToLoad = await this.firebase.read(ref);
        for (const key in assetsToLoad) {
            const asset = assetsToLoad[key];
            this.loadModel(asset.url, asset.position, asset.rotation, asset.scale)
        }
    }

    loadModel(modelPath, position, rotation, scale) {
        this.loader.load(
            modelPath,
            (gltf) => {
                let gltfScene = gltf.scene
                gltfScene.position.set(position.x, position.y, position.z)
                gltfScene.rotation.x = Math.PI / 180 * rotation.x;
                gltfScene.rotation.y = Math.PI / 180 * rotation.y;
                gltfScene.rotation.z = Math.PI / 180 * rotation.z;
                gltfScene.scale.set(scale, scale, scale)
                gltfScene.traverse((child) => {
                    if (child.isMesh) {
                        // child.material = _material
                        child.castShadow = true
                        child.receiveShadow = true
                    }
                })
                this.scene.add(gltfScene)
            },
            undefined,
            function (e) {
                log('trying to load online asset');
                console.error(e)
            }
        )
    }

}
