import * as THREE from 'three'
// const projImagePaths = require('../assets/images/buds/projects/images/**/*')
// const cards = require('../assets/images/buds/cards/*.*')
// console.log("projImagePaths", projImagePaths)

export class ImageDisplay {
  constructor(scene, camera, position, rotation, texture, cardImagePath, size=3, frameColor=0xEDF2F6, frameOffset=0.1) {
    this.scene = scene
    this.camera = camera

    this.screen
    this.frame
    this.frameColor = frameColor
    this.frameOffset = frameOffset
    this.texture = texture;
    this.index = 0
    this.position = position
    this.rotation = rotation

    this.WIDTH = size
    this.ASPECT = 1920/1080
    this.HEIGHT = this.WIDTH / this.ASPECT
    this.type = 'image'
    this.loaded = true
    this.time = Date.now()

    // artist name and project description card
    this.card
    this.cardImagePath = cardImagePath

    // border
    this.border
    this.borderColor = 0x191919

    // this.loadImages()
    this.setup()

  }

  loadImages() {
      // let textures = this.imageTextures
      // let scene = this.scene
      // let screen = this.screen
      // let setup = this.setup
      // let loader = new THREE.TextureLoader()
      // console.log("projectPhotos keys", Object.keys(this.projImagePaths))
      // Object.keys( this.projImagePaths ).forEach(
      //     function (key, i, projImagePaths) {
      //       // get the image paths from projImagePaths
      //       let imagePath = projImagePaths[ i ] + '.jpg'
      //       console.log(imagePath)
      //       let texture = loader.load(
      //           imagePath,
      //           // callback once loaded
      //           function (tex) {
      //             tex.wrapS = THREE.RepeatWrapping
      //             tex.wrapT = THREE.RepeatWrapping
      //             tex.repeat.set(1, 1)
      //             textures.push(
      //                 {
      //                   texture: tex,
      //                   width: tex.image.width,
      //                   height: tex.image.height,
      //                   needsUpdate: true
      //                 }
      //             )
      //             console.log('imageDisplay.js: IMAGE LOADED', imageTexture)
      //           }
      //       )
      //       if (i == projImagePaths.length - 1) {
      //         setup()
      //       }
      //     }
      //   )

      console.log('projImagePaths: ', this.projImagePaths)

          // instantiate a loader
      let loader = new THREE.TextureLoader();

      let texturePromises = []
      let path = '../assets/images/buds/projects/' + this.user

      for (let key in this.projImagePaths) {
        texturePromises.push(new Promise((resolve, reject) => {
          var photo = this.projImagePaths[key]['jpg']
          var url = path + photo
          console.log("filename ", photo)
          console.log("url", url)
          loader.load(url,
            texture => {
              console.log("success with ", texture)
              photo.val = texture;
              if (photo.val instanceof THREE.Texture) resolve(photo);
            },
            xhr => {
              console.log(url + ' ' + (xhr.loaded / xhr.total * 100) +
                '% loaded');
            },
            xhr => {
              reject(new Error(xhr +
                'An error occurred loading while loading: ' +
                photo.url));
            }
          );
        }));
      }

      // load the geometry and the textures
      Promise.all(texturePromises).then(loadedTextures => {
        this.imageTextures = loadedTextures
        this.setup()
      });
  }


  setup() {

    let frameGeometry, frameMaterial;
    // Add backing to display area

    // resize based on the image's natural width and height
    this.ASPECT = this.texture.image.width / this.texture.image.height // retain the natural size of the photo

    if ( this.ASPECT  < 1.0 ) {

      frameGeometry = new THREE.PlaneBufferGeometry( this.WIDTH*1.1, this.HEIGHT*1.6, 8, 15 );
      frameMaterial = new THREE.MeshBasicMaterial({ color: this.frameColor, side: THREE.DoubleSide } );

      this.WIDTH = 1.7
      this.HEIGHT = this.WIDTH / this.ASPECT

    } else {

      frameGeometry = new THREE.PlaneBufferGeometry( this.WIDTH*1.6, this.HEIGHT*1.5, 8, 15 );
      frameMaterial = new THREE.MeshBasicMaterial({ color: this.frameColor, side: THREE.DoubleSide } );

    }

    this.frame = new THREE.Mesh( frameGeometry, frameMaterial );
    this.frame.position.set( -this.WIDTH*0.1, 0, 0.08 )


    //adding border
    const borderGeometry = new THREE.PlaneBufferGeometry( this.WIDTH*1.1, this.HEIGHT*1.1, 1, 1 );
    const borderMaterial = new THREE.MeshBasicMaterial({ color: this.borderColor, side: THREE.DoubleSide } );
    this.border = new THREE.Mesh( borderGeometry, borderMaterial );
    this.border.position.set( 0, 0, 0.07 )

    // adding an image
    let imageGeometry = new THREE.BoxBufferGeometry(this.WIDTH , this.HEIGHT, .1, 8, 15)
    let imageMaterial = new THREE.MeshBasicMaterial({ map: this.texture })
    this.screen = new THREE.Mesh(imageGeometry, imageMaterial)
    this.screen.position.set(this.position.x, this.position.y, this.position.z);
    this.screen.rotation.x = this.rotation.x; // screen.rotation.x = 0.1;
    this.screen.rotation.y = this.rotation.y; // screen.rotation.y = 0.2;
    this.screen.rotation.z = this.rotation.z;

    this.screen.add( this.frame )
    this.screen.add( this.border )
    this.scene.add( this.screen )


    // artist info card
    let cardTexture = new THREE.TextureLoader().load( this.cardImagePath );
    cardTexture.wrapS = THREE.RepeatWrapping
    cardTexture.wrapT = THREE.RepeatWrapping
    cardTexture.repeat.set(1, 1)

    // add card next to display with a backing
    let cardAspect = 1.6554347826086957
    let cardGeometry = new THREE.PlaneBufferGeometry(0.4 * cardAspect, 0.4, 1, 1)
    let cardMaterial = new THREE.MeshBasicMaterial({ map: cardTexture, transparent: true})
    this.card = new THREE.Mesh(cardGeometry, cardMaterial)
    this.card.rotateY( Math.PI * 0.95 )
    // this.card.position.set( -this.WIDTH * 0.7 , 0, -0.12 )
    this.card.position.set( -this.WIDTH * 0.7 , 0, -0.1 )

    const backingGeometry = new THREE.PlaneBufferGeometry( 0.45 * cardAspect , 0.45 , 1 , 1 );
    // const backingMaterial = new THREE.MeshBasicMaterial({ color: 0xffc0cb, opacity: 0.9, transparent: true, side: THREE.DoubleSide } );
    const backingMaterial = new THREE.MeshBasicMaterial({ color: 0x6bdcff, side: THREE.DoubleSide } ); // pink 0xffc0cb
    const backing = new THREE.Mesh( backingGeometry, backingMaterial );
    backing.position.set( 0, 0, -0.01 )

    this.card.add( backing )
    this.screen.add( this.card )

  }

  updatePosition(x, y, z, rot, frameOffset=0.0) {
    if (this.loaded) {
      this.screen.position.set( x, y, z )
      this.screen.rotateY( rot )
      this.frame.translateZ( frameOffset )
    }
  }

  updatePhoto( currentTime, click=false ) {

    if (this.loaded) {

      this.index++

      if ( click ) {

        this.screen.material.map = this.images[this.index % this.images.length]
        this.screen.material.map.needsUpdate = true

      } else if ( currentTime - this.time < 5 ) {

        this.screen.material.map = this.images[this.index % this.images.length]
        this.screen.material.map.needsUpdate = true

      }

      this.time = currentTime
    }

  }
}
