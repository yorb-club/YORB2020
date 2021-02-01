// tool for generating meshes based on an array of files and auto spacing them out in a space
// August Luhrs Jan 2020

// might be a little weird but planning on using like:
// const Place = require('./place')
// Place.onWall();

import * as THREE from 'three'
import { Vector3 } from 'three'

import debugModule from 'debug';
const log = debugModule('YORB: Place Tool');

const onWall = (startPoint, endPoint, assets, geometry, options) => {
    // takes two Vec3 points, an array of assets to generate the textures from, and a shared canvas geometry
    // returns a THREE.Group with the meshes
    // right now defaults to placing along a flat wall, assumes square canvases, center aligned, evenly spaced -- eventually can add options parameter with those.
    // doesn't need to be wall along an axis, since uses vector math to determine direction of placement
    // assumes start point is on the left for orientation, though since all faces are same, shouldn't matter
    // assumes spacing also on extreme sides, so start/end shouldn't be center of first/last canvas, but the edges of the wall
    // right now, only option is label placement location {labelLocation: 'top' or 'bottom'}
    
    let wallGroup = new THREE.Group();

    //find the direction of placement by subtracting the startVec3 from the endVec3
    let placePath = endPoint.clone();
    placePath.sub(startPoint); //vec3
    log(JSON.stringify(placePath));

    //find the width of the canvases to find the total length of spaces in between them
    let totalCanvasWidth = assets.length * geometry.parameters.width; //scalar
    let totalSpacingWidth =  placePath.length() - totalCanvasWidth; //scalar
    log('totalspaceing: ' + totalSpacingWidth);
    log('length' + placePath.length());
    // //use the spacing to find the distance between the canvas centers
    let spacing = totalSpacingWidth / (assets.length + 1) //scalar, fencepost problem
    log('spacing ' + spacing);
    // find the length between the centers of the canvases so we can add to the current placement
    let placementSection = (geometry.parameters.width / 2) + spacing //scalar
    log('placement section: ' + placementSection);
    let centerToCenter = geometry.parameters.width + spacing;
    // this is probably way over complicated... need to look at with fresh eyes
    // find start placement by dividing the length of the place Vector by the sum of half the asset width and the spacing, then dividing the place Vector by that value
    let startLength = placePath.length() / placementSection; //scalar
    log('startLength: ' + startLength);
    let startPlacement = placePath.clone(); //vec3
    startPlacement.divideScalar(startLength); //vec3
    log('section' + JSON.stringify(startPlacement));
    let currentPlacement = startPoint.clone(); //vec3
    currentPlacement.add(startPlacement) //vec3
    log('current ' + JSON.stringify(currentPlacement));
    //ugh have to add the diff of that vector and the start point
    let nextPlacement = currentPlacement.clone();
    nextPlacement.sub(startPoint).normalize();
    log('next place sub ' + JSON.stringify(nextPlacement))

    

    //for each asset, make a mesh based on the file and geometry.
    //if labeled, create a text
    for (let asset of assets) {
        //first, see if object with label or just file
        if (typeof asset === 'object') {
            let canvasAndLabel = new THREE.Group();

            wallGroup.add(canvasAndLabel);
        } else {
            let canvas;
            if(asset.includes('.png') || asset.includes('.jpg')){
                const canvasTexture = new THREE.TextureLoader().load(asset);
                const canvasMaterial = new THREE.MeshBasicMaterial({map: canvasTexture});
                canvas = new THREE.Mesh(geometry, canvasMaterial);
                canvas.position.copy(currentPlacement);
            } else if (asset.includes('.mp4')){

            } else {
                log("unsupported file type: " + asset);
            }
            wallGroup.add(canvas);
        }
        nextPlacement.multiplyScalar(centerToCenter);
        currentPlacement.add(nextPlacement);
        nextPlacement.normalize();
        // currentPlacement.add(placementSection);
        log('next: ' + JSON.stringify(currentPlacement));

        // currentPlacement = currentPlacement.add(placementSection); //won't work, threejs methods mutable, not return
    }



    //divide by total number of canvases + 1 to get even spacing
    // let placementSection = placePath.clone();
    // placementSection.divideScalar(assets.length + 1); //vec3
    // log(JSON.stringify(placementSection));

    
    // let placementSection = placePath.divideScalar(assets.length); 
    //need error if spacing not enough?
    



    return wallGroup
}

exports.onWall = onWall;