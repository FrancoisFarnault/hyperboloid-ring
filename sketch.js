import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Color,
  MeshStandardMaterial,
  Mesh,
  DirectionalLight,
  HemisphereLight,
  Group,
  CubeTextureLoader
} from 'https://unpkg.com/three@0.127.0/build/three.module.js';

import {HyperboloidRing} from './HyperboloidRing.js';
import {OrbitControls} from './jsm/controls/OrbitControls.js';
import {STLExporter} from './jsm/exporters/STLExporter.js';
import {CSG} from './jsm/threejs_csg/CSG.js';

let meshIsRotating; 

let camera, scene, renderer, exporter, reflectionCube, material, mesh, nonRotatedMesh, lightsGroup;

let ring;
    
let fingerDiameterLabel,
    radialSegmentsLabel,
    twistAngleLabel,
    ringWidthLabel,
    ringThicknessLabel;


let initialize = () => {
    
    let canvas = document.querySelector('#canvas'),
        canvasWidth = canvas.clientWidth, 
        canvasHeight = canvas.clientHeight;

    // 
    camera = new PerspectiveCamera( 75, canvasWidth / canvasHeight, 0.1, 500);
    camera.position.set( 30, 30, 30 );

    //
    scene = new Scene();
    scene.background = new Color("#f7f3f0");
    
    
    // lights
    
    let directionalLight = new DirectionalLight( 0xffffff, 0.2 );
    let hemiLight = new HemisphereLight( 0xffffff, 0.1 );
   
    directionalLight.position.set(-1, 2, 4); // x, y, z
    hemiLight.position.set( 0, 200, 0 ); 

    lightsGroup = new Group();
    lightsGroup.add(directionalLight);
    lightsGroup.add(hemiLight);
    
    scene.add(lightsGroup);


    // material
    
    reflectionCube = new CubeTextureLoader()
    .setPath( './textures/' )
    .load( [
            'px.png',
            'nx.png',
            'py.png',
            'ny.png',
            'pz.png',
            'nz.png'
    ]);

    material = new MeshStandardMaterial({
        color: 0xdeae36,
        envMap : reflectionCube,
        envMapIntensity: 1.2,
        flatShading: true,
        metalness: 1.0,
        roughness: 0
    });
    
    
    // ring instantiation
    
    let fingerDiameter = 18.4, 
        radialSegments = 13,
        twistAngle = 45,
        ringWidth = 10;
    
    ring = new HyperboloidRing (fingerDiameter, radialSegments, twistAngle, ringWidth, material);


    //  inputs with labels
    
    setInputListeners();
    
    fingerDiameterLabel = document.querySelector('.fingerDiameterLabel');
    radialSegmentsLabel = document.querySelector('.radialSegmentsLabel');
    twistAngleLabel = document.querySelector('.twistAngleLabel');
    ringWidthLabel = document.querySelector('.ringWidthLabel');
    ringThicknessLabel = document.querySelector('.ringThicknessLabel');
    
    fingerDiameterLabel.innerHTML = fingerDiameter;
    radialSegmentsLabel.innerHTML = radialSegments;
    twistAngleLabel.innerHTML = twistAngle;
    ringWidthLabel.innerHTML = ringWidth;  
    
    setThicknessLabel();


    //
    meshIsRotating = true;
    setMesh();
    scene.add(mesh);

    // 
    renderer = new WebGLRenderer({ 
        canvas,
        antialias: true
      });
    renderer.setSize(canvasWidth, canvasHeight);

    // 
    let controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 0, 0 );
    controls.update();

    canvas.addEventListener( 'pointerdown', () => { meshIsRotating = false; }, false );
    canvas.addEventListener( 'pointerup', () => { meshIsRotating = true; }, false );

    // 
    exporter = new STLExporter();
    
    let buttonExportBinary = document.getElementById( 'exportBinary' );
    buttonExportBinary.addEventListener( 'click', exportBinary, false );   
};


let setInputListeners = () => {   
    let fingerDiameterInput = document.getElementById('fingerDiameter'),
        radialSegmentsInput = document.getElementById('radialSegments'),
        twistAngleInput = document.getElementById('twistAngle'),
        ringWidthInput = document.getElementById('ringWidth');
    
    fingerDiameterInput.addEventListener('input', () => {
        let value = fingerDiameterInput.value / 10;
        ring.setFingerRadiusFromDiameter(value);
        fingerDiameterLabel.innerHTML = value;
        setThicknessLabel();
        refreshMesh();
    });
    radialSegmentsInput.addEventListener('input', () => {
        let value = radialSegmentsInput.value;
        ring.setRadialSegments(value);
        radialSegmentsLabel.innerHTML = value;
        setThicknessLabel();
        refreshMesh();
    });
    twistAngleInput.addEventListener('input', () => {
        let value = twistAngleInput.value;
        ring.setTwistAngle(value);
        twistAngleLabel.innerHTML = value;
        setThicknessLabel();
        refreshMesh();
    });    
    ringWidthInput.addEventListener('input', () => {
        let value = ringWidthInput.value / 10;
        ring.setWidth(value);
        ringWidthLabel.innerHTML = value;
        refreshMesh();
    });
};

let setThicknessLabel = () => {
    ringThicknessLabel.innerHTML = ring.getThickness();
};

let refreshMesh = () => {
    // keep track of the orientation
    let rotationX = mesh.rotation.x,
        rotationZ = mesh.rotation.z;
        
    // remove previous mesh from the scene
    mesh.geometry.dispose();
    mesh.material.dispose();
    scene.remove( mesh );
    
    // overwrite previous mesh
    setMesh();
    mesh.rotation.x = rotationX;
    mesh.rotation.z = rotationZ;

    // add updated mesh to scene
    scene.add(mesh);
};


let setMesh = () => {   
    mesh = ring.getMesh();
    nonRotatedMesh = mesh.clone(); // save a non rotated clone for STL export 
};


let animate = () => {
    if (meshIsRotating) {
        mesh.rotation.x += 0.003;
        mesh.rotation.z += 0.006;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    lightsGroup.quaternion.copy(camera.quaternion); // prevents lights from rotating with orbit control
};


let exportBinary = () => {
    let result = exporter.parse( nonRotatedMesh, { binary: true } );
    saveArrayBuffer( result, 'hyperboloid_ring.stl' );
};


let saveArrayBuffer = (buffer, filename) => { 
    save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );
};


let save = (blob, filename) =>{
    let link = document.createElement( 'a' );
    link.href = URL.createObjectURL( blob );
    link.download = filename;
    link.click();
};


initialize();
animate();


