/*
*
*
*/
import * as THREE from "three";
import { MathUtils, Vector3 } from "three";
import { leaveTutorial } from ".";
// import { Yorbie } from "./yorbie"
const posterFile = require('../assets/images/showPoster2021.jpg'); 

let tutorialText = [
    "Welcome to the tutorial!\n\nHere you have a chance to practice the controls of the YORB without anyone else around. Lets start by looking around -- click and drag in the window.",
    "Great! When you click and drag, think of it like you're directing your virtual eyes to move in that direction. Now lets meet Yorbie! Look around until you see a little yellow puppy in the center of the window.",
    "Hi Yorbie! Okay, he wants to show us this poster -- lets interact with it by holding SHIFT and clicking on it. This is how you can get more info from show posters.",
    "Now he wants to explore! Let's walk over to him. You can use the WASD keys or the arrow keys to move.",
    "We're ready to join the public YORB! Make sure your camera and mic are on by checking the icons to the left. Shift+Click Yorbie when you're ready to exit the tutorial!"
];


export class Tutorial {
    constructor (scene, camera, mouse, playerPos, layer, yorbie) {

        this.scene = scene;
        this.camera = camera;
        this.mouse = mouse;
        this.position = playerPos; //array with both pos and rot
        this.yorbie = yorbie; // will have to change when its a server-side yorbie
        // this.yorbie.yorbie.position.set(this.position[0][0] + 1, 0, this.position[0][2]);
        // let lookPos = new Vector3(this.camera.position.x, 0.2, this.camera.position.z)
        // this.yorbie.yorbie.lookAt(lookPos);

        //random yorbie pos
        //this is all very dumb, don't @ me, i'm rushing
        let userPos = new Vector3(this.camera.position.x, 0.1, this.camera.position.z);
        // console.log("userPos: ");
        // console.log(userPos);
        let yorbiePos = new Vector3(this.camera.position.x + 2, 0.1, this.camera.position.z);
        let clonePos = userPos.clone();
        // console.log("yorbPos: ");
        // console.log(yorbiePos);
        yorbiePos.sub(userPos);
        // console.log("yorbPos: ");
        // console.log(yorbiePos);
        let randRot = MathUtils.mapLinear(Math.random(), 0, 1, 0, 2 * Math.PI);
        // console.log("randRot: ");
        // console.log(randRot);
        yorbiePos.applyAxisAngle(new Vector3(0, 1, 0), randRot);
        // console.log("after apply: ");
        // console.log(yorbiePos);
        yorbiePos.add(clonePos);
        // console.log("after add: ");
        // console.log(yorbiePos);
        this.yorbie.yorbie.position.set(yorbiePos.x, yorbiePos.y, yorbiePos.z);
        let lookPos = new Vector3(this.camera.position.x, 0.2, this.camera.position.z)
        this.yorbie.yorbie.lookAt(lookPos);
        // this.yorbie.yorbie.visible = true;
        
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

        this.origRot = new Vector3(this.camera.rotation.x, this.camera.rotation.y, this.camera.rotation.z);

        //for demo poster
        let posterTexture = new THREE.TextureLoader().load(posterFile);
        let posterMaterial = new THREE.MeshBasicMaterial({map: posterTexture});
        this.poster = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, .2), posterMaterial);
        let posterPos = yorbiePos.sub(userPos).clone();
        let posterRot = posterPos.clone();
        posterRot.applyAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);
        posterPos.multiplyScalar(2);
        posterPos.add(clonePos);
        posterPos.add(posterRot);
        posterPos.add(new Vector3(0, 1.5, 0));
        this.poster.position.set(posterPos.x, posterPos.y, posterPos.z);
        this.poster.lookAt(this.camera.position);
        this.scene.add(this.poster);
        this.poster.visible = false;

        let vecToPoster = this.poster.position.clone();
        vecToPoster.sub(new Vector3(0, 1.3, 0));
        vecToPoster.sub(this.yorbie.yorbie.position);
        this.posterPathSegment = vecToPoster.divideScalar(20);
        //redundant
        this.posterBottom = this.poster.position.clone();
        this.posterBottom.sub(new Vector3(0, 1.3, 0));

        //finds nearest arch (all just 20,20) -- laborious but w/e
        let arch1Pos = new Vector3(20, 0.1, 20);
        let arch2Pos = new Vector3(20, 0.1, -20);
        let arch3Pos = new Vector3(-20, 0.1, 20);
        let arch4Pos = new Vector3(-20, 0.1, -20);
        let arch1Dist = this.posterBottom.distanceTo(arch1Pos);
        let arch2Dist = this.posterBottom.distanceTo(arch2Pos);
        let arch3Dist = this.posterBottom.distanceTo(arch3Pos);
        let arch4Dist = this.posterBottom.distanceTo(arch4Pos);
        if (arch1Dist < arch2Dist && arch1Dist < arch3Dist && arch1Dist < arch4Dist){
            this.closestArch = arch1Pos;
        } else if (arch2Dist < arch1Dist && arch2Dist < arch3Dist && arch2Dist < arch4Dist){
            this.closestArch = arch2Pos;
        } else if (arch3Dist < arch2Dist && arch3Dist < arch1Dist && arch3Dist < arch4Dist){
            this.closestArch = arch3Pos;
        } else {
            this.closestArch = arch4Pos;
        }
        let archPath = this.closestArch.clone();
        this.vecToArch = archPath.sub(this.posterBottom);
        this.vecToArch.divideScalar(20);

        console.log('tutorial launched')
    }

    run(){
        this.textBox.textContent = tutorialText[this.stage];

        switch (this.stage){
            case 0: //during first stage, check to see if they look around at all
                let camRot = new Vector3(this.camera.rotation.x, this.camera.rotation.y, this.camera.rotation.z);
                // console.log(camRot.distanceTo(origRot));
                if(camRot.distanceTo(this.origRot) > 0) {
                    this.stage++;
                }
                break;
            case 1: //now look for yorbie
                this.textBox.style.backgroundColor = "#b6a6f8";
                
                this.yorbie.yorbie.visible = true;

                let posTarget = new Vector3();
                let dirTarget = new Vector3(); //no idea why this is needed now
                this.raycaster.set(this.camera.getWorldPosition(posTarget), this.camera.getWorldDirection(dirTarget));
                let intersects = this.raycaster.intersectObject(this.yorbie.yorbie, true); //uhhh
                if (intersects.length > 0) {
                    this.stage++;
                }
                break;
            case 2: //shift click on show poster
                this.textBox.style.backgroundColor = "#fafa4c";
                this.poster.visible = true;
               
                //move yorbie to the poster
                if (this.yorbie.yorbie.position.distanceTo(this.posterBottom) > .3){
                    this.yorbie.yorbie.lookAt(this.posterBottom);
                    this.yorbie.yorbie.position.add(this.posterPathSegment);
                } else {
                    let lookPos = new Vector3(this.camera.position.x, 0.2, this.camera.position.z)
                    this.yorbie.yorbie.lookAt(lookPos);
                    yorbieReady = true;
                }
                this.raycaster.setFromCamera(this.mouse, this.camera);
                let mouseRayIntersect = this.raycaster.intersectObject(this.poster, true);
                if (mouseRayIntersect.length > 0) {
                    this.yorbieCenter = true; //keeping this name instead of changing to poster because i'm rushing
                } else {
                    this.yorbieCenter = false;
                }
                break;
            case 3: //walk over to Yorbie
                this.textBox.style.backgroundColor = "#b6a6f8";
                this.poster.visible = false;
                let yorbieReady = false;
                if (this.yorbie.yorbie.position.distanceTo(this.closestArch) > 4){
                    this.yorbie.yorbie.lookAt(this.closestArch);
                    this.yorbie.yorbie.position.add(this.vecToArch);
                } else {
                    let lookPos = new Vector3(this.camera.position.x, 0.2, this.camera.position.z);
                    this.yorbie.yorbie.lookAt(lookPos);
                    yorbieReady = true;
                }
                if (yorbieReady && this.yorbie.yorbie.position.distanceTo(this.camera.position) < 4){
                    this.stage++;
                }
                break;
            case 4: //ready to join
                this.textBox.style.backgroundColor = "#fafa4c";
                let lookPos = new Vector3(this.camera.position.x, 0.2, this.camera.position.z);
                this.yorbie.yorbie.lookAt(lookPos);

                this.raycaster.setFromCamera(this.mouse, this.camera);
                let mouseRayIntersect2 = this.raycaster.intersectObject(this.yorbie.yorbie, true);
                if (mouseRayIntersect2.length > 0) {
                    this.yorbieCenter = true; // keeping this name instead of changing to poster because i'm rushing
                } else {
                    this.yorbieCenter = false;
                }
                break;
            case 5: //join
                this.textBox.style.visibility = "hidden";
                this.stage++; //just to prevent double calling the leave function
                leaveTutorial(); //in index.js, self-destructs the tutorial
                break;
            default:
                break;
        }
    }
    
    onMouseClick(e) { 
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