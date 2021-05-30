import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Color,
  MeshPhongMaterial,
  Mesh,
  AmbientLight,
  DirectionalLight,
  HemisphereLight,
  Group
} from 'https://unpkg.com/three@0.127.0/build/three.module.js';

import {HyperboloidRing} from './HyperboloidRing.js';
import {OrbitControls} from './jsm/controls/OrbitControls.js';
import {STLExporter} from './jsm/exporters/STLExporter.js';
import {CSG} from './jsm/threejs_csg/CSG.js';

let rotating = true;
let canvas = document.querySelector('#canvas'),
    canvasWidth = canvas.clientWidth, 
    canvasHeight = canvas.clientHeight;

// camera

let fov = 75,
    aspectRatio = canvasWidth / canvasHeight,
    near = 0.1,
    far = 500;
let camera = new PerspectiveCamera( fov, aspectRatio, near, far);
camera.position.set( 30, 30, 30 );


// scene

let scene = new Scene();
scene.background = new Color("#f7f3f0");


// exporter

let exporter = new STLExporter();


// lights

let color = 0xf7f3f0;

let directionaLight = new DirectionalLight(color, 0.2);
directionaLight.position.set(-1, 2, 4); // x, y, z
scene.add(directionaLight);

let hemiLight = new HemisphereLight( color, 0.1 );
hemiLight.position.set( 0, 200, 0 ); // x, y, z

var lightHolder = new Group();
lightHolder.add(directionaLight);
lightHolder.add(hemiLight);
scene.add(lightHolder);


// material

let material = new MeshPhongMaterial({
    color: 0xf7f3f0,
    flatShading: true,
    shininess: 150
});


// Mesh

let fingerRadius = 18 / 2, 
    radialSegments = 10,
    twistAngle = ((Math.PI * 2) * 0.17).toFixed(2),
    width = 7;

let myHyperboloidRing = new HyperboloidRing (fingerRadius, radialSegments, twistAngle, width, material);
let mesh = myHyperboloidRing.getMesh();
scene.add(mesh);   
let nonRotatedMesh = mesh.clone();


// renderer

let renderer = new WebGLRenderer({
    canvas,
    antialias: true
  });
renderer.setSize(canvasWidth, canvasHeight);


// Orbit Controls

const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set( 0, 0, 0 );
controls.update();

canvas.addEventListener( 'pointerdown', () => {
    rotating = false;
}, false );

canvas.addEventListener( 'pointerup', () => {
    rotating = true;
}, false );


// Button export stl

let buttonExportBinary = document.getElementById( 'exportBinary' );
buttonExportBinary.addEventListener( 'click', exportBinary, false );


// Animation

let animate = () => {
    if (rotating) {
        mesh.rotation.x += 0.003;
        mesh.rotation.z += 0.006;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    lightHolder.quaternion.copy(camera.quaternion);  
};

animate();


                                
function exportBinary() {
    const result = exporter.parse( nonRotatedMesh, { binary: true } );
    saveArrayBuffer( result, 'bague_hyperboloid.stl' );

}

const link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link );

function save( blob, filename ) {

    link.href = URL.createObjectURL( blob );
    link.download = filename;
    link.click();

}

function saveArrayBuffer( buffer, filename ) {
    
    save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );
    
}

