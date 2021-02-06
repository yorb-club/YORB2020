/*
 * This is a template file which you can use to build something in YORB.
 *
 *
 * To use this file, follow these steps:
 * 1. Create a copy of this file with a fun new name related to the additional feature you're building (i.e. "labyrinth.js")
 * 2. In that file, rename the class from "MyYorbClassTemplate" to match the file name (i.e. "export class labyrinth {...}")
 * 3. Add additional objects / functionality to the Yorb by using this.scene and this.camera
 * 4. Make sure to add an object of this class to the "yorb.js" file (and update in the update loop as needed!)
 *
 * If you have any questions, contact the Yorb Club on Discord!
 *
 */

import { create3DText, createSimpleText, addLineBreak, formatDate} from './utils';
import * as THREE from 'three';

const scene = scene;
const camera = camera;

export class Calendar {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        let fontJson = require('../assets/fonts/Righteous_Regular.json');
        this.font = new THREE.Font(fontJson);
    }

    update(events) {
        console.log('Upcoming events:', events);

        if (events.length > 0) {
            for (let i = 0; i < events.length && i < 7; i++) {
                var event = events[i];
                console.log(event);
                var when = event.start.dateTime;
                if (!when) {
                    when = event.start.date;
                }
                let eventMesh = this.createHyperlinkedMesh(25 - i * 3.5, 2, 2, event);
                this.scene.add(eventMesh);
            }
        } else {
            // appendPre('No upcoming events found.');
            console.log('No upcoming events found.');
        }
    }
    /*
     * createHyperlinkedMesh(x,y,z,_project)
     *
     * Description:
     * 	- creates an object3D for each project at position x,y,z
     *	- adds _project as userData to the object3D
     *	- returns object3D
     */

    createHyperlinkedMesh(x, y, z, event) {
        let linkDepth = 0.1;
        let fontColor = 0x121212;
        let fontSize = 0.2;
        let dateFontSize = 0.15;

        let geometry = new THREE.BoxGeometry(3.25,2.25,linkDepth);
        let mat = new THREE.MeshBasicMaterial({color: 'hotpink'});
        let sideMat = new THREE.MeshBasicMaterial({color: "black"})

        let textSign = new THREE.Mesh(geometry, [sideMat,sideMat,sideMat,sideMat,mat,sideMat]);
        

        // parse text of name and add line breaks if necessary
        let name = event.summary;
        let timeDate = new Date(event.start.dateTime || event.start.date)
        let time = formatDate(timeDate);
        if (name.length > 15) {
            name = addLineBreak(name)
        }

        // create name text mesh
        let nameTextMesh = createSimpleText(name, fontColor, fontSize, this.font);
        let timeTextMesh = createSimpleText(time, dateFontSize, fontSize, this.font);

        // position text meshes w/r/t each other
        nameTextMesh.position.y += 0.25;
        timeTextMesh.position.y -= 0.75;

        let textGroup = new THREE.Group();
        textGroup.add(nameTextMesh);
        textGroup.add(timeTextMesh);
        textGroup.position.z += linkDepth / 2 + 0.01; // offset forward

        textSign.add(textGroup);
        textSign.position.set(x,y,z);
        textSign.rotateY(Math.PI);

        // textMesh.position.y += linkDepth / 2 + 0.01; // offset forward
        // textMesh.rotateY(Math.PI / 2);

        // imageSign.position.set(x, y, z);
        // textSign.position.set(0, -0.75 / 2 - 0.5 / 2, 0);
        // textSign.add(textMesh);
        // imageSign.add(textSign);

        // parse zoom room status
        // var status_code = _project.zoom_status
        // let status = ''
        // // status_code = 1;
        // if (status_code == '1') {
        //     var statusBoxGemoetry = new THREE.BoxGeometry(linkDepth, 0.125, 0.5)
        //     var statusSign = new THREE.Mesh(statusBoxGemoetry, this.statusBoxMaterial)
        //     status = 'Live now!'
        //     var statusTextMesh = createSimpleText(status, statusColor, fontSize, this.font)
        //     statusTextMesh.position.x += linkDepth / 2 + 0.01
        //     statusTextMesh.position.y -= 0.0625
        //     statusTextMesh.rotateY(Math.PI / 2)
        //     statusSign.add(statusTextMesh)
        //     statusSign.position.y += 0.25
        //     statusSign.position.x += 0.01

        //     imageSign.add(statusSign)
        // }

        // https://stackoverflow.com/questions/24690731/three-js-3d-models-as-hyperlink/24692057
        // let now = Date.now()
        // imageSign.userData = {
        //     project: _project,
        //     lastVisitedTime: now,
        // }

        // imageSign.name = _project.project_id

        // imageSign.lookAt(0, 1.5, 0);
        // imageSign.rotateY(-Math.PI / 2);
        // imageSign.translateZ(2);
        // imageSign.translateX(7);
        // imageSign.translateY(0.25);

        // let pedestalGeo = new THREE.CylinderBufferGeometry(0.5, 0.65, 1, 12)
        // let pedestalMat = new THREE.MeshBasicMaterial({ color: 0x232323, flatShading: true, side: THREE.DoubleSide })
        // let pedestalMesh = new THREE.Mesh(pedestalGeo, pedestalMat)
        // let pedestalGeoBigger = new THREE.CylinderBufferGeometry(0.5 + 0.01, 0.65+ 0.01, 1+ 0.01, 12)
        // const wireframe = new THREE.WireframeGeometry(pedestalGeoBigger)
        // const line = new THREE.LineSegments(wireframe)

        // line.material.depthTest = true
        // line.material.opacity = 0.25
        // line.material.transparent = false

        // imageSign.add(pedestalMesh)
        // pedestalMesh.add(line);
        // pedestalMesh.position.set(0, -1.5, 0)

        return textSign;
    }
}
