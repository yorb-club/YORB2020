import * as THREE from 'three'

export class VideoDisplay {
  constructor(scene, camera, position, rotation, videoElement, size, frameColor=0x6bdcff, frameOffset=0.1) {
    this.scene = scene
    this.camera = camera
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

    const audioSource = audioCtx.createMediaElementSource(this.element);

    this.camera.add(listener);

    let videoSound = new THREE.PositionalAudio( listener );
    videoSound.setNodeSource(audioSource);
    videoSound.setRefDistance( 0.5 );
    videoSound.setRolloffFactor( 0.2 );
    videoSound.setDirectionalCone( 160, 210, 0.5 )
    videoSound.play();
    this.element.play();


    const texture = new THREE.VideoTexture( this.element );
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;

    // Add a cube to the scene
    const geometry = new THREE.BoxGeometry(this.WIDTH, this.HEIGHT, .1);
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: texture });
    let playSurface = new THREE.Mesh(geometry, material);
    playSurface.position.set(this.position.x, this.position.y, this.position.z);
    playSurface.rotation.x = this.rotation.x; // playSurface.rotation.x = 0.1;
    playSurface.rotation.y = this.rotation.y; // playSurface.rotation.y = 0.2;
    playSurface.rotation.z = this.rotation.z;
    playSurface.add(videoSound) // Add the sound to the cube
    this.scene.add(playSurface);

    // Add backing to video Mesh
    const wallGeometry = new THREE.PlaneGeometry( this.WIDTH*1.2, this.HEIGHT*1.2, 8, 15 );
    const wallMaterial = new THREE.MeshBasicMaterial({ color: this.frameColor, opacity: 0.9, transparent: true, side: THREE.DoubleSide } );
    const wallPlane = new THREE.Mesh( wallGeometry, wallMaterial );
    wallPlane.position.set(this.position.x + this.frameOffset, this.position.y, this.position.z)
    wallPlane.rotation.x = this.rotation.x;
    wallPlane.rotation.y = this.rotation.y;
    wallPlane.rotation.z = this.rotation.z;
    this.scene.add( wallPlane );
  }

}
