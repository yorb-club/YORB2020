import * as THREE from 'three'

export class VideoDisplay {
  constructor(scene, camera, position, rotation, videoElement, size, frameColor=0x6bdcff, frameOffset=0.1) {
    this.scene = scene
    this.camera = camera
    this.screen
    this.frame, this.card
    this.position = position
    this.rotation = rotation
    this.element = videoElement || document.createElement('video')
    this.frameColor = frameColor
    this.frameOffset = frameOffset
    this.WIDTH = size
    this.ASPECT = 1920/1080
    this.HEIGHT = this.WIDTH / this.ASPECT

    this.type = 'video'

    this.setup()
  }

  setup() {

    const listener = new THREE.AudioListener();
    const audioCtx = listener.context;//new (window.AudioContext || window.webkitAudioContext)();

    const audioSource = audioCtx.createMediaElementSource( this.element );

    this.camera.add( listener );

    let videoSound = new THREE.PositionalAudio( listener );
    videoSound.setNodeSource( audioSource );
    // videoSound.setDistanceModel( 'linear' )
    // let maxDistance = 100
    // videoSound.setMaxDistance( maxDistance )
    videoSound.setRefDistance( 0.2 ); // distnace at which sounds starts to rolloff
    videoSound.setRolloffFactor( 5 ); // higher numbers mean greater rolloff
    videoSound.setDirectionalCone( 25, 45, 0.1 ) // inner angle, outer angle, ratio outer/inner

    // videoSound.play();
    // this.element.play();

    // Add backing to playSurface
    const frameGeometry = new THREE.PlaneBufferGeometry( this.WIDTH*1.2, this.HEIGHT*1.2, 8, 15 );
    const frameMaterial = new THREE.MeshBasicMaterial({ color: this.frameColor, opacity: 0.9, transparent: true, side: THREE.DoubleSide } );
    this.frame = new THREE.Mesh( frameGeometry, frameMaterial );
    this.frame.position.set( 0, 0, 0.12 )


    const texture = new THREE.VideoTexture( this.element );
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;

    // Add a cube to the scene
    const geometry = new THREE.BoxGeometry(this.WIDTH, this.HEIGHT, .1);
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: texture });
    this.screen = new THREE.Mesh(geometry, material);
    this.screen.position.set(this.position.x, this.position.y, this.position.z);
    this.screen.rotation.x = this.rotation.x; // playSurface.rotation.x = 0.1;
    this.screen.rotation.y = this.rotation.y; // playSurface.rotation.y = 0.2;
    this.screen.rotation.z = this.rotation.z;
    this.screen.add(videoSound) // Add the sound to the cube
    // playSurface.rotateOnWorldAxis(this.position, this.rotation)
    this.scene.add( this.screen )
    this.screen.add( this.frame )

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

  updateVolume(volume) {
    this.element.volume = volume
  }

}
