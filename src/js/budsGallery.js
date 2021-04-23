import * as THREE from 'three'
import { create3DText, createSimpleText } from './utils'
import { hackToRemovePlayerTemporarily } from './index'
import { MiscModel } from './miscModels'
import { Flowers } from './flowers'
import { VideoDisplay } from './videoDisplay'
import { ImageDisplay } from './imageDisplay'

const proj_thumbnails = require('../assets/images/buds/projects/poster-mock-up-6.png')

import debugModule from 'debug'
const log = debugModule('YORB:Gallery')

export class BudsGallery {
    constructor(
      scene,
      camera,
      mouse,
      controls,
      projectionScreens,
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
        this.projectionScreenManager = projectionScreens
        this.videoDisplays = []
        // this.hls = document.createElement('script') // doesn't work

        this.projects = []
        this.hyperlinkedObjects = []
        this.linkMaterials = {}

        window.addEventListener('click', (e) => this.onMouseClick(e), false)


        // finally, call the setup function:
        this.setup()
    }

    setup() {

      // check and see if we've visited #buds ...
      if(window.location.hash == '#buds') {

          log('entering buds gallery')

          let spawn = new THREE.Vector3( 60.90 + Math.random()*2, 0.25, 9.88 + Math.random()*-2 )
          this.camera.position.set(spawn.x, spawn.y, spawn.z)

          let { x, y, z } = this.position
          let look = new THREE.Vector3( x + 2, 4, z + 6 )
          this.camera.lookAt(look.x, look.y, look.z)

          // font stuffs if we need them
          var loader = new THREE.FontLoader()
          let fontJSON = require('../assets/fonts/helvetiker_bold.json')
          this.font = loader.parse(fontJSON)

          this.setupGallery()
          this.getProjectInfo()

          //add welcome poster
          const welcomeTexture = new THREE.TextureLoader().load(require('../assets/images/buds/buds_poster_v5.png'));

          welcomeTexture.wrapS = THREE.RepeatWrapping
          welcomeTexture.wrapT = THREE.RepeatWrapping
          welcomeTexture.repeat.set(1, 1)

          const signGeometry = new THREE.PlaneBufferGeometry(4, 4, 1, 1)
          const signMaterial = new THREE.MeshBasicMaterial({ map: welcomeTexture, transparent: true})
          //const signMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide})
          const signPlane = new THREE.Mesh(signGeometry, signMaterial)
          signPlane.position.set(78, 2, 3.9363442608970143)
          signPlane.rotateY(Math.PI)
          this.scene.add(signPlane)




         /// walls ///
         //wireframe
         this.addWall(30, 15, 98, 7.5, 20, 0xffffff, (Math.PI/3), false, true);
         this.addWall(30, 15, 58, 7.5, 20, 0xffffff, (-Math.PI/3), false, true);
         this.addWall(20, 15, 78, 7.5, 35, 0xffffff, 0, false, true);

        //transparent
         this.addWall(30, 15, 98, 7.5, 20, 0xffffff, (Math.PI/3), true, false);
         this.addWall(30, 15, 58, 7.5, 20, 0xffffff, (-Math.PI/3), true, false);
         this.addWall(20, 15, 78, 7.5, 35, 0xffffff, 0, true, false);



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
        } // end of "if" for window.location.hash, a way to hide parts of YORB!

    }

    getProjectInfo() {
      let url = "https://billythemusical.github.io/data.json"
      let req = new XMLHttpRequest()
      req.onreadystatechange = () => {
        if (req.readyState == 4 && req.status == 200) {
          var data = JSON.parse(req.responseText)
          if (data) data.forEach((key, i) => {
            this.projects.push(key)
          });
          if(this.projects.length == 11) {
            this.addVideoDisplays()
          }
        }
      }
      req.open("GET", url, true)
      req.send()
    }

    addVideoDisplays() {

      // this.projects.forEach((proj, i) => {
      for( let i = 0; i < this.projects.length; i++) {

        const proj = this.projects[i]
        const videos = proj.videos
        const images = proj.images

        if (videos.length > 0) {
          videos.forEach((_video, j)=>{
            let _playbackId = _video.mux_playback_id

            let _volume = _video.volume_factor
            let _element;
            let _src = "https://stream.mux.com/"+_playbackId+".m3u8"
            let _size = 3
            let _frameColor = 0x6bdcff
            // log("this project's info: ", playback_id, volume)

            // create an element to be converted to a texture
            _element = document.createElement('video')
            _element.id = _playbackId
            _element.volume = _volume
            _element.loop = true
            _element.style.display = 'none'
            _element.autoplay = true
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

            this.videoDisplays.push(new VideoDisplay(
              this.scene,
              this.camera,
              new THREE.Vector3( 0, 0, 0 ), // position
              new THREE.Vector3(0 , 0, 0), // rotation
              _element, // the element
              _size, // size in meters
              _frameColor, // color
            ))
          })

        } else if (images.length > 0 && videos.length < 1) {

          let _element;
          let _src = images[0]
          let _size = 3
          let _frameColor = 0x6bdcff
          // log("this project's info: ", playback_id, volume)

          // create an element to be converted to a texture
          _element = document.createElement('image')
          _element.id = proj.artist_name
          _element.style.display = 'none'
          document.body.append(_element)

          this.videoDisplays.push(new ImageDisplay(
            this.scene,
            this.camera,
            new THREE.Vector3( 0, 0, 0 ), // position
            new THREE.Vector3(0 , 0, 0), // rotation
            _element, // the element
            _size, // size in meters
            _frameColor, // color
          ))
        }
      }

      this.placeProjects()
    }

    placeProjects() {

      for( let i = 0; i < this.videoDisplays.length; i++) {

        // spacing the projects
        let x, y = 2, z, rot
        let spacing = ( i % 4 ) * 6
        let frameColor = 0x6bdcff

        if (i < 4) { // first 4 projects
          x = 77, z = 10 + spacing, rot = Math.PI/2
        } else if (i >= 4 && i < 7) { // next 3 projects
          x = 72 - spacing * 0.8, z = 34, rot = -Math.PI
        } else if (i >= 7 && i < 12) { // last 4 projects
          spacing = ( i + 1 ) % 4 * 6, x = 59, z = 27 - spacing, rot = -Math.PI*2.5//, frameOffset = -0.1
        }

        const display = this.videoDisplays[i]
        display.updatePosition( x, y, z, rot ) // frameOffset )
        // display.updateVolume(volume)
      }
    }

    setupGallery() {
      // this.model = new MiscModel(this.scene, this.path, this.position, this.rotation)
      this.addFlowers(30, 6.5, 0, 1)
      this.addFlowers(-11.5, 6.5, 0, 2)

    }


    addWall(wallLength, wallWidth, posX, posY, posZ, color, rotation, transparent, wireframe){

      const wallGeometry = new THREE.PlaneGeometry( wallLength, wallWidth, 8, 15 );
      const wallMaterial = new THREE.MeshBasicMaterial({ color: color, opacity: .5, transparent: transparent, wireframe: wireframe, side: THREE.DoubleSide } );
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
      let flowers2 = new Flowers(this.scene, position2, NUM_DAISIES, NUM_VIOLETS, false, 3);

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

    addPresentationStage(projectIndex, centerX, centerZ, lookAtX, lookAtZ, scaleFactor = 1, angle) {
      // The alphabet (for project labels)
      const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' // now i know by ABCs next time won't you sing with me
      // pick colors
      const OUTER_FENCE_COLOR = 0x232323 //0x232378
      const ENTRANCE_COLOR = 0xf9f910
      const STAGE_COLOR = 0x232323
      const DOME_COLOR = 0x232323
      const PROJECT_NUMBER_COLOR = 0xffffff

      //sky colors -- same as fences
      const SKY_COLOR_BLUE_ROOM = 0x1250CC;
      const SKY_COLOR_PINK_ROOM = 0xe49add;
      const SKY_COLOR_YELLOW_ROOM = 0xfd8f20;
      const SKY_COLOR_GREEN_ROOM = 0x18DD6C;

      //room colors
      //all have two colors plus one accent color. all use accen colors that are main colors from other rooms except the greenn room
      //blue
      const COL_MAIN_BLUE = 0x4b4ff4
      const COL_SECOND_BLUE = 0x05c1da
      //accent: colmainPink = 0xfc3691
      //COL_MAIN_BLUE, COL_SECOND_BLUE, COL_MAIN_PINK

      //pink rooms
      const COL_MAIN_PINK = 0xfc3691
      const COL_SECOND_PINK = 0xfb69b9
      const COL_MAIN_GREEN = 0x9be210
      //accent: colmainGreen = 0x9be210
      // COL_MAIN_PINK, COL_SECOND_PINK, COL_MAIN_GREEN

      //yellow rooms
      const COL_MAIN_YELLOW = 0xffd810
      const COL_SECOND_YELLOW = 0xf4d01d
      // accent: const colmainBlue = 0x4b4ff4
      //COL_MAIN_YELLOW, COL_SECOND_YELLOW, COL_MAIN_BLUE


      //green rooms
      const COL_ACCENT_BLUE = 0x67D6B5;
      const COL_SECOND_GREEN = 0x77E424;
      const COL_ACCENT_YELLOW = 0xF9F912;
      //
      // COL_ACCENT_BLUE, COL_SECOND_GREEN, COL_ACCENT_YELLOW

      // other parameters:
      const NUMBER_OF_PROJECTS = 8
      const RADIUS = 30
      const FENCE_RADIUS = RADIUS + 10
      const FENCE_HEIGHT = 12

        // add the stage itself
        const cylinderGeometry = new THREE.CylinderBufferGeometry(3 * scaleFactor, 3 * scaleFactor, 1, 32, 1, false)
        const cylinderMaterial = new THREE.MeshPhongMaterial({ color: STAGE_COLOR, side: THREE.DoubleSide })
        const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
        cylinder.position.set(centerX, 0, centerZ)
        this.scene.add(cylinder)


        // making a mini dome
        //https://threejsfundamentals.org/threejs/lessons/threejs-primitives.html
        //trying sphereGeometryconst radius = 7;
        const radius = 7
        const widthSegments = 12
        const heightSegments = 8
        const phiStart = Math.PI * 0
        const phiLength = Math.PI * 1
        const thetaStart = Math.PI * 0.0
        const thetaLength = Math.PI * 0.9
        const domeGeometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength)

        domeGeometry.scale(0.7, 0.7, 0.7)
        const domeMaterial = new THREE.MeshPhongMaterial({ color: DOME_COLOR, side: THREE.DoubleSide })
        const domeMesh = new THREE.Mesh(domeGeometry, domeMaterial)
        domeMesh.position.set(centerX, 1, centerZ)
        domeMesh.lookAt(lookAtX, 2, lookAtZ)
        // domeMesh.translatefZ(-6.5)
        domeMesh.rotateY(Math.PI)
        // domeMesh.rotateX(Math.PI/2)
        // domeMesh.rotateZ(Math.PI/2)
        this.scene.add(domeMesh)

        /// Font for back walls
        this.projectionScreenManager.addScreen(centerX, 2, centerZ, lookAtX, 2, lookAtZ, scaleFactor)
  }

  // updateProjects(projects) {
  //     // do nothing
  // }
  //
  // _updateProjects() {
  //   // do nothing
  // }
  //
  // update() {
  //   // do nothing
  // }
}
