/*
 * YORB 2020
 *
 * Aidan Nelson, April 2020
 *
 */

//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
// IMPORTS
//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
import 'regenerator-runtime/runtime';

import { Yorb } from './yorb';
import {setupMediasoup, joinRoom, toggleWebcamVideoPauseState, toggleScreenshareAudioPauseState, toggleWebcamAudioPauseState, toggleScreenshareVideoPauseState, getMicPausedState, getCamPausedState, getScreenAudioPausedState, getScreenPausedState, startScreenshare} from "./signaling"

const io = require('socket.io-client');
const socketPromise = require('./libs/socket.io-promise').promise;
// const hostname = window.location.hostname;

// import * as config from '../../server/config';
import debugModule from 'debug';

const log = debugModule('YORB');
const warn = debugModule('YORB:WARN');
const err = debugModule('YORB:ERROR');
const info = debugModule('YORB:INFO');

// load p5 for self view
const p5 = require('p5');

let WEB_SOCKET_SERVER = false;
let INSTANCE_PATH = false;

// For running against local server
// WEB_SOCKET_SERVER = 'localhost:3000'
// INSTANCE_PATH = '/socket.io'

// For running against ITP server
WEB_SOCKET_SERVER = 'https://yorb.itp.io';
INSTANCE_PATH = '/socket.io';

//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
// Setup Global Variables:
//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//

//
// export all the references we use internally to manage call state,
// to make it easy to tinker from the js console. for example:
//
//   `Client.camVideoProducer.paused`
//
export let mySocketID,
    socket,
    yorbScene,
    projects = [],
    miniMapSketch,
    selfViewSketch,
    initialized = false;

window.clients = {}; // array of connected clients for three.js scene
window.lastPollSyncData = {};

//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
// Start-Up Sequence:
//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//

// start with user interaction with the DOM so we can auto-play audio/video from
// now on...
window.onload = async () => {
    info('Window loaded.');

    createScene();
    createMiniMap();

    await initSocketConnection();

    // use sendBeacon to tell the server we're disconnecting when
    // the page unloads
    window.addEventListener('unload', () => {
        socket.request('leave', {});
    });

    alert('Allow YORB to access your webcam for the full experience');
    await setupMediasoup();

    var startButton = document.getElementById('startButton');
    startButton.addEventListener('click', init);
};

async function init() {
    document.getElementById('overlay').style.visibility = 'hidden';

    // only join room after we user has interacted with DOM (to ensure that media elements play)
    if (!initialized) {
        await joinRoom();
        setupControls();
        turnGravityOn();
        initialized = true;
    }
}

export function shareScreen(screenId) {
    info('Starting screenshare to screen with ID ', screenId);
    startScreenshare(screenId);
}

//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
// Socket.io
//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//

// establishes socket connection
// uses promise to ensure that we receive our so
function initSocketConnection() {
    return new Promise((resolve) => {
        info('Initializing socket.io...');
        if (WEB_SOCKET_SERVER && INSTANCE_PATH) {
            socket = io(WEB_SOCKET_SERVER, {
                path: INSTANCE_PATH,
            });
        } else {
            socket = io();
        }
        window.socket = socket;
        socket.request = socketPromise(socket);

        socket.on('connect', () => {});

        //On connection server sends the client his ID and a list of all keys
        socket.on('introduction', (_id, _ids) => {
            // keep a local copy of my ID:
            info('My socket ID is: ' + _id);
            mySocketID = _id;

            // for each existing user, add them as a client and add tracks to their peer connection
            for (let i = 0; i < _ids.length; i++) {
                if (_ids[i] != mySocketID) {
                    addClient(_ids[i]);
                }
            }
            resolve();
        });

        // when a new user has entered the server
        socket.on('newUserConnected', (clientCount, _id, _ids) => {
            info(clientCount + ' clients connected');

            if (!(_id in clients)) {
                if (_id != mySocketID) {
                    info('A new user connected with the id: ' + _id);
                    addClient(_id);
                }
            }
        });

        socket.on('projects', (_projects) => {
            info('Received project list from server.');
            updateProjects(_projects);
        });

        socket.on('userDisconnected', (_id, _ids) => {
            // Update the data from the server

            if (_id in clients) {
                if (_id == mySocketID) {
                    info('Uh oh!  The server thinks we disconnected!');
                } else {
                    info('A user disconnected with the id: ' + _id);
                    yorbScene.removeClient(_id);
                    removeClientDOMElements(_id);
                    delete clients[_id];
                }
            }
        });

        // Update when one of the users moves in space
        socket.on('userPositions', (_clientProps) => {
            yorbScene.updateClientPositions(_clientProps);
        });

        socket.on('projectionScreenUpdate', (_clientProps) => {
            yorbScene.updateProjectionScreenOwnership(_clientProps);
        });

        // listen for projection screen changes:
        socket.on('releaseProjectionScreen', (data) => {
            info('Releasing screen with id', data.screenId);
            yorbScene.releaseProjectionScreen(data.screenId);
        });
    });
}

//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
// Clients 
//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//

// Adds client object with THREE.js object, DOM video object and and an RTC peer connection for each :
async function addClient(_id) {
    info('Adding client with id ' + _id);
    clients[_id] = {};
    yorbScene.addClient(_id);
}

function updateProjects(_projects) {
    projects = _projects;
    if (yorbScene.updateProjects) {
        yorbScene.updateProjects(projects);
        yorbScene.createHtmlProjectList(projects);
    }
}

//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
// Three.js 🌻
//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//

function onPlayerMove() {
    socket.emit('move', yorbScene.getPlayerPosition());
}

export function hackToRemovePlayerTemporarily() {
    info('removing user temporarily');
    let pos = [0, 10000, 0];
    let rotation = [0, 0, 0];
    socket.emit('move', [pos, rotation]);

    for (let _id in clients) {
        pauseAllConsumersForPeer(_id);
    }
}

function createScene() {
    // initialize three.js scene
    info('Creating three.js scene...');
    yorbScene = new Yorb(onPlayerMove, clients, mySocketID);
    yorbScene.updateProjects(projects);
}

//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//
// User Interface 🚂
//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//==//

// notes for myself (and anyone else...)
// the webcam can be in a few different states:
// 	- we have not yet requested user media
// 	- we have requested user media but have been denied
// 	- we do have user media

// the send transport can be in a few different states:
// 	- we have not yet set it up
// 	- we have set it up and are currently sending camera and microphone feeds
// 	- we have set it up, but are not sending camera or microphone feeds (i.e. we are paused)

function setupControls() {
    window.addEventListener(
        'keyup',
        (e) => {
            if (e.keyCode == 67) {
                // "C"
                toggleWebcamVideoPauseState();
            }
            if (e.keyCode == 77) {
                // "M"
                toggleWebcamAudioPauseState();
            }
            if (e.keyCode == 49) {
                // "1"
                yorbScene.swapMaterials();
            }
            if (e.keyCode == 80) {
                // 'p'
                let position = yorbScene.getPlayerPosition()[0];
                console.log(position);
                let url = `https://yorb.itp.io/?x=${position[0].toFixed(2)}&y=${position[1].toFixed(2)}&z=${position[2].toFixed(2)}`;
                console.log('Have your friends meet you here: ', url);
                makePositionLinkModal(position);
            }
        },
        false
    );
}

function makePositionLinkModal(position) {
    // parse project descriptions to render without &amp; etc.
    // https://stackoverflow.com/questions/3700326/decode-amp-back-to-in-javascript

    if (!document.getElementsByClassName('project-modal')[0]) {
        yorbScene.controls.pause();
        let modalEl = document.createElement('div');
        modalEl.className = 'project-modal';
        modalEl.id = 'link_modal';

        let contentEl = document.createElement('div');
        contentEl.className = 'project-modal-content';

        let link = `https://yorb.itp.io/?x=${position[0].toFixed(2)}&y=${position[1].toFixed(2)}&z=${position[2].toFixed(2)}`;

        let linkEl = document.createElement('a');
        linkEl.href = link;
        linkEl.innerHTML = 'Have your friends meet you with this link!';
        linkEl.target = '_blank';
        linkEl.rel = 'noopener noreferrer';

        let closeButton = document.createElement('button');
        closeButton.addEventListener('click', () => {
            modalEl.remove();
            yorbScene.controls.resume();
        });
        closeButton.innerHTML = 'X';


        let spacerDiv = document.createElement('div');
        spacerDiv.innerHTML += "<br><br>"

        let spacerDiv2 = document.createElement('div');
        spacerDiv2.innerHTML += "<br><br>"

        contentEl.appendChild(closeButton);
        contentEl.appendChild(spacerDiv)
        contentEl.appendChild(linkEl);
        contentEl.appendChild(spacerDiv2)

        modalEl.appendChild(contentEl);
        document.body.appendChild(modalEl);
    }
}

function turnGravityOn() {
    yorbScene.controls.turnGravityOn();
}

export function toggleWebcamImage() {
    let webcamImage = document.getElementById('webcam-status-image');
    if (getCamPausedState()) {
        webcamImage.src = require('../assets/images/no-webcam.png');
    } else {
        webcamImage.src = require('../assets/images/webcam.png');
    }
}

export function toggleMicrophoneImage() {
    let micImg = document.getElementById('microphone-status-image');
    if (getMicPausedState()) {
        micImg.src = require('../assets/images/no-mic.png');
    } else {
        micImg.src = require('../assets/images/mic.png');
    }
}

// adapted (with ❤️) from Dan Shiffman: https://www.youtube.com/watch?v=rNqaw8LT2ZU
async function createSelfView() {
    const s = (sketch) => {
        let video;
        var vScale = 10;
        let ballX = 100;
        let ballY = 100;
        let velocityX = sketch.random(-5, 5);
        let velocityY = sketch.random(-5, 5);
        let buffer = 10;

        sketch.setup = () => {
            let canvas = sketch.createCanvas(260, 200);
            ballX = sketch.width / 2;
            ballY = sketch.height / 2;
            sketch.pixelDensity(1);
            video = sketch.createCapture(sketch.VIDEO);
            video.size(sketch.width / vScale, sketch.height / vScale);
            video.hide();
            sketch.frameRate(5);
            sketch.rectMode(sketch.CENTER);
            sketch.ellipseMode(sketch.CENTER);
        };

        sketch.draw = () => {
            if (webcamVideoPaused) {
                // bouncing ball easter egg sketch:
                sketch.background(10, 10, 200);
                ballX += velocityX;
                ballY += velocityY;
                if (ballX >= sketch.width - buffer || ballX <= buffer) {
                    velocityX = -velocityX;
                }
                if (ballY >= sketch.height - buffer || ballY <= buffer) {
                    velocityY = -velocityY;
                }
                sketch.fill(240, 120, 0);
                sketch.ellipse(ballX, ballY, 10, 10);
            } else {
                sketch.background(0);
                video.loadPixels();
                for (var y = 0; y < video.height; y++) {
                    for (var x = 0; x < video.width; x++) {
                        var index = (video.width - x + 1 + y * video.width) * 4;
                        var r = video.pixels[index + 0];
                        var g = video.pixels[index + 1];
                        var b = video.pixels[index + 2];
                        var bright = (r + g + b) / 3;
                        var w = sketch.map(bright, 0, 255, 0, vScale);
                        sketch.noStroke();
                        sketch.fill(255);
                        sketch.rectMode(sketch.CENTER);
                        sketch.rect(x * vScale, y * vScale, w, w);
                    }
                }
            }
        };
    };
    selfViewSketch = new p5(s, document.getElementById('self-view-canvas-container'));
    selfViewSketch.canvas.style = 'display: block; margin: 0 auto;';
}

// creates minimap p5 sketch
async function createMiniMap() {
    const s = (sketch) => {
        let mapImg = false;

        sketch.setup = () => {
            mapImg = sketch.loadImage(require('../assets/images/map.png'));
            sketch.createCanvas(300, 300);
            sketch.pixelDensity(1);
            sketch.frameRate(5);
            sketch.ellipseMode(sketch.CENTER);
            sketch.imageMode(sketch.CENTER);
            sketch.angleMode(sketch.RADIANS);
        };

        sketch.draw = () => {
            sketch.background(0);
            sketch.push();

            // translate to center of sketch
            sketch.translate(sketch.width / 2, sketch.height / 2);
            //translate to 0,0 position of map and make all translations from there
            let playerPosition = yorbScene.getPlayerPosition();
            let posX = playerPosition[0][0];
            let posZ = playerPosition[0][2];

            // TODO add in direction...
            // let myDir = playerPosition[1][1]; // camera rotation about Y in Euler Radians

            // always draw player at center:
            sketch.push();
            sketch.fill(255, 255, 0);
            sketch.ellipse(0, 0, 7, 7);
            // TODO add in direction...
            // sketch.fill(0, 0, 255,150);
            // sketch.rotate(myDir);
            // sketch.triangle(0, 0, -10, -30, 10, -30);
            sketch.pop();

            let mappedX = sketch.map(posZ, 0, 32, 0, -225, false);
            let mappedY = sketch.map(posX, 0, 32, 0, 225, false);
            // allow for map load time without using preload, which seems to mess with things in p5 instance mode...
            sketch.push();
            sketch.rotate(Math.PI);
            sketch.translate(mappedX, mappedY);
            if (mapImg) {
                sketch.image(mapImg, 0, 0, mapImg.width, mapImg.height);
            }
            for (let id in clients) {
                let pos = clients[id].group.position; // [x,y,z] array of position
                let yPos = sketch.map(pos.x, 0, 32, 0, -225, false);
                let xPos = sketch.map(pos.z, 0, 32, 0, 225, false);
                sketch.push();
                sketch.fill(100, 100, 255);
                sketch.translate(xPos, yPos);
                sketch.ellipse(0, 0, 5, 5);
                sketch.pop();
            }
            sketch.pop();
            sketch.pop();
        };
    };
    miniMapSketch = new p5(s, document.getElementById('mini-map-canvas-container'));
    miniMapSketch.canvas.style = 'display: block; margin: 0 auto;';
}

// remove <video> element and corresponding <canvas> using client ID
function removeClientDOMElements(_id) {
    info('Removing DOM elements for client with ID: ' + _id);

    let videoEl = document.getElementById(_id + '_video');
    if (videoEl != null) {
        videoEl.remove();
    }
    let canvasEl = document.getElementById(_id + '_canvas');
    if (canvasEl != null) {
        canvasEl.remove();
    }
    let audioEl = document.getElementById(_id + '_audio');
    if (audioEl != null) {
        audioEl.remove();
    }
}
