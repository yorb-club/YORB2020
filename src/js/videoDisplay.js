import * as THREE from 'three'

export class VideoDisplay {
  constructor(scene, camera, position, rotation, videoElement, card, size, frameColor=0x6bdcff, frameOffset=0.1) {
    this.scene = scene
    this.camera = camera
    this.screen
    this.frame
    this.card = card
    this.position = position
    this.rotation = rotation
    this.element = videoElement || document.createElement('video')
    this.frameColor = frameColor
    this.frameOffset = frameOffset
    this.WIDTH = size
    this.ASPECT = 1920/1080
    this.HEIGHT = this.WIDTH / this.ASPECT

    this.type = 'video'


    //adding frame
    this.border
    this.borderColor = 0x191919


    this.setup()
  }

  setup() {

    const listener = new THREE.AudioListener();
    const audioCtx = listener.context; //new (window.AudioContext || window.webkitAudioContext)();

    const audioSource = audioCtx.createMediaElementSource( this.element );

    // compensate for volumes between videos
    const gainNode = audioCtx.createGain();

    var compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-10, audioCtx.currentTime);
    compressor.knee.setValueAtTime(30, audioCtx.currentTime);
    compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
    compressor.attack.setValueAtTime(0, audioCtx.currentTime);
    compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

    let videoSound = new THREE.PositionalAudio( listener );

    if (this.element.volume > 0.99) {

      console.log("turning the volume up")
      audioSource.connect( gainNode )
      gainNode.connect( compressor )

      gainNode.gain.setValueAtTime(15, audioCtx.currentTime)

      videoSound.setNodeSource( compressor )

    } else { // or don't compensate

      videoSound.setNodeSource( audioSource );

    }

    // let videoSound = new THREE.PositionalAudio( listener );

    // videoSound.setDistanceModel( 'linear' )
    // let maxDistance = 100
    // videoSound.setMaxDistance( maxDistance )
    videoSound.setRefDistance( 6 ); // distnace at which sounds starts to rolloff
    videoSound.setRolloffFactor( 90 ); // higher numbers mean greater rolloff
    videoSound.setDirectionalCone( 25, 60, 0.02 ) // inner angle, outer angle, ratio outer/inner
    videoSound.rotation.x = this.rotation.x
    videoSound.rotation.y = this.rotation.y
    videoSound.rotation.z = this.rotation.z

    this.camera.add( listener );

    // videoSound.play();
    this.element.play();
    this.element.muted = false;

    // Add large frame to display area
    const frameGeometry = new THREE.PlaneBufferGeometry( this.WIDTH*1.6, this.HEIGHT*1.5, 1, 1 );
    // const frameMaterial = new THREE.MeshBasicMaterial({ color: this.frameColor, opacity: 0.9, transparent: true, side: THREE.DoubleSide } );
    const frameMaterial = new THREE.MeshBasicMaterial({ color: this.frameColor, side: THREE.DoubleSide } );
    this.frame = new THREE.Mesh( frameGeometry, frameMaterial );
    this.frame.position.set( -this.WIDTH*0.1, 0, 0.09 )

    // adding border to the screen
    const borderGeometry = new THREE.PlaneBufferGeometry( this.WIDTH*1.1, this.HEIGHT*1.1, 1, 1 );
    const borderMaterial = new THREE.MeshBasicMaterial({ color: this.borderColor, side: THREE.DoubleSide } );
    this.border = new THREE.Mesh( borderGeometry, borderMaterial );
    this.border.position.set( 0, 0, 0.089 )

    // the video texture for the screen
    const texture = new THREE.VideoTexture( this.element );
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;

    // Add a cube to the scene for the video to be drawn on
    const geometry = new THREE.BoxBufferGeometry(this.WIDTH, this.HEIGHT, .1);
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: texture });
    this.screen = new THREE.Mesh(geometry, material);
    this.screen.position.set(this.position.x, this.position.y, this.position.z);
    this.screen.rotation.x = this.rotation.x; // playSurface.rotation.x = 0.1;
    this.screen.rotation.y = this.rotation.y; // playSurface.rotation.y = 0.2;
    this.screen.rotation.z = this.rotation.z;
    this.screen.add(videoSound) // Add the sound to the cube
    this.scene.add( this.screen )
    this.screen.add( this.frame )
    this.screen.add( this.border )


    // artist info card
    let cardTexture = new THREE.TextureLoader().load( this.card );
    cardTexture.wrapS = THREE.RepeatWrapping
    cardTexture.wrapT = THREE.RepeatWrapping
    cardTexture.repeat.set(1, 1)

    // add card next to display with backing
    let cardAspect = 1.6554347826086957
    let cardGeometry = new THREE.PlaneBufferGeometry(0.4 * cardAspect, 0.4, 1, 1)
    let cardMaterial = new THREE.MeshBasicMaterial({ map: cardTexture, transparent: true})
    this.card = new THREE.Mesh(cardGeometry, cardMaterial)
    this.card.rotateY( Math.PI * 0.9 )
    this.card.position.set( -this.WIDTH * 0.7 , 0, -0.12 )
    //this.card.position.set( -this.WIDTH * 0.65 , 0, -0.12 )

    const backingGeometry = new THREE.PlaneBufferGeometry( 0.45 * cardAspect , 0.45 , 1 , 1 );
    // const backingMaterial = new THREE.MeshBasicMaterial({ color: 0xffc0cb, opacity: 0.9, transparent: true, side: THREE.DoubleSide } );
    const backingMaterial = new THREE.MeshBasicMaterial({ color: 0x6bdcff, side: THREE.DoubleSide } ); // pink 0xffc0cb
    const backing = new THREE.Mesh( backingGeometry, backingMaterial );
    backing.position.set( 0, 0, -0.01 )

    this.card.add( backing )
    this.screen.add( this.card )

  }

  updatePosition(x, y, z, rot, frameOffset=0.0) {
    this.screen.position.set( x, y, z )
    this.screen.rotateY( rot )
    //this.frame.translateZ( -frameOffset)
    //this.border.translateZ( -frameOffset )
  }

  updateVolume(volume) {
    this.element.volume = volume
  }

}
