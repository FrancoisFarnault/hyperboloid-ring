import {
  Mesh
} from 'https://unpkg.com/three@0.127.0/build/three.module.js';

import {CSG} from './jsm/threejs_csg/CSG.js';
import {CylinderGeometry} from './CylinderGeometry.js';

// rename CylinderGeometry => ModifiedCylinderGeometry

class HyperboloidRing {
    constructor(fingerRadius, radialSegments, twistAngle, width, material){
        this.fingerRadius = fingerRadius, 
        this.radialSegments = radialSegments, 
        this.twistAngle = twistAngle, 
        this.width = width,
        this.material = material;

        this.thetaLength = Math.PI * 2,
        this.minimumThickness = 0.8,
        this.maximumThickness = 4,
        this.holeRadialSegments = 200,
        this.holeWidth = width + 1,
        this.mesh;
        
        this.setMesh(this.fingerRadius, this.minimumThickness, this.radialSegments, this.thetaLength, this.twistAngle, this.width, this.holeWidth, this.holeRadialSegments, this.material);
    }
    
    setMesh(fingerRadius, minimumThickness, radialSegments, thetaLength, twistAngle, width, holeWidth, holeRadialSegments, material){
        let outerRadius = this.calculateOuterRadius(fingerRadius, minimumThickness, radialSegments, thetaLength, twistAngle);
        
        this.setThickness(outerRadius, fingerRadius);
        
        let hyperboloidGeometry = new CylinderGeometry(outerRadius, outerRadius, width, radialSegments, twistAngle),
            holeGeometry = new CylinderGeometry(fingerRadius, fingerRadius, holeWidth, holeRadialSegments);
    
        let hyperboloidMesh = new Mesh(hyperboloidGeometry, material),
            holeMesh = new Mesh(holeGeometry, material);
    
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
    
    setFingerRadius(value){
        this.fingerRadius = value;
        this.setMesh(value, this.minimumThickness, this.radialSegments, this.thetaLength, this.twistAngle, this.width, this.holeWidth, this.holeRadialSegments, this.material);
    }
    
    setRadialSegments(value){
        this.radialSegments = value;
        this.setMesh(this.fingerRadius, this.minimumThickness, value, this.thetaLength, this.twistAngle, this.width, this.holeWidth, this.holeRadialSegments, this.material);
    }
    
    setTwistAngle(value){
        this.twistAngle = value;
        this.setMesh(this.fingerRadius, this.minimumThickness, this.radialSegments, this.thetaLength, this.twistAngle, this.width, this.holeWidth, this.holeRadialSegments, this.material);
    }
    
    setWidth(value){
        this.width = value;
        this.holeWidth = value + 1;
        this.setMesh(this.fingerRadius, this.minimumThickness, this.radialSegments, this.thetaLength, this.twistAngle, this.width, this.holeWidth, this.holeRadialSegments, this.material);
    }
}

export {HyperboloidRing};