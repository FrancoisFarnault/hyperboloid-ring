import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Color,
  MeshStandardMaterial,
  Mesh,
  AmbientLight,
  DirectionalLight,
  HemisphereLight,
  Group,
  CubeTextureLoader,
  Quaternion,
  Vector3,
  Math as ThreeMath
} from 'https://unpkg.com/three@0.127.0/build/three.module.js';

import {HyperboloidRing} from './HyperboloidRing.js';
import {OrbitControls} from './jsm/controls/OrbitControls.js';
import {STLExporter} from './jsm/exporters/STLExporter.js';
import {CSG} from './jsm/threejs_csg/CSG.js';

let meshIsRotating; 

let camera, scene, renderer, exporter, reflectionCube, material, mesh, nonRotatedMesh, lightsGroup;

let myHyperboloidRing;

let fingerRadius, 
    radialSegments,
    twistAngle,
    ringWidth;
    
let fingerDiameterInput,
    radialSegmentsInput,
    twistAngleInput,
    ringWidthInput;
    
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

    let fov = 75,
        aspectRatio = canvasWidth / canvasHeight,
        near = 0.1,
        far = 500;
    
    camera = new PerspectiveCamera( fov, aspectRatio, near, far);
    camera.position.set( 30, 30, 30 );

    //
    
    scene = new Scene();
    scene.background = new Color("#f7f3f0");
    
    //

    let directionalLight = new DirectionalLight( 0xffffff, 0.2 );
    directionalLight.position.set(-1, 2, 4); // x, y, z
    
    let hemiLight = new HemisphereLight( 0xffffff, 0.1 );
    hemiLight.position.set( 0, 200, 0 ); // x, y, z

    lightsGroup = new Group();
    lightsGroup.add(directionalLight);
    lightsGroup.add(hemiLight);
    
    scene.add(lightsGroup);

    // 
    
    reflectionCube = new CubeTextureLoader()
    .setPath( './textures/' )
    .load( [
            'px.png',
            'nx.png',
            'py.png',
            'ny.png',
            'pz.png',
            'nz.png'
    ] );

    material = new MeshStandardMaterial({
        color: 0xdeae36,
        envMap : reflectionCube,
        flatShading: true,
        metalness: 1.0,
        roughness: 0
    });
    
    // 
    
    fingerDiameterInput = document.getElementById('fingerDiameter');
    radialSegmentsInput = document.getElementById('radialSegments');
    twistAngleInput = document.getElementById('twistAngle');
    ringWidthInput = document.getElementById('ringWidth');

    fingerDiameterLabel = document.querySelector('.fingerDiameterLabel');
    radialSegmentsLabel = document.querySelector('.radialSegmentsLabel');
    twistAngleLabel = document.querySelector('.twistAngleLabel');
    ringWidthLabel = document.querySelector('.ringWidthLabel');
    ringThicknessLabel = document.querySelector('.ringThicknessLabel');
    
    initializeParametersValues();
    setInputListeners();
    
    //
    
    myHyperboloidRing = new HyperboloidRing (fingerRadius, radialSegments, twistAngle, ringWidth, material);

    /** 
        labels are initialized after myHyperboloidRing instanciation because of the label "thickness".
        Indeed the thickness can only be calculated after instantiation of the ring  
    **/
    initializeLabels(); 
    
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
    fingerDiameterInput.addEventListener('input', () => {
        let value = fingerDiameterInput.value / 10;
        myHyperboloidRing.setFingerRadius(value / 2);
        fingerDiameterLabel.innerHTML = value.toFixed(2);
        ringThicknessLabel.innerHTML = myHyperboloidRing.getThickness();
        refreshMesh();
    });
    radialSegmentsInput.addEventListener('input', () => {
        myHyperboloidRing.setRadialSegments(radialSegmentsInput.value);
        radialSegmentsLabel.innerHTML = radialSegmentsInput.value;
        ringThicknessLabel.innerHTML = myHyperboloidRing.getThickness();
        refreshMesh();
    });
    twistAngleInput.addEventListener('input', () => {
        myHyperboloidRing.setTwistAngle((Math.PI * 2 * (twistAngleInput.value / 1000)).toFixed(2));
        twistAngleLabel.innerHTML = (Math.PI * 2 * (twistAngleInput.value / 1000)).toFixed(2);
        ringThicknessLabel.innerHTML = myHyperboloidRing.getThickness();
        refreshMesh();
    });    
    ringWidthInput.addEventListener('input', () => {
        myHyperboloidRing.setWidth(ringWidthInput.value / 10);
        ringThicknessLabel.innerHTML = myHyperboloidRing.getThickness();
        ringWidthLabel.innerHTML = ringWidthInput.value / 10;
        refreshMesh();
    });
};

let initializeParametersValues = () => {
    fingerRadius = (fingerDiameterInput.value / 10) / 2; 
    radialSegments = radialSegmentsInput.value;
    twistAngle = (Math.PI * 2) * (twistAngleInput.value / 1000);
    ringWidth = ringWidthInput.value / 10;
};

let initializeLabels = () => {
    fingerDiameterLabel.innerHTML = fingerRadius * 2;
    radialSegmentsLabel.innerHTML = radialSegments;
    twistAngleLabel.innerHTML = twistAngle.toFixed(2);
    ringWidthLabel.innerHTML = ringWidth;
    ringThicknessLabel.innerHTML = myHyperboloidRing.getThickness();   
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

    scene.add(mesh);
};


let setMesh = () => {   
    mesh = myHyperboloidRing.getMesh();
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


