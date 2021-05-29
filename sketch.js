import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Color,
  MeshPhongMaterial,
  DoubleSide,
  Mesh,
  AmbientLight,
  DirectionalLight,
  HemisphereLight,
  Group
} from 'https://unpkg.com/three@0.127.0/build/three.module.js';

import {CylinderGeometry} from './CylinderGeometry.js';
import {OrbitControls} from './jsm/controls/OrbitControls.js';
import {STLExporter} from './jsm/exporters/STLExporter.js';
import {CSG} from './jsm/threejs_csg/CSG.js';

let rotating = true;


// camera

let fov = 75,
    aspectRatio = window.innerWidth / window.innerHeight,
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
    side: DoubleSide,
    shininess: 150
});


// Geometry

let minimumThickness = 0.8, // millimeters. Minimum required for metal casting
    innerRadius = 18 / 2, // millimeters. Just my size! TODO: make it GUI-parametric
    radialSegments = 10,
    thetaLength = Math.PI * 2,
    thetaOffset = ((Math.PI * 2) * 0.17).toFixed(2),
    width = 7;

let getOuterRadius = (innerRadius, minimumThickness, radialSegments) => {
    let thetaLength = Math.PI * 2,
        angleBetween2Vertices = thetaLength / radialSegments,
        outerRadiusWithoutThetaOffset = (innerRadius + minimumThickness) / Math.cos(angleBetween2Vertices / 2),
        outerRadiusWithThetaOffset = outerRadiusWithoutThetaOffset / Math.cos(thetaOffset / 2),
        thickness = outerRadiusWithThetaOffset - innerRadius;
        console.log(thickness);
    return outerRadiusWithThetaOffset;
};
let outerRadius = getOuterRadius(innerRadius, minimumThickness, radialSegments);

const hyperboloidGeometry = new CylinderGeometry(outerRadius, outerRadius, width, radialSegments, thetaOffset);

let holeRadius = innerRadius,
  holeRadialSegments = 200,
  holeHeight = 20;

const holeGeometry = new CylinderGeometry(holeRadius, holeRadius, holeHeight, holeRadialSegments);


// CSG mesh

let meshA = new Mesh(hyperboloidGeometry, material);
let meshB = new Mesh(holeGeometry, material);

let csg = new CSG();

csg.subtract([meshA, meshB]);

let mesh = csg.toMesh();

scene.add(mesh);   
let nonRotatedMesh = mesh.clone();



// renderer

let canvas = document.querySelector('#canvas');

let renderer = new WebGLRenderer({
    canvas,
    antialias: true
  });
renderer.setSize(window.innerWidth, window.innerHeight);


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

