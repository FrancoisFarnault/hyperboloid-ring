import {
  Mesh,
  MathUtils
} from 'https://unpkg.com/three@0.127.0/build/three.module.js';

import {CSG} from './jsm/threejs_csg/CSG.js';
import {CylinderGeometry} from './CylinderGeometry.js';

// rename CylinderGeometry => ModifiedCylinderGeometry

class HyperboloidRing {
    constructor(fingerDiameter, radialSegments, twistAngle, width, material){
        this.fingerRadius = fingerDiameter/ 2, 
        this.radialSegments = radialSegments, 
        this.twistAngle = MathUtils.degToRad(twistAngle), 
        this.width = width,
        this.material = material;

        this.thetaLength = Math.PI * 2,
        this.minimumThickness = 0.8,
//        this.maximumThickness = 4,
        this.holeRadialSegments = 200,
        this.holeWidth = width + 1,
        
        this.thickness;
        this.mesh;

        this.setMesh();
    }
    
    setMesh(){
       
        let outerRadius = this.calculateOuterRadius(this.fingerRadius, this.minimumThickness, this.radialSegments, this.thetaLength, this.twistAngle);
        
        this.setThickness(outerRadius, this.fingerRadius);
        
        let hyperboloidGeometry = new CylinderGeometry(outerRadius, outerRadius, this.width, this.radialSegments, this.twistAngle),
            holeGeometry = new CylinderGeometry(this.fingerRadius, this.fingerRadius, this.holeWidth, this.holeRadialSegments);
    
        let hyperboloidMesh = new Mesh(hyperboloidGeometry, this.material),
            holeMesh = new Mesh(holeGeometry, this.material);
    
        this.mesh = this.subtractMeshBFromMeshA(hyperboloidMesh, holeMesh);
    }
    
    calculateOuterRadius(innerRadius, minimumThickness, radialSegments, thetaLength, twistAngle){
        let angleBetween2Vertices = thetaLength / radialSegments,
            outerRadiusWithoutThetaOffset = (innerRadius + minimumThickness) / Math.cos(angleBetween2Vertices / 2),
            outerRadiusWithThetaOffset = outerRadiusWithoutThetaOffset / Math.cos(twistAngle / 2);
                         
        return outerRadiusWithThetaOffset;
    }
    
    setThickness(outerRadius, innerRadius){
        this.thickness = outerRadius - innerRadius;      
    }
    
    subtractMeshBFromMeshA(meshA, meshB){
        let csg = new CSG();
        csg.subtract([meshA, meshB]);
        return csg.toMesh();       
    }  
    
    getMesh(){
        return this.mesh;
    }
    
    getThickness(){
        return this.thickness.toFixed(2);
    }
    
    setFingerRadiusFromDiameter(diameter){
        this.fingerRadius = diameter / 2;
        this.setMesh();
    }
    
    setRadialSegments(value){
        this.radialSegments = value;
        this.setMesh();
    }
    
    setTwistAngle(value){
        this.twistAngle = MathUtils.degToRad(value);
        this.setMesh();
    }
    
    setWidth(value){
        this.width = value;
        this.holeWidth = value + 1;
        this.setMesh();
    }
    
}

export {HyperboloidRing};