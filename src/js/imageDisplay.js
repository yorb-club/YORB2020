import * as THREE from 'three'

export class ImageDisplay {
  constructor(scene, camera, position, rotation, element, size, frameColor=0x6bdcff, frameOffset=0.1) {
    this.scene = scene
    this.camera = camera
    this.screen
    this.frame
    this.position = position
    this.rotation = rotation
    this.element = element
    this.frameColor = frameColor
    this.frameOffset = frameOffset
    this.WIDTH = size
    this.ASPECT = 1920/1080
    this.HEIGHT = this.WIDTH / this.ASPECT

    this.type = 'image'

    this.setup()
  }

  setup() {

    // Add backing to screen
    const frameGeometry = new THREE.PlaneGeometry( this.WIDTH*1.2, this.HEIGHT*1.2, 8, 15 );
    const frameMaterial = new THREE.MeshBasicMaterial({ color: this.frameColor, opacity: 0.9, transparent: true, side: THREE.DoubleSide } );
    this.frame = new THREE.Mesh( frameGeometry, frameMaterial );
    this.frame.position.set( 0, 0, 0 )

    // add the image to the screen
    let imageTexture = new THREE.TextureLoader().setCrossOrigin( 'anonymous' ).load( this.element.src );
    imageTexture.wrapS = THREE.RepeatWrapping
    imageTexture.wrapT = THREE.RepeatWrapping
    imageTexture.repeat.set(1, 1)

    let imageGeometry = new THREE.BoxGeometry(this.WIDTH, this.HEIGHT, .1)
    let imageMaterial = new THREE.MeshBasicMaterial({ map: imageTexture, transparent: true})
    this.screen = new THREE.Mesh(imageGeometry, imageMaterial)
    this.screen.add( this.frame )
    this.screen.position.set(this.position.x, this.position.y, this.position.z);
    this.screen.rotation.x = this.rotation.x; // screen.rotation.x = 0.1;
    this.screen.rotation.y = this.rotation.y; // screen.rotation.y = 0.2;
    this.screen.rotation.z = this.rotation.z;

    this.scene.add( this.screen );

    // add card next to display with backing
    const backingGeometry = new THREE.PlaneBufferGeometry( 0.5 , 0.5 , 8 , 15 );
    const backingMaterial = new THREE.MeshBasicMaterial({ color: 0xffc0cb, opacity: 0.9, transparent: true, side: THREE.DoubleSide } );
    const backing = new THREE.Mesh( backingGeometry, backingMaterial );
    backing.position.set( 0, 0, -0.01 )

    let cardTexture = new THREE.TextureLoader().load(require('../assets/images/buds/card.png'));
    cardTexture.wrapS = THREE.RepeatWrapping
    cardTexture.wrapT = THREE.RepeatWrapping
    cardTexture.repeat.set(1, 1)

    let cardGeometry = new THREE.PlaneBufferGeometry(0.4, 0.4, 1, 1)
    let cardMaterial = new THREE.MeshBasicMaterial({ map: cardTexture, transparent: true})
    this.card = new THREE.Mesh(cardGeometry, cardMaterial)
    this.card.add( backing )
    this.card.rotateY( Math.PI * 0.9 )
    this.card.position.set( -this.WIDTH * 0.7 , 0, -0.12 )
    this.screen.add( this.card )

  }

  updatePosition(x, y, z, rot, frameOffset=0.0) {
    this.screen.position.set( x, y, z )
    this.screen.rotateY( rot )
    this.frame.translateZ( frameOffset )
  }

}
