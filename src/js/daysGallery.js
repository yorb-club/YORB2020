// 100 days gallery module
// August Luhrs Jan 2020

import { Vector3 } from 'three'
import * as THREE from 'three'
const fs = require('fs');
const path = require('path');

// why folders in dist is better than one big folder:
// https://medium.com/hceverything/parcel-js-moving-static-resources-to-a-separate-folder-aef63a038cbd

//can't do the following because parcel doesn't do readdirSync, only readfileSync
// let assetPath = '../assets/images/100Days/resized';
// let posts = []
// fs.readdirSync(assetPath).forEach(folder => {
//     fs.readdirSync(path.join(assetPath, folder)).forEach(file => {
//         posts.push(require(path.join(assetPath, folder, file))); //testing to see if this does what i think it will...
//     });
// });

//instead using the npm module require-directory -- nope, that uses readdirSync
//now trying auto-load module -- nope that uses readdirSync too
// const autoload = require('auto-load');
// const posts = autoload(assetPath);


//https://www.npmjs.com/package/parcel-plugin-static-files-copy
// let posts = require('../../dist/100Days/resized/kcconch/20101005/0.png');
// let assetPath = '../../dist/100Days/resized';
// let posts = [];
// fs.readdirSync(assetPath).forEach(folder => {
//     fs.readdirSync(path.join(assetPath, folder)).forEach(file => {
//         posts.push(require(path.join(assetPath, folder, file))); //testing to see if this does what i think it will...
//     });
// });
//basically useless because still relies on readdirSync...

/*
//okay, now going to try and just run a script that will create a new module that exports a reference to the folders.
//will have to either run createDaysDir.js after resizeScrapes.js or just append the short functions to the end of the latter
const daysDir = require('./daysDir.js')
let assetPath = '../../assets/images/100Days/resized';
let distPath = '../../../dist/100Days/resized'
//should this go in createDaysDir so that the require has it all already? keeping it here because that module gets rewritten
//there's gotta be a better way to do this, this is super redundant:
// const posts = require(path.join(distPath, '100daysof_emp/20101005/0.png'));
const posts = require('../../../dist/100Days/resized/100daysof_emp/20101005/0.png');
// const posts = require('../../../dist/100Days/resized/kcconch/20101005/0.png')
//ugh stupid dist hash thing
let postsDir = {};
Object.keys(daysDir).forEach(account => {
    postsDir[account] = {};
    Object.keys(daysDir[account]).forEach(date => {
        // let thosePosts = require(path.join(assetPath, account, date, "*.png"));
        // postsDir[account][date] = thosePosts;

        postsDir[account][date] = [];
        daysDir[account][date].forEach(post => {
            console.log("post" + post)
            // console.log(path.join(distPath, account, date, post))
            // postsDir[account][date].push(require(path.join(distPath, account, date, post)));
            postsDir[account][date].push(fs.readFileSync(path.join(distPath, account, date, post)));
        });
    });
});
*/

// let posts = daysDir['kcconch'];
// let posts = postsDir;


const posts = require('../../assets/images/100Days/resized/**/*.png')




//only require recent posts for now, later can adjust if want to scroll back in time

export class DaysGallery {
    constructor(scene, location) {
        this.scene = scene
        this.location = {}
        if (location == 'classrooms'){
            //starting point is front left corner of back classroom
            this.location.center = new Vector3(42, 1, 7.4);
        } else { //just for testing the now defunct setupGrid()
            this.location.center = new Vector3(40.5, 0, 0);
            this.location.width = 2; //x
            this.location.depth = 2; //z
            this.location.height = 10; //y
        }
        this.setup(this.location);

    }

    //get posts and generate canvases along the walls of the back classroom (just left for now)
    setup (startPoint){
        let todaysPosts = this.getTodaysPosts();
    }

    //go to resized folder and grab the most recent post for each student
    getTodaysPosts () {
        console.log(posts);
        return null;
    }

    check () {
        return posts;
    }

    setupTest(){ //add to the scene

        // create the video element from url
        // let protoVideo = document.createElement( 'video' )
        // protoVideo.setAttribute('id', 'protoVideo')
        // protoVideo.src = "https://scontent-lga3-1.cdninstagram.com/v/t50.2886-16/125367180_843826916364667_3564841615660490363_n.mp4?_nc_ht=scontent-lga3-1.cdninstagram.com&_nc_cat=107&_nc_ohc=ImHrFkZ1GVkAX_-q_Ug&oe=5FB6A187&oh=51e86203ab5bf76414f27be6b0110138"
        // protoVideo.load() // must call after setting/changing source
        // protoVideo.loop = true
        // protoVideo.play()

        //loading video into texture
        // const protoVideoTexture = new THREE.VideoTexture( document.getElementById('protoVideo'))


        //loading photo from url
        // const protoTexture = new THREE.TextureLoader().load("https://scontent-lga3-1.cdninstagram.com/v/t51.2885-15/e35/125364127_1230307457348884_674277153923938623_n.jpg?_nc_ht=scontent-lga3-1.cdninstagram.com&_nc_cat=104&_nc_ohc=twpkkEj5BDAAX_svcnq&tp=18&oh=883284a6619ab238bde83e5cb291814f&oe=5FDD0EEE")
        // const protoTexture = new THREE.TextureLoader().load("https://scontent-lga3-1.cdninstagram.com/v/t51.2885-15/e35/55742633_587080988439344_46306404217687397_n.jpg?_nc_ht=scontent-lga3-1.cdninstagram.com&_nc_cat=108&_nc_ohc=reT_0gAvwvkAX_6CfaB&tp=1&oh=c6851409abc5764c2824f1c5a71d6921&oe=602083E2")
        const protoTexture = new THREE.TextureLoader().load(posts['kcconch']['20101005']['0']);

        //set up proto cube
        const protoGeometry = new THREE.BoxGeometry(1,1,1)
        // const protoMaterial = new THREE.MeshBasicMaterial({map: protoVideoTexture})
        const protoMaterial = new THREE.MeshBasicMaterial({map: protoTexture})

        var dayProto = new THREE.Mesh(protoGeometry, protoMaterial)

        dayProto.position.set(
            4.5,
            .5,
            0.5
        )
        // dayProto.position.set(this.location.center);

        this.scene.add(dayProto)
        console.log("PROTOTYPE ADDED")
    }
}

/*
OLD

    // async setupGrid(){
    setupGrid(){
        // console.log('set up gallery grid')
        // let bDocs = await this.db.asyncFind({type: 'B'});
        // console.log('after db load: ' + bDocs.length)
        //laborious way for now
        let index = 0;
        let xIndex = 0;
        let yIndex = 0;
        let zIndex = 0;
        // for (let b of bDocs){ //for each post b, find photos p
            // for (let p of b.links.imgs) { //just photos for now

        for (let b of testLinks){
            // log('b: ' + JSON.stringify(b));
            for (let p of b){
                //loading photo from url
                const photoTexture = new THREE.TextureLoader().load(p)
                // const photoTexture = new THREE.TextureLoader().load("https://scontent-lga3-1.cdninstagram.com/v/t51.2885-15/e35/55742633_587080988439344_46306404217687397_n.jpg?_nc_ht=scontent-lga3-1.cdninstagram.com&_nc_cat=108&_nc_ohc=reT_0gAvwvkAX_6CfaB&tp=1&oh=c6851409abc5764c2824f1c5a71d6921&oe=602083E2")

                //set up photo cube
                const photoGeometry = new THREE.BoxGeometry(1,1,1)
                const photoMaterial = new THREE.MeshBasicMaterial({map: photoTexture})
                var dayCanvas = new THREE.Mesh(photoGeometry, photoMaterial)

                //go along the grid set up in this.location
                if (index % (this.location.width * this.location.depth) == 0) {
                    yIndex++
                    xIndex = 0
                    zIndex = 0
                } else if (index % this.location.width == 0) {
                    xIndex = 0
                    zIndex++
                } else {
                    xIndex++
                }
                // log('index: ' + index + " " + xIndex + " " + yIndex + " " + zIndex)
                index++
            

                dayCanvas.position.set(
                    this.location.center.x + xIndex,
                    this.location.center.y + yIndex,
                    this.location.center.z + zIndex
                    )

                //add to scene
                this.scene.add(dayCanvas)
            }
        }
    }

    setupTest(){ //add to the scene

        // create the video element from url
        let protoVideo = document.createElement( 'video' )
        protoVideo.setAttribute('id', 'protoVideo')
        protoVideo.src = "https://scontent-lga3-1.cdninstagram.com/v/t50.2886-16/125367180_843826916364667_3564841615660490363_n.mp4?_nc_ht=scontent-lga3-1.cdninstagram.com&_nc_cat=107&_nc_ohc=ImHrFkZ1GVkAX_-q_Ug&oe=5FB6A187&oh=51e86203ab5bf76414f27be6b0110138"
        protoVideo.load() // must call after setting/changing source
        protoVideo.loop = true
        protoVideo.play()

        //loading video into texture
        const protoVideoTexture = new THREE.VideoTexture( document.getElementById('protoVideo'))


        //loading photo from url
        // const protoTexture = new THREE.TextureLoader().load("https://scontent-lga3-1.cdninstagram.com/v/t51.2885-15/e35/125364127_1230307457348884_674277153923938623_n.jpg?_nc_ht=scontent-lga3-1.cdninstagram.com&_nc_cat=104&_nc_ohc=twpkkEj5BDAAX_svcnq&tp=18&oh=883284a6619ab238bde83e5cb291814f&oe=5FDD0EEE")
        const protoTexture = new THREE.TextureLoader().load("https://scontent-lga3-1.cdninstagram.com/v/t51.2885-15/e35/55742633_587080988439344_46306404217687397_n.jpg?_nc_ht=scontent-lga3-1.cdninstagram.com&_nc_cat=108&_nc_ohc=reT_0gAvwvkAX_6CfaB&tp=1&oh=c6851409abc5764c2824f1c5a71d6921&oe=602083E2")

        //set up proto cube
        const protoGeometry = new THREE.BoxGeometry(1,1,1)
        const protoMaterial = new THREE.MeshBasicMaterial({map: protoVideoTexture})
        // const protoMaterial = new THREE.MeshBasicMaterial({map: protoTexture})


        var dayProto = new THREE.Mesh(protoGeometry, protoMaterial)

        dayProto.position.set(
            4.5,
            .5,
            0.5
        )
        // dayProto.position.set(this.location.center);

        this.scene.add(dayProto)
        console.log("PROTOTYPE ADDED")
    }
}
*/