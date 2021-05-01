import * as THREE from 'three'
import { create3DText, createSimpleText } from './utils'
import { hackToRemovePlayerTemporarily } from './index'
import { MiscModel } from './miscModels'
import { Flowers } from './flowers'
import { VideoDisplay } from './videoDisplay'
import { ImageDisplay } from './imageDisplay'

const proj_thumbnails = require('../assets/images/buds/poster-mock-up-6.png')
const cards = require('../assets/images/buds/cards/*.*')

import debugModule from 'debug'
const log = debugModule('YORB:Gallery')


export class BudsGallery {
    constructor(
      scene,
      camera,
      mouse,
      controls,
      projectionScreenManager,
      position
    ) {
        this.scene = scene
        this.mouse = mouse
        this.camera = camera
        this.controls = controls
        this.position = position || new THREE.Vector3(68.64, 0.0, 21.11)
        this.rotation = 135.09;
        // this.path = require('../assets/models/buds/buds-gallery-trees-plants_cast_shadow_test.glb')
        this.path = require('../assets/models/buds/wood-floor.glb')
        this.model;

        this.hightlightedProjectId = -1
        this.activeProjectId = -1 // will change to project ID if a project is active

        // we need some stuff to operate:
        this.raycaster = new THREE.Raycaster()
        this.textureLoader = new THREE.TextureLoader()
        this.textParser = new DOMParser()

        this.highlightMaterial = new THREE.MeshLambertMaterial({ color: 0xffff1a })
        this.linkMaterial = new THREE.MeshLambertMaterial({ color: 0xb3b3ff })
        this.linkVisitedMaterial = new THREE.MeshLambertMaterial({
            color: 0x6699ff,
        })
        this.statusBoxMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 })

        // for displaying video and screen shares
        this.displays = []
        this.cards = new Array(11)
        this.projects = []
        this.hyperlinkedObjects = []
        this.linkMaterials = {}

        window.addEventListener('click', (e) => this.onMouseClick(e), false)


        // finally, call the setup function:
        this.setup()
    }

    setup() {

      // we need to sort the artist cards before we can get them all
      let cardsSorted = cards
      cardsSorted = Object.keys(cardsSorted).sort(function(a, b) {
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
      })

      Object.keys(cards).forEach((key, i, array) =>{
        this.cards[i] = cards[cardsSorted[i]].png
        // log('key:', key, 'i: ', i)
        // log('cardsSorted[i]: ', cardsSorted[i])
        // log('this.cards[i]:', this.cards[i])
      })


      // check and see if we've visited #buds ...
      if(window.location.hash == '#buds') {

          log('entering buds gallery')

          // let spawn = new THREE.Vector3( 60.90 + Math.random()*2, 0.25, 9.88 + Math.random()*-2 )
          let spawn = new THREE.Vector3( 79.31 + Math.random() * 3, 0.25, 0.13 + Math.random() * -2 )
          this.camera.position.set(spawn.x, spawn.y, spawn.z)

          let { x, y, z } = this.position
          let look = new THREE.Vector3( x + 2, 4, z + 6 )
          this.camera.lookAt(look.x, look.y, look.z)
      }

          // this.controls.lon = 90

          // font stuffs if we need them
          var loader = new THREE.FontLoader()
          let fontJSON = require('../assets/fonts/helvetiker_bold.json')
          this.font = loader.parse(fontJSON)

          // this.setupGallery()
          // this.getProjectInfo()

          // //add welcome poster
          // const welcomeTexture = new THREE.TextureLoader().load(require('../assets/images/buds/buds_poster_20210427_med.png'));
          //
          // welcomeTexture.wrapS = THREE.RepeatWrapping
          // welcomeTexture.wrapT = THREE.RepeatWrapping
          // welcomeTexture.repeat.set(1, 1)
          //
          // const signGeometry = new THREE.PlaneBufferGeometry(4, 4, 1, 1)
          // const signMaterial = new THREE.MeshBasicMaterial({ map: welcomeTexture, transparent: true, side: THREE.DoubleSide})
          // //const signMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide})
          // const signPlane = new THREE.Mesh(signGeometry, signMaterial)
          // signPlane.position.set(78, 2, 7)
          // signPlane.rotateY(Math.PI)
          // this.scene.add(signPlane)

          //add welcome poster sprite (always facing)
          const map = new THREE.TextureLoader().load(require('../assets/images/buds/buds_poster_v5.png'));
          const material = new THREE.SpriteMaterial( { map: map } );
          const sprite = new THREE.Sprite( material );
          sprite.scale.set(4.5, 4.5, 4.5)
          sprite.position.set(78, 2.3, 7)
          sprite.rotation.set(Math.PI, 0, 0)
          this.scene.add(sprite)



         //wayfinding
         const rightArrowTexture = new THREE.TextureLoader().load(require('../assets/images/buds/buds_wayfinding_right.png'));
         const leftArrowTexture = new THREE.TextureLoader().load(require('../assets/images/buds/buds_wayfinding_left.png'));

         //locations
         //[7.554850300767336, 0.30400000000000005, 0.045147717781014535]
         //[24.16394109128646, 0.30400000000000005, -2.8441168269538]
         //[43.23795256932305, 0.25, 5.018814119622774]



         //left arrow 1
         leftArrowTexture.wrapS = THREE.RepeatWrapping
         leftArrowTexture.wrapT = THREE.RepeatWrapping
         leftArrowTexture.repeat.set(1, 1)

         const leftArrowGeo = new THREE.PlaneBufferGeometry(4, 2, 1, 1)
         const leftArrowMat = new THREE.MeshBasicMaterial({ map: leftArrowTexture, transparent: true})
         const leftArrowPlane = new THREE.Mesh(leftArrowGeo, leftArrowMat)
         //plane.lookAt(0, 1, 0)
         leftArrowPlane.position.set(7.5, 2, 2.15)
         leftArrowPlane.rotateY(Math.PI)
         this.scene.add(leftArrowPlane)


         //left arrow 2
         const leftArrowPlane2 = new THREE.Mesh(leftArrowGeo, leftArrowMat)
         //plane.lookAt(0, 1, 0)
         leftArrowPlane2.position.set(43, 2, 6)
         leftArrowPlane2.rotateY(Math.PI)
         this.scene.add(leftArrowPlane2)


         //left arrow 3
         const leftArrowPlane3 = new THREE.Mesh(leftArrowGeo, leftArrowMat)
         //plane.lookAt(0, 1, 0)
         leftArrowPlane3.position.set(24, 2, 2.15)
         leftArrowPlane3.rotateY(Math.PI)
         this.scene.add(leftArrowPlane3)




         //right arrow
         rightArrowTexture.wrapS = THREE.RepeatWrapping
         rightArrowTexture.wrapT = THREE.RepeatWrapping
         rightArrowTexture.repeat.set(1, 1)

         const rightArrowGeo = new THREE.PlaneBufferGeometry(4, 2, 1, 1)
         const rightArrowMat = new THREE.MeshBasicMaterial({ map: rightArrowTexture, transparent: true})
         const rightArrowPlane = new THREE.Mesh(rightArrowGeo, rightArrowMat)
         //plane.lookAt(0, 1, 0)
         rightArrowPlane.position.set(24, 2, -3.8)
         //rightArrowPlane.rotateY(Math.PI)
         this.scene.add(rightArrowPlane)


         //right arrow 2
         const rightArrowPlane2 = new THREE.Mesh(rightArrowGeo, rightArrowMat)
         rightArrowPlane2.position.set(7.5, 2, -3.8)
         this.scene.add(rightArrowPlane2)




         /// walls ///
         //wireframe
         this.addWall(30, 15, 98, 7.5, 20, 0xffffff, (Math.PI/3), false, true);
         this.addWall(30, 15, 58, 7.5, 20, 0xffffff, (-Math.PI/3), false, true);
         this.addWall(20, 15, 78, 7.5, 35, 0xffffff, 0, false, true);

        //transparent
         // this.addWall(30, 15, 98, 7.5, 20, 0xffffff, (Math.PI/3), true, false);
         // this.addWall(30, 15, 58, 7.5, 20, 0xffffff, (-Math.PI/3), true, false);
         // this.addWall(20, 15, 78, 7.5, 35, 0xffffff, 0, true, false);



         // //wall strip for mounting artwork
         // this.addWall(25, 4, 77, 3, 20, 0xffffff, (Math.PI/2), false, false);
         // this.addWall(25, 4, 59, 3, 20, 0xffffff, (Math.PI/2), false, false);
         // this.addWall(15, 4, 68, 3, 34, 0xffffff, 0, false, false);

         //floor

         //add welcome poster
         const floorTexture = new THREE.TextureLoader().load(require('../assets/images/buds/dirt.png'));

         floorTexture.wrapS = THREE.RepeatWrapping
         floorTexture.wrapT = THREE.RepeatWrapping
         floorTexture.repeat.set(20, 20)

         const floorGeometry = new THREE.PlaneGeometry( 30, 55, 10, 10);
         const floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture } );
         //old color
         //const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xa87d52, side: THREE.DoubleSide } );
         const floorPlane = new THREE.Mesh( floorGeometry, floorMaterial );
         floorPlane.position.set(78, .1, 20)
         floorPlane.rotation.z = (Math.PI/2)
         floorPlane.rotation.x = (-Math.PI/2)
         //floorPlane.rotation.z = (Math.PI/2)
         this.scene.add( floorPlane );

         this.setupGallery()
         this.getProjectInfo()

    }

    getProjectInfo() {
      let url = "https://billythemusical.github.io/data.json"
      let req = new XMLHttpRequest()
      req.onreadystatechange = () => {
        if (req.readyState == 4 && req.status == 200) {
          var data = JSON.parse(req.responseText)
          if (data) {
            data.forEach((key, i) => {
              this.projects.push(key)
            });
            this.projects.sort(this.sortByProperty("project_id"))
          }
        }
      }
      req.open("GET", url, true)
      req.send()
    }

    sortByProperty(property) {
       return function (a,b) {
          if( a[property] > b[property] ) {
             return 1;
          } else if ( a[property] < b[property] ) {
             return -1;
          }
          return 0;
       }
    }

    addDisplays() {

      // this.projects.forEach((proj, i) => {
      for( let i = 0; i < this.projects.length; i++) {

        const proj = this.projects[i]
        const videos = proj.videos
        const images = proj.images
        const frameColor = 0xEDF2F6
        let card = this.cards[i]

        //const frameColor = 0xcccbcc

        if (videos.length > 0) {

            let _video = videos[0]
            // let _card = cards['card_' + i]['png']

            let _playbackId = _video.mux_playback_id
            let _volume = _video.volume_factor
            let _src = "https://stream.mux.com/"+_playbackId+".m3u8"
            let _size = 3

            // create an element to be converted to a texture
            let _element = document.createElement('video')
            _element.muted = true
            _element.style.width = '1280px'
            _element.style.height = '720px'
            _element.id = _playbackId
            _element.volume = _volume
            _element.loop = true
            _element.style.display = 'none'
            _element.autoplay = true
            _element.load()
            // Let native HLS support handle it if possible
            if (_element.canPlayType('application/vnd.apple.mpegurl')) {
              _element.src = _src;
            } else if (Hls.isSupported()) {
              // HLS.js-specific setup code
              this.hls = new Hls();
              this.hls.loadSource(_src);
              this.hls.attachMedia(_element);
            }
            document.body.append(_element)

            this.displays.push(new VideoDisplay(
              this.scene,
              this.camera,
              new THREE.Vector3( 0, 0, 0 ), // position
              new THREE.Vector3( 0, 0, 0), // rotation
              _element, // the element
              card, // the card for displaying the work
              _size, // size in meters
              frameColor, // color
            ))
        } else if (images.length > 0 && videos.length < 1) {

          this.displays.push(undefined)
          // log('should be a blank display at ', i)

          // const user = proj.images[0].split('/')[0]
          // log("artist name", user)
          //
          // let _size = 3
          //
          // this.displays.push(new ImageDisplay(
          //   this.scene,
          //   this.camera,
          //   new THREE.Vector3( 0, 0, 0 ), // position
          //   new THREE.Vector3( 0, 0, 0), // rotation
          //   user, // path to images
          //   _size, // size in meters
          //   frameColor, // color
          // ))
        }
      }

      this.placeProjects()
    }

    placeProjects() {

      let loader = new THREE.TextureLoader()

      for( let i = 0; i < this.displays.length; i++) {

        // spacing the projects
        let x, y = 1.5, z, rot = 0
        let spacing = ( i % 4 ) * 6
        let frameColor = 0xEDF2F6
        let off = 12
        let card = this.cards[i]
        // if (i < 4) { // first 4 projects
        //   x = 77 + off, z = 10 + spacing, rot = Math.PI/2
        // } else if (i >= 4 && i < 7) { // next 3 projects
        //   x = 72 + off - spacing * 0.8, z = 34 //, rot = -Math.PI
        // } else if (i >= 7 && i < 12) { // last 4 projects
        //   spacing = ( i + 1 ) % 4 * 6, x = 59 + off, z = 27 - spacing, rot = -Math.PI*2.5//, frameOffset = -0.1
        // }

        //new placement
        if (i < 4) { // first 4 projects
          x = 77 + off*((4-i)/3) + 10, z = 10 + spacing, rot = Math.PI/3
        } else if (i >= 4 && i < 7) { // next 3 projects
          x = 72 + off - spacing * 1.1, z = 34 //, rot = -Math.PI
        } else if (i >= 7 && i < 12) { // last 4 projects
          spacing = ( i + 1 ) % 4 * 6, x = 59 +10 + (24-i*4), z = 27 - spacing, rot = -Math.PI/3//, frameOffset = -0.1
        }

        // hand placing photo artists
        if ( i == 2 ) { // dalit
          let path = require('../assets/images/buds/projects/dalit/day 1 - Dalit Steinbrecher small.jpg')
          let texture = loader.load( path,
              (tex) => {
                    tex.wrapS = THREE.RepeatWrapping
                    tex.wrapT = THREE.RepeatWrapping
                    tex.repeat.set(1, 1)

                    this.displays[i] = new ImageDisplay(
                      this.scene,
                      this.camera,
                      new THREE.Vector3( 0, 0, 0 ), // position
                      new THREE.Vector3( 0, 0, 0), // rotation
                      tex, // texture
                      card,
                      3, // size in meters
                      frameColor, // color
                    )
                    // console.log('loaded texture', tex, this.displays[i])
                    this.displays[i].card.translateX(0.2)
                    this.displays[i].updatePosition( x, y, z, rot ) // frameOffset )
              })

        } else if ( i == 8 ) {
          let path = require('../assets/images/buds/projects/reto/EditedWeatherRobot - Reto Chen.jpg')
          let texture = loader.load( path,
              (tex) => {
                    tex.wrapS = THREE.RepeatWrapping
                    tex.wrapT = THREE.RepeatWrapping
                    tex.repeat.set(1, 1)

                    this.displays[i] = new ImageDisplay(
                      this.scene,
                      this.camera,
                      new THREE.Vector3( 0, 0, 0 ), // position
                      new THREE.Vector3( 0, 0, 0), // rotation
                      tex, // texture
                      card,
                      3, // size in meters
                      frameColor, // color
                    )
                    // console.log('loaded texture', tex, this.displays[i])
                    // this.displays[i].card.translateX(0.09)
                    this.displays[i].updatePosition( x, y, z, rot ) // frameOffset )
                }
            )
        } else {

          const display = this.displays[i]
          display.updatePosition( x, y, z, rot ) // frameOffset )
          // display.updateVolume(volume)
        }




      }
    }

    setupGallery() {
      // this.model = new MiscModel(this.scene, this.path, this.position, this.rotation)
      this.addFlowers(30, 6.5, 0, 1)
      this.addFlowers(-11.5, 6.5, 0, 2)

    }


    addWall(wallLength, wallWidth, posX, posY, posZ, color, rotation, transparent, wireframe){

      const wallGeometry = new THREE.PlaneGeometry( wallLength, wallWidth, 8, 15 );
      // const wallMaterial = new THREE.MeshBasicMaterial({ color: color, opacity: .5, transparent: transparent, wireframe: wireframe, side: THREE.DoubleSide } );
      const wallMaterial = new THREE.MeshBasicMaterial({ color: color, wireframe: wireframe, side: THREE.DoubleSide } );
      const wallPlane = new THREE.Mesh( wallGeometry, wallMaterial );
      wallPlane.position.set(posX, posY, posZ)
      wallPlane.rotation.y = (rotation)
      this.scene.add( wallPlane );


    }

    addFlowers(posX, posY, posZ, leftSide) {
      const NUM_DAISIES = 40
      const NUM_VIOLETS = 40
      let position1 = new THREE.Vector3( posX, posY, posZ )
      let position2 = new THREE.Vector3( 78, 6.5, 36 )
      // position.add(this.position.x, this.position.y, this.position.z) // put flowers in the middle of the scene for now
      position1.add(this.position)
      //left side
      let flowers1 = new Flowers(this.scene, position1, NUM_DAISIES, NUM_VIOLETS, true, leftSide);

      //back flowers
      let flowers2 = new Flowers(this.scene, position2, Math.floor(NUM_DAISIES * 0.4), Math.floor(NUM_VIOLETS * 0.4), false, 3);

    }

    // createMovieStage() {
    //     let projectIndex = 0;
    //     let centerX = 0;
    //     let centerZ = 0;
    //     let lookAtX = 58;
    //     let lookAtZ = 0;
    //     let scaleFactor = 1
    //     let angle = 0;
    //     this.addPresentationStage(projectIndex, centerX, centerZ, lookAtX, lookAtZ, scaleFactor = 1, angle)
    //     // this.addPresentationStage(0, 0, 0, 0, 0, 1, 0)
    // }

    addLights() {

      let { x, y, z } = new THREE.Vector3 (
        this.position.x + 20,
        this.position.y,
        this.position.z + 20
      )
      for(let i = 0; i < 4; i++) {
        let width = 20;
        let light = new THREE.PointLight( 0xffffff, 3, 200, 2 );
        light.position.set(
          x + Math.sin(Math.PI*2/i)*width,
          25,
          z + Math.cos(Math.PI*2/i)*width
        );
        this.scene.add( light );
      }
    }

    addProjects() {
      let proj = {
        project_id: 0,
        project_name: "a test project",
        elevator_pitch: "this project is about my Aunt's cat from Yugoslavia.  The cat is really sort of on its own, but my Aunt cares for it, ya know?",
        description: "This part is even longer... This part is even longer... This part is even longer... This part is even longer... This part is even longer... This part is even longer... This part is even longer... This part is even longer... This part is even longer... This part is even longer... This part is even longer... This part is even longer... This part is even longer... This part is even longer... This part is even longer... This part is even longer... ",
        website: "https://google.com"
      }

      for ( let project in this.projects ) {
        let hyperlink = this.createHyperlinkedMesh(this.position.x, 1.75, this.position.z, proj)
        this.hyperlinkedObjects.push(hyperlink)
        this.scene.add(hyperlink)
      }
    }

    createHyperlinkedMesh(x, y, z, _project=null) {
        let linkDepth = 0.1
        let fontColor = 0x343434
        let statusColor = 0xffffff
        let fontSize = 0.05

        var geometry = new THREE.BoxGeometry(linkDepth, 0.75, 0.75)
        var textBoxGeometry = new THREE.BoxGeometry(linkDepth, 0.5, 0.75)

        let textBoxMat

        // check whether we've visited the link before and set material accordingly
        if (localStorage.getItem(_project.project_id) == 'visited') {
            textBoxMat = this.linkVisitedMaterial
        } else {
            textBoxMat = this.linkMaterial
        }

        let tex
        tex = this.textureLoader.load(proj_thumbnails) // default texture
        tex.wrapS = THREE.RepeatWrapping
        tex.wrapT = THREE.RepeatWrapping
        tex.repeat.set(1, 1)

        let imageMat = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            map: tex,
        })

        this.linkMaterials[_project.project_id.toString()] = imageMat

        var textSign = new THREE.Mesh(textBoxGeometry, textBoxMat)
        var imageSign = new THREE.Mesh(geometry, imageMat)

        // parse text of name and add line breaks if necessary
        var name = _project.project_name
        if (name.length > 15) {
            name = this.addLineBreak(name)
        }

        // create name text mesh
        var textMesh = createSimpleText(name, fontColor, fontSize, this.font)

        textMesh.position.x += linkDepth / 2 + 0.01 // offset forward
        textMesh.rotateY(Math.PI / 2)

        imageSign.position.set(x, y, z)
        textSign.position.set(0, -0.75 / 2 - 0.5 / 2, 0)
        textSign.add(textMesh)
        imageSign.add(textSign)

        // https://stackoverflow.com/questions/24690731/three-js-3d-models-as-hyperlink/24692057
        let now = Date.now()
        imageSign.userData = {
            project: _project,
            lastVisitedTime: now,
        }

        imageSign.name = _project.project_id

        return imageSign
    }

    generateProjectModal(project) {
        // parse project descriptions to render without &amp; etc.
        // https://stackoverflow.com/questions/3700326/decode-amp-back-to-in-javascript

        if (!document.getElementsByClassName('project-modal')[0]) {
            this.controls.pause()
            localStorage.setItem(project.project_id, 'visited')

            let id = project.project_id
            let name = project.project_name
            let pitch = project.elevator_pitch
            let description = project.description
            let link = project.website
            let room_status = this.zoomStatusDecoder(project.zoom_status)

            let modalEl = document.createElement('div')
            modalEl.className = 'project-modal'
            modalEl.id = id + '_modal'

            let contentEl = document.createElement('div')
            contentEl.className = 'project-modal-content'

            let closeButton = document.createElement('button')
            closeButton.addEventListener('click', () => {
                modalEl.remove()
                // https://stackoverflow.com/questions/19426559/three-js-access-scene-objects-by-name-or-id
                let now = Date.now()
                let link = this.scene.getObjectByName(id)
                link.userData.lastVisitedTime = now
                this.controls.resume()
                setTimeout(() => {
                    this.activeProjectId = -1
                }, 100) // this helps reset without reopening the modal
            })
            closeButton.innerHTML = 'X'

            let projectImageEl = document.createElement('img')
            let filename = 'https://itp.nyu.edu' + project.image
            // let filename = "images/proj_thumbnails/" + project.project_id + ".png";
            projectImageEl.src = filename
            projectImageEl.className = 'project-modal-img'

            let titleEl = document.createElement('h1')
            titleEl.innerHTML = name
            titleEl.className = 'project-modal-title'

            // names
            let names = ''
            for (let i = 0; i < project.users.length; i++) {
                names += project.users[i].user_name
                if (i < project.users.length - 1) {
                    names += ' & '
                }
            }
            let namesEl = document.createElement('p')
            namesEl.innerHTML = names
            namesEl.className = 'project-modal-names'

            let elevatorPitchHeaderEl = document.createElement('p')
            elevatorPitchHeaderEl.innerHTML = 'Elevator Pitch'
            let elevatorPitchEl = document.createElement('p')
            elevatorPitchEl.innerHTML = pitch
            elevatorPitchEl.className = 'project-modal-text'

            let descriptionHeaderEl = document.createElement('p')
            descriptionHeaderEl.innerHTML = 'Description'
            let descriptionEl = document.createElement('p')
            descriptionEl.innerHTML = description
            descriptionEl.className = 'project-modal-text'

            let talkToCreatorDiv = document.createElement('div')
            talkToCreatorDiv.className = 'project-modal-links-header'
            talkToCreatorDiv.innerHTML = 'Talk To The Project Creator:'

            let linksDiv = document.createElement('div')
            linksDiv.className = 'project-modal-link-container'

            let projectLinkEl = document.createElement('a')
            // projectLinkEl.href = link;
            projectLinkEl.href = project.url
            projectLinkEl.innerHTML = 'Project Website'
            projectLinkEl.target = '_blank'
            projectLinkEl.rel = 'noopener noreferrer'

            let zoomLinkEl = document.createElement('a')
            // zoomLinkEl.href = link
            zoomLinkEl.href = link
            // zoomLinkEl.innerHTML = 'Zoom Room - ' + room_status
            zoomLinkEl.innerHTML = 'Join Live Presentation!'
            zoomLinkEl.target = '_self'
            zoomLinkEl.rel = 'noopener noreferrer'

            linksDiv.appendChild(projectLinkEl)
            linksDiv.innerHTML += '&nbsp;&nbsp;&nbsp;*&nbsp;&nbsp;&nbsp;'
            if (project.zoom_status == 1) {
                linksDiv.appendChild(zoomLinkEl)
            }

            contentEl.appendChild(closeButton)
            contentEl.appendChild(projectImageEl)
            contentEl.appendChild(titleEl)
            contentEl.appendChild(namesEl)
            contentEl.appendChild(elevatorPitchHeaderEl)
            contentEl.appendChild(elevatorPitchEl)
            contentEl.appendChild(descriptionHeaderEl)
            contentEl.appendChild(descriptionEl)
            contentEl.appendChild(talkToCreatorDiv)
            contentEl.appendChild(linksDiv)

            modalEl.appendChild(contentEl)
            document.body.appendChild(modalEl)
        }
    }

    /*
     * highlightHyperlinks()
     *
     * Description:
     * 	- checks distance between player and object3Ds in this.hyperlinkedObjects array,
     * 	- calls this.generateProjectModal for any projects under a threshold distance
     *
     */
    highlightHyperlinks() {
        let thresholdDist = 5
        let now = Date.now()

        // store reference to last highlighted project id
        let lastHighlightedProjectId = this.hightlightedProjectId

        // cast ray out from camera
        this.raycaster.setFromCamera(this.mouse, this.camera)

        var intersects = this.raycaster.intersectObjects(this.hyperlinkedObjects)

        // if we have intersections, highlight them
        if (intersects.length > 0) {
            if (intersects[0].distance < thresholdDist) {
                let link = intersects[0].object
                this.hightlightedProjectId = link.userData.project.project_id
                // do styling
                this.highlightLink(link)
            }
        }

        // if we've changed which project is highlighted
        if (lastHighlightedProjectId != this.hightlightedProjectId) {
            let link = this.scene.getObjectByName(lastHighlightedProjectId)
            if (link != null) {
                // reset styling
                this.resetLinkMaterial(link)
            }
        } else {
            // no change, so lets check for
            let link = this.scene.getObjectByName(this.hightlightedProjectId)
            if (link != null) {
                if (now - link.userData.lastVisitedTime > 500) {
                    // reset styling
                    this.hightlightedProjectId = -1
                    this.resetLinkMaterial(link)
                }
            }
        }
    }

    highlightLink(link) {
        let now = Date.now()
        link.userData.lastVisitedTime = now
        link.userData.highlighted = true

        link.children[0].material = this.highlightMaterial
        link.scale.set(1.1, 1.1, 1.1)
    }

    resetLinkMaterial(link) {
        link.scale.set(1, 1, 1)
        // reset according to whether we have visited it or not yet
        let mat
        // check whether we've visited the link before and set material accordingly
        if (localStorage.getItem(link.userData.project.project_id) == 'visited') {
            mat = this.linkVisitedMaterial
        } else {
            mat = this.linkMaterial
        }
        // log(link);
        link.children[0].material = mat
    }

    activateHighlightedProject() {
        if (this.hightlightedProjectId != -1 && this.activeProjectId === -1) {
            let link = this.scene.getObjectByName(this.hightlightedProjectId)
            if (link != null) {
                this.generateProjectModal(link.userData.project)
                hackToRemovePlayerTemporarily()

                // reset markers
                this.activeProjectId = link.userData.project.project_id
            }
        }
    }

    onMouseClick(e) {
        this.activateHighlightedProject()
    }

    updateDisplays() {
      // do nothing
      for( let display of this.displays ) {
        if (display) {
          if (display.type == 'video') {
            if ( true ) { // check distance
              let element = display.element
              let texture = display.screen.mesh.texture
              if ( element.readyState >= element.HAVE_CURRENT_DATA ) {
                  texture.update()
              }
            }
          }
        }
      }
    }
}
