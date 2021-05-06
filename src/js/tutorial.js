/*
*
*
*/
import * as THREE from "three";
import { Vector3 } from "three";
import { Yorbie } from "./yorbie"

let tutorialText = [
    "Welcome to the tutorial!"
];


export class Tutorial {
    constructor (scene, playerPos, layer, yorbie) {

        this.scene = scene;
        this.position = playerPos;
        this.yorbie = yorbie; // will have to change when its a server-side yorbie
        // this.yorbie = new Yorbie(this.scene, new Vector3(2.86, 0, 1.19), 2);
        this.layer = layer;
        this.textBox = document.getElementById("tutorialBox");
        this.textBox.style.visibility = 'visible';
        
        console.log('tutorial')
    }

}