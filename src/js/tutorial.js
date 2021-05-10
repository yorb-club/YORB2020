/*
*
*
*/
import * as THREE from "three";
import { Vector3 } from "three";
import { Yorbie } from "./yorbie"

let tutorialText = [
    "Welcome to the tutorial!\n\nHere you have a chance to practice the controls of the YORB without anyone else around. Lets start by looking around -- click and drag in the window.",
    "Great! When you click and drag, think of it like you're directing your virtual eyes to move in that direction. Now lets meet Yorbie! Look around until you see a little yellow puppy in the center of the window.",
    "Hi Yorbie! Okay, now lets interact with him by holding SHIFT and clicking on him. This is how you can get more info from show posters.",
    "Now he wants to play! Let's walk over to him. You can use the WASD keys or the arrow keys to move.",
    "Yayyyyyy"
];


export class Tutorial {
    constructor (scene, camera, mouse, playerPos, layer, yorbie) {

        this.scene = scene;
        this.camera = camera;
        this.mouse = mouse;
        this.position = playerPos; //array with both pos and rot
        this.yorbie = yorbie; // will have to change when its a server-side yorbie
        this.yorbie.yorbie.position.set(this.position[0][0] + 1, 0, this.position[0][2]);
        let lookPos = new Vector3(this.camera.position.x, 0.2, this.camera.position.z)
        this.yorbie.yorbie.lookAt(lookPos);
        // this.yorbieOrigPos = this.yorbie.position;
        // this.yorbie = new Yorbie(this.scene, new Vector3(2.86, 0, 1.19), 2);
        this.layer = layer;
        this.textBox = document.getElementById("tutorialBox");
        this.textBox.style.visibility = 'visible';
        this.stage = 0;
        this.raycaster = new THREE.Raycaster();
        let domElement = document.getElementById('scene-container')
        domElement.addEventListener('click', (e) => this.onMouseClick(e), false);
        window.addEventListener('keydown', (e) => this.onKeyDown(e), false)
        window.addEventListener('keyup', (e) => this.onKeyUp(e), false)
        this.yorbieCenter = false;
        console.log('tutorial launched')
        // console.log(this.camera.rotation);
        // console.log(this.position);

    }

    run(){
        this.textBox.textContent = tutorialText[this.stage];

        switch (this.stage){
            case 0: //during first stage, check to see if they look around at all
                let camRot = new Vector3(this.camera.rotation.x, this.camera.rotation.y, this.camera.rotation.z);
                let origRot = new Vector3(this.position[1][0], this.position[1][1], this.position[1][2]);
                // console.log(camRot.distanceTo(origRot));
                if(camRot.distanceTo(origRot) > 0) {
                    this.stage++;
                }
                break;
            case 1: //now look for yorbie
                this.textBox.style.backgroundColor = "#b6a6f8";
                let posTarget = new Vector3();
                let dirTarget = new Vector3(); //no idea why this is needed now
                this.raycaster.set(this.camera.getWorldPosition(posTarget), this.camera.getWorldDirection(dirTarget));
                let intersects = this.raycaster.intersectObject(this.yorbie.yorbie, true); //uhhh
                if (intersects.length > 0) {
                    this.stage++;
                }
                break;
            case 2: //shift click on yorbie
                this.textBox.style.backgroundColor = "#fafa4c";
                this.raycaster.setFromCamera(this.mouse, this.camera);
                let mouseRayIntersect = this.raycaster.intersectObject(this.yorbie.yorbie, true);
                // let thresholdDist = 7;
                if (mouseRayIntersect.length > 0) {
                    // if (this.)
                    console.log('asdfasdfd')
                    this.yorbieCenter = true;
                } else {
                    this.yorbieCenter = false;
                }
                break;
            case 3: //walk over to Yorbie
                this.textBox.style.backgroundColor = "#b6a6f8";
                let origin = new Vector3(0, 0, 0);
                let yorbieReady = false;
                if (this.yorbie.yorbie.position.distanceTo(origin) > .75){
                    this.yorbie.yorbie.lookAt(origin);
                    this.yorbie.yorbie.position.lerp(origin, .1);
                } else {
                    let lookPos = new Vector3(this.camera.position.x, 0.2, this.camera.position.z)
                    this.yorbie.yorbie.lookAt(lookPos);
                    yorbieReady = true;
                }
                if (yorbieReady && this.yorbie.yorbie.position.distanceTo(this.camera.position) < 2){
                    this.stage++;
                }
                break;
            case 4:
                this.textBox.style.backgroundColor = "#fafa4c";
                break;
            default:
                break;
        }
    }
    
    onMouseClick(e) { //only for 3rd stage
        if (this.yorbieCenter && this.shift_down) {
            this.stage++;
            this.yorbieCenter = false;
            this.shift_down = false;
        }
    }
    
    onKeyDown(e) {
        if (e.keyCode == 16) {
            this.shift_down = true
        }
    }

    onKeyUp(e) {
        if (e.keyCode == 16) {
            this.shift_down = false
        }
    }


}