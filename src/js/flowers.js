// adapted from https://ibiblio.org/e-notes/Splines/three.htm
import * as THREE from 'three'

export class Flowers {
  constructor(scene, position=new THREE.Vector3(0, 0, 0), numDaisies=1, numViolets=1, drawZ=true, leftSide=true) {
    this.scene = scene
    this.position = position
    this.numDaisies = numDaisies
    this.numViolets = numViolets
    this.drawZ = drawZ
    this.leftSide = leftSide
    this.root = new THREE.Object3D()
    this.group;
    this.l0, this.l1, this.theta,  this.bn = 9, this.nfi;
    this.pos = [], this.col = [], this.ind = [],  this.offset;
    this.bi = [new Float32Array(3000), new Float32Array(3000), new Float32Array(3000)];

    this.setup()
  }

  setup() {

    this.root.position.set( this.position.x, this.position.y, this.position.z )

    if (this.leftSide == 1){
      this.root.rotation.y = (-Math.PI/5.5)
    }
    else if (this.leftSide == 2) {
      //console.log("here")
      this.root.rotation.y = (Math.PI/5.5)
    }
    else if (this.drawZ == 3){
      this.root.rotation.y = 0
    }


    this.scene.add(this.root)




    for(var i = 0; i < this.numDaisies; i++) {
      let group1 = new THREE.Object3D();
      this.group = group1;
      this.root.add(group1);
      this.daisy( 1, 1, .5, 1 ); // age, l0, this.l1, this.theta
      this.daisy( .1, .8, .5, -.5 );
      this.leaves( 1, 0 ); // age, y0
      //group1.translateX( 1 + Math.random()*i );
      //group1.translateZ( 1 + Math.random()* i);
      group1.translateY( Math.sin(Math.random()*360)*6 )

      if (this.drawZ == true){
          group1.translateZ( Math.sin(Math.random()*360)*15 )

      }
      else{
         group1.translateX( Math.sin(Math.random()*360)*10 )

      }

      group1.rotateY( Math.PI/Math.random(-2, 2) );
      // console.log('adding a flower')

    }

    for(var i = 0; i < this.numViolets; i++) {
      let group2 = new THREE.Object3D();
      this.group = group2;
      this.root.add(group2);
      this.violet( 1, 1, .5, 1 ); // age, l0, this.l1, this.theta
      this.violet( .1, .8, .5, -.5 );
      this.leaves( 1, 0);  // age, y0
      //group2.translateX( -1 + Math.random()*i );
      //group2.translateZ( -1 + Math.random()*i );
      group2.translateY( Math.sin(Math.random()*360)*6 )

      if (this.drawZ == true){
        group2.translateZ( Math.sin(Math.random()*360)*15 )
      }
      else{
        group2.translateX( Math.sin(Math.random()*360)*10 )
        }
      group2.rotateY( Math.PI/Math.random(-2, 2));

    }
  }

  // ===================================================  lib
  addToGroup(th){
    let geometry = new THREE.BufferGeometry();
    geometry.setIndex( this.ind );
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( this.pos, 3 ).onUpload( this.disposeArray ) );
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3).onUpload( this.disposeArray ) );
    geometry.computeVertexNormals();
    if( th != 0 ){
      geometry.rotateZ( -th );
      geometry.translate(this.l1*Math.sin(this.theta), this.l0 + this.l1*Math.cos(this.theta),  0);
    }
    this.group.add( new THREE.Mesh(geometry,
      new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors, side: THREE.DoubleSide})) );
  }

  disposeArray() {
			this.array = null;
	}

  violet(age, L0, L1, th){
    this.l0 = L0;  this.l1 = L1;  this.theta = th;
    this.nfi = 5;
    const petals = 15,  sepals = 8;
    this.cone(.04, .25, .3, 0, 20);
      //  R0,  R,  h, y0, this.nfi
    this.head(.23, .1, .3, 20);
      // R,   h,   y0,  this.nfi
    this.bud_violet( age, petals, -.1);
      //                  ... y0 ...
    this.sepals_violet( age, sepals, -.105);
      //                      ... y0 ...
    this.stem( 0, this.l0, this.l1, this.theta, .06, .04, 12, 12);
       // y0, l0, this.l1, th, R0, R, nt, this.nfi
  }

  bud_violet(age, petals, y0){
    this.pos = [];  this.ind = [];  this.col = [];  this.offset = 0;
    let CP = [   // r, z, fi    petals
  [0.24,0.40,0.21,0.23,0.58,0.27,0.00,0.77,0.62,0.00,0.76,0.00],
  [0.24,0.40,0.20,0.36,0.57,0.30,0.59,0.71,0.11,0.59,0.94,0.00],
  [0.24,0.40,0.30,0.41,0.45,0.30,0.65,0.56,0.11,0.73,0.24,0.00]
    ]
    for(let k = 0; k < 3; k++)  this.bezier1D(CP[k], this.bi[k])
    for(let i = 1; i <= petals; i++ )
      this.patch(2.4*i, .9 + .1*i/petals, age*(.8 + .2*i/petals), y0, 'viol')
    this.addToGroup( this.theta );
  }

  sepals_violet(age, sepals, y0){
    this.pos = [];  this.ind = [];  this.col = [];  this.offset = 0;
    let CP = [   // r, z, fi
  [0.25,0.40,0.38,0.28,0.56,0.36,0.01,0.83,0.55,0.00,0.82,0.00],
  [0.25,0.40,0.36,0.41,0.43,0.38,0.60,0.54,0.11,0.82,0.52,0.00],
  [0.25,0.40,0.27,0.38,0.37,0.27,0.41,0.27,0.27,0.58,0.18,0.00]
    ]
    for(let k = 0; k < 3; k++)  this.bezier1D(CP[k], this.bi[k])
    for(let i = 1; i <= sepals; i++ )
      this.patch(2.4*i, .95 + .05*i/sepals, age*(.8 + .2*i/(sepals-1)), y0, 'leaf' );
    this.addToGroup( this.theta );
  }

  daisy(age, L0, L1, th){
    this.l0 = L0;  this.l1 = L1;  this.theta = th;
    this.nfi = 5;
    const petals = 15,  sepals = 5;
    this.cone(.04, .085, .3, 0, 12);
      //  R0,   R,  h, y0, this.nfi
    this.head(.08, .03, .3, 12);
      // R,   h,   y0,  this.nfi
    this.bud_daisy( age, petals, -.08 );
      //                 ... y0 ...
    this.sepals_daisy( age, sepals, -.08 );
      //                      ... y0 ...
    this.stem( 0, this.l0, this.l1, this.theta, .06, .04, 12, 12);
       // y0, l0, this.l1, th, R0, R, nt, this.nfi
  }

  bud_daisy(age, petals, y0){
    this.pos = [];  this.ind = [];  this.col = [],  this.offset = 0;
    let CP = [   // r, z, fi    petals
  [0.07,0.37,0.19, 0.20,0.57,0.14, 0.00,0.74,0.25, 0.00,0.75,0.00],
  [0.08,0.38,0.19,0.27,0.67,0.09,0.52,0.88,0.04,0.52,0.88,0.00],
  [0.08,0.38,0.19,0.45,0.53,0.09,0.66,0.33,0.04,0.66,0.33,0.00],
    ]
    for(let k = 0; k < 3; k++)  this.bezier1D(CP[k], this.bi[k])
    for(let i = 1; i <= petals; i++ )
      this.patch(2.4*i, .95 + .05*i/petals, age*(.9 + .1*i/petals), y0, 'daisy')
    this.addToGroup( this.theta );
  }

  sepals_daisy(age, sepals, y0){
    this.pos = [];  this.ind = [];  this.col = [],  this.offset = 0;
    let CP = [   // r, z, fi
  [0.09,0.36,0.43,0.28,0.56,0.36,0.01,0.82,0.69,0.00,0.82,0.00],
  [0.09,0.36,0.42,0.28,0.53,0.40,0.49,0.59,0.17,0.72,0.61,0.00],
  [0.09,0.36,0.42,0.30,0.39,0.36,0.40,0.31,0.22,0.51,0.14,0.00]
    ]
    for(let k = 0; k < 3; k++)  this.bezier1D(CP[k], this.bi[k])
    for(let i = 1; i <= sepals; i++ )
      this.patch(2.4*i, 1 + .01*i, age*(.8 + .2*i/(sepals-1)), y0, 'leaf' );
    this.addToGroup( this.theta );
  }

  stem(y0, l0, l1, th, R0, R, nt, nfi){
    // quadratic Bezier is used with CP = (0,0)  (0,l0)  (this.l1*sin(th), l0 + this.l1*cos(th))
    this.pos = [];  this.ind = [];  this.col = [];
    let lx = l1*Math.sin(th),   ly = l0 + l1*Math.cos(th);  // stem top point
    let stn = 1/(nt-1),  stFi = 2*Math.PI/(nfi-1);
    for(let t = 0; t < 1.001; t += stn ){
      let x = t*t*lx,  y = y0 + 2*t*(1-t)*l0 + t*t*ly;
      let dx = t*lx,  dy = (1 - t - t)*l0 + t*ly  // tangent vector
      let dlen = Math.sqrt(dx*dx + dy*dy);
      dx /= dlen;  dy /= dlen;   // normal to the spline is (dy, -dx)
      let r = R0 + t*(R - R0);
      for(let fi = 0; fi < 6.3; fi += stFi ){
        let len = r*Math.cos(fi);
        this.pos.push( x + dy*len,  y - dx*len,  r*Math.sin(fi) );
        this.col.push(0, .5, 0);
      }
    }
    let t = 0,  tn = nfi;
    for(let i = 0; i < nt-1; i++ ){
      for(let j = 0; j < nfi-1; j++ ){
        this.ind.push(t++);  this.ind.push(tn);  this.ind.push(t);
        this.ind.push(tn++); this.ind.push(tn);  this.ind.push(t);
      }
      t++;  tn++;
    }
    this.addToGroup( 0 );
  }

  leaves(age, y0){
    this.pos = [];  this.ind = [];  this.col = [],  this.offset = 0;
    let CP = [   // r, z, fi
  [0.03,0.13,0.64,0.05,0.19,0.36,0.28,0.33,0.76,0.42,0.66,0.00],
  [0.03,0.08,0.69,0.06,0.14,0.44,0.50,0.51,0.20,0.66,0.35,0.00],
  [0.03,0.05,0.68,0.28,0.03,0.24,0.56,0.29,0.38,0.81,0.12,0.00]
    ]
    for(let k = 0; k < 3; k++)  this.bezier1D(CP[k], this.bi[k])
    for(let i = 0; i < 3; i++ ){
      this.patch(2*i+5, 1.5, age*.5*i, y0, 'leaf' ); // fi0, scaleR, age
    }
    this.addToGroup( 0 );
  }

  patch(fi0, scaleR, a, y0, color){
    for(let u = 0; u < this.bn; u++ ){
      let u3 = 3*u,  a0 = 2*(.5-a)*(1-a), a1 = 4*a*(1-a), a2 = 2*a*(a-.5)  // Bezier ?
      let r = (a0*this.bi[0][u3] + a1*this.bi[1][u3] + a2*this.bi[2][u3])*scaleR;
      let y = a0*this.bi[0][u3+1] + a1*this.bi[1][u3+1] + a2*this.bi[2][u3+1];
      let fi = 2*(a0*this.bi[0][u3+2] + a1*this.bi[1][u3+2] + a2*this.bi[2][u3+2]);
      fi *= Math.min(1 + .01/r, 2);
      let dfi = 2*fi/(this.nfi - 1);
      fi += fi0;
      for(let v = 0; v < this.nfi; v++ ){
        this.pos.push( r*Math.sin(fi),  y + y0,  r*Math.cos(fi) );
        let c = .5*Math.abs( 2*v/(this.nfi-1) - 1 ),  d = (c + 2)/3;
        switch (color){
          case 'leaf':  this.col.push(0, (c+.5)/1.5, 0);  break;
          case 'daisy': this.col.push(d, d, 1);  break;
          case 'viol':  this.col.push(0.9, 0.3, (1-c)*(1-c));
        }
        fi -= dfi;
      }
    }
    let t = this.offset,  tn = this.offset + this.nfi;
    for(let i = 0; i < this.bn-1; i++ ){
      for(let j = 0; j < this.nfi-1; j++ ){
        this.ind.push(t++);  this.ind.push(t);  this.ind.push(tn);
        this.ind.push(tn++); this.ind.push(t);  this.ind.push(tn);
      }
      t++;  tn++
    }
    this.offset += this.bn*this.nfi;
  }

  cone(R0, R, h, y0, nfi){
    this.pos = [];  this.col = [];  this.ind = [];
    let stFi = 2*Math.PI/(nfi-1);
    for(let fi = 0; fi < 6.3; fi += stFi ){
      let si = Math.sin(fi),  co = -Math.cos(fi);
      this.pos.push( R0*si,   y0,  R0*co );
      this.pos.push( R*si,  y0 + h,  R*co );
      this.col.push(0, .5, 0,  0, .5, 0);
    }
    let t = 0;
    for(let j = 0; j < nfi-1; j++ ){
      this.ind.push(t++);  this.ind.push(t++);  this.ind.push(t);
      this.ind.push(t); this.ind.push(t-1);  this.ind.push(t+1);
    }
    this.addToGroup( this.theta );
  }

  head(R, h, y0, nfi){
    this.pos = [];  this.col = [];  this.ind = [];
    let nr = 4, stR = 1/(nr-1), stFi = 2*Math.PI/(nfi-1)
    for(let i = 0; i < nr; i++ ){
      let y = y0 + h*i/nr,  r = R*Math.sqrt(1 - i*stR)
      for(let fi = 0; fi < 6.3; fi += stFi ){
        this.pos.push( r*Math.sin(fi),  y,  r*Math.cos(fi) );
        this.col.push(.8, .8, 0);
      }
    }
    let t = 0,  tn = nfi;
    for(let i = 0; i < nr-1; i++ ){
      for(let j = 0; j < nfi-1; j++ ){
        this.ind.push(t++);  this.ind.push(t);  this.ind.push(tn);
        this.ind.push(tn++); this.ind.push(t);  this.ind.push(tn);
      }
      t++;  tn++;
    }
    this.addToGroup( this.theta );
  }

  bezier1D(CP, bi){
     let dt = 1/(this.bn-1),  t = dt,  j = 3;
     bi[0] = CP[9];   bi[1] = CP[10];   bi[2] = CP[11];
     for (let i = 1; i < this.bn-1; i++){
       let t2 = t*t,  t1 = 1-t,  t12 = t1*t1;
       let b0 = t*t2,  b1 = 3*t2*t1,  b2 = 3*t*t12,  b3 = t12*t1;
       bi[j++] = b0*CP[0] + b1*CP[3] + b2*CP[6] + b3*CP[9];
       bi[j++] = b0*CP[1] + b1*CP[4] + b2*CP[7] + b3*CP[10];
       bi[j++] = b0*CP[2] + b1*CP[5] + b2*CP[8] + b3*CP[11];
       t += dt;
     }
     bi[j++] = CP[0];   bi[j++] = CP[1];   bi[j++] = CP[2];
  }

}
