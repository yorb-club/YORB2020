import * as THREE from 'three'

export class VideoDisplay {
  constructor(scene, camera, position, rotation, videoElement, size, frameColor=0x6bdcff, frameOffset=0.1) {
    this.scene = scene
    this.camera = camera
    this.playSurface
    this.frame
    this.position = position
    this.rotation = rotation
    this.element = videoElement || document.createElement('video')
    this.frameColor = frameColor
    this.frameOffset = frameOffset
    this.WIDTH = size
    this.ASPECT = 1920/1080
    this.HEIGHT = this.WIDTH / this.ASPECT

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
    videoSound.setRefDistance( 2 ); // distnace at which sounds starts to rolloff
    videoSound.setRolloffFactor( 2 ); // higher numbers mean greater rolloff
    videoSound.setDirectionalCone( 25, 45, 0.1 ) // inner angle, outer angle, ratio outer/inner

    // videoSound.play();
    // this.element.play();

    // Add backing to playSurface
    const wallGeometry = new THREE.PlaneGeometry( this.WIDTH*1.2, this.HEIGHT*1.2, 8, 15 );
    const wallMaterial = new THREE.MeshBasicMaterial({ color: this.frameColor, opacity: 0.9, transparent: true, side: THREE.DoubleSide } );
    this.frame = new THREE.Mesh( wallGeometry, wallMaterial );
    // wallPlane.position.set(this.position.x + this.frameOffset, this.position.y, this.position.z)
    this.frame.position.set( 0, 0, 0 )
    // wallPlane.rotation.x = this.rotation.x;
    // wallPlane.rotation.y = this.rotation.y;
    // wallPlane.rotation.z = this.rotation.z;

    const texture = new THREE.VideoTexture( this.element );
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;

    // Add a cube to the scene
    const geometry = new THREE.BoxGeometry(this.WIDTH, this.HEIGHT, .1);
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: texture });
    this.playSurface = new THREE.Mesh(geometry, material);
    this.playSurface.position.set(this.position.x, this.position.y, this.position.z);
    this.playSurface.rotation.x = this.rotation.x; // playSurface.rotation.x = 0.1;
    this.playSurface.rotation.y = this.rotation.y; // playSurface.rotation.y = 0.2;
    this.playSurface.rotation.z = this.rotation.z;
    this.playSurface.add(videoSound) // Add the sound to the cube
    // playSurface.rotateOnWorldAxis(this.position, this.rotation)
    this.scene.add(this.playSurface);
    this.playSurface.add( this.frame );
  }

  updatePosition(x, y, z, rot, frameOffset) {
    this.playSurface.position.set( x, y, z )
    this.playSurface.rotateY( rot )
    this.frame.translateZ( frameOffset )
  }

  updateVolume(volume) {
    this.element.volume = volume
  }

}
