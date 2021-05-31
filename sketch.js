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

let isRotating = true; 
let camera, scene, renderer, exporter, material, mesh, nonRotatedMesh, lightHolder;

let fingerRadius, 
    radialSegments,
    twistAngle,
    ringWidth;
let myHyperboloidRing;


let initialize = () => {
    let canvas = document.querySelector('#canvas'),
        canvasWidth = canvas.clientWidth, 
        canvasHeight = canvas.clientHeight;

    // 

    let fov = 75,
        aspectRatio = canvasWidth / canvasHeight,
        near = 0.1,
        far = 500;
    
    camera = new PerspectiveCamera( fov, aspectRatio, near, far);
    camera.position.set( 30, 30, 30 );

    // 

    exporter = new STLExporter();

    // 

    let directionaLight = new DirectionalLight( 0xf7f3f0, 0.2 );
    directionaLight.position.set(-1, 2, 4); // x, y, z
    
    let hemiLight = new HemisphereLight( 0xf7f3f0, 0.1 );
    hemiLight.position.set( 0, 200, 0 ); // x, y, z

    lightHolder = new Group();
    lightHolder.add(directionaLight);
    lightHolder.add(hemiLight);

    // 

    material = new MeshPhongMaterial({
        color: 0xf7f3f0,
        flatShading: true,
        shininess: 150
    });
    
    // 
    
    setHyperboloidRingInputParameters();
    
    // 
    
    myHyperboloidRing = new HyperboloidRing (fingerRadius, radialSegments, twistAngle, ringWidth, material);

    // 
    
    setMesh();

    // 

    renderer = new WebGLRenderer({ 
        canvas,
        antialias: true
      });
    renderer.setSize(canvasWidth, canvasHeight);

    // 

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 0, 0 );
    controls.update();

    canvas.addEventListener( 'pointerdown', () => { isRotating = false; }, false );
    canvas.addEventListener( 'pointerup', () => { isRotating = true; }, false );

    // 

    let buttonExportBinary = document.getElementById( 'exportBinary' );
    buttonExportBinary.addEventListener( 'click', exportBinary, false );
    
    //
    
    setScene();
};

let setScene = () => {
    scene = new Scene();
    scene.background = new Color("#f7f3f0");
    scene.add(lightHolder);
    scene.add(mesh);
};

let setHyperboloidRingInputParameters = () => {
    let fingerDiameterInput = document.getElementById('fingerDiameter'),
        radialSegmentsInput = document.getElementById('radialSegments'),
        twistAngleInput = document.getElementById('twistAngle'),
        ringWidthInput = document.getElementById('ringWidth');
    
    
    // set input listeners
    
    fingerDiameterInput.addEventListener('input', () => {
        myHyperboloidRing.setFingerRadius(fingerDiameterInput.value / 2);
        // let value = myHyperboloidRing.getFingerDiameter(); todo: make it visible on the label
        refresh();
    });
    radialSegmentsInput.addEventListener('input', () => {
        myHyperboloidRing.setRadialSegments(radialSegmentsInput.value);
        refresh();
    });
    twistAngleInput.addEventListener('input', () => {
        myHyperboloidRing.setTwistAngle(Math.PI * 2 * (twistAngleInput.value / 1000).toFixed(2));
        refresh();
    });    
    ringWidthInput.addEventListener('input', () => {
        myHyperboloidRing.setWidth(ringWidthInput.value / 10);
        refresh();
    });
    
    // initialize input parameters
    
    fingerRadius = fingerDiameterInput.value / 2;
    radialSegments = radialSegmentsInput.value;
    twistAngle = (Math.PI * 2) * (twistAngleInput.value / 1000);
    ringWidth = ringWidthInput.value / 10;
    
};


let refresh = () => {
    setMesh();
    // todo here: give the new mesh the previous 3D position 
    setScene();   
};


let setMesh = () => {   
    mesh = myHyperboloidRing.getMesh();
    nonRotatedMesh = mesh.clone();
};


let animate = () => {
    if (isRotating) {
        mesh.rotation.x += 0.003;
        mesh.rotation.z += 0.006;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    lightHolder.quaternion.copy(camera.quaternion); // prevents lights from rotating with orbit control
};


let exportBinary = () => {
    const result = exporter.parse( nonRotatedMesh, { binary: true } );
    saveArrayBuffer( result, 'bague_hyperboloid.stl' );
};


const link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link );

let save = (blob, filename) =>{
    link.href = URL.createObjectURL( blob );
    link.download = filename;
    link.click();

};


let saveArrayBuffer = (buffer, filename) => { 
    save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );
};


initialize();
animate();


