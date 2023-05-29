import * as THREE from 'three';
import { Vector3 } from 'three';

export class FlyingPerspectiveCamera {

    constructor(screen_ratio) {
        this.screenRatio = screen_ratio;
        this.camLookat = new Vector3(63, 22, 33);

        this.camera = new THREE.PerspectiveCamera();
        this.camera.aspect = screen_ratio;
        this.camera.near = 0.1;
        this.camera.far = 2000;

        this.CamXzAngle = Math.PI * 5.3 / 3;
        this.CamYAngle = Math.PI * 6.7 / 4;
        this.CamdirDiameter = 40.0;

        this.ViewScale = 25;
        this.UpdateCameraPositionByLookAt();
        this.camera.updateProjectionMatrix();
    }

    updateScreenRatio(screen_ratio) {
        this.screenRatio = screen_ratio;

        this.camera.aspect = screen_ratio;
        this.camera.updateProjectionMatrix();
    }

    UpdateCameraPositionByLookAt(){
        let camPos = new Vector3().setFromSphericalCoords(this.CamdirDiameter, this.CamYAngle, this.CamXzAngle);
        camPos.add(this.camLookat);
        this.camera.position.copy(camPos);

        this.camLookDir = Math.atan2(this.camera.position.z - this.camLookat.z, 
            this.camera.position.x - this.camLookat.x) + Math.PI;
    }

    GoAngle(angle, scalar) {
        this.camLookat.x += 0.1 * Math.cos(angle) * scalar * this.ViewScale / 5;
        this.camLookat.z += 0.1 * Math.sin(angle) * scalar * this.ViewScale / 5;
    }

    GoFront(scalar) {
        this.GoAngle(this.camLookDir, scalar);
    }

    GoBack(scalar) {
        this.GoAngle(this.camLookDir + Math.PI, scalar);
    }

    GoLeft(scalar) {
        this.GoAngle(this.camLookDir + Math.PI * 3 / 2, scalar);
    }

    GoRight(scalar) {
        this.GoAngle(this.camLookDir + Math.PI * 1 / 2, scalar);
    }

    GoUp(scalar) {
        this.camLookat.position.y += 0.1 * scalar;
    }

    GoDown(scalar) {
        this.camLookat.position.y -= 0.1 * scalar;
    }

    ViewFar(scalar) {
        this.CamdirDiameter += 0.1 * scalar;
    }

    ViewNear(scalar) {
        this.CamdirDiameter -= 0.1 * scalar;
    }

    ViewUp(scalar) {
        this.CamYAngle += 0.01 * scalar;
    }

    ViewBottom(scalar) {
        this.CamYAngle -= 0.01 * scalar;
    }

    GetClose(scalar) {
        this.CamdirDiameter -= 2.0 * scalar;
    }

    RightRotate(scalar) {
        this.CamXzAngle += 0.01 * scalar;
    }

    LeftRotate(scalar) {
        this.CamXzAngle -= 0.01 * scalar;
    }

    UpdateCamera() {
        this.UpdateCameraPositionByLookAt();
        this.camera.lookAt(this.camLookat);
        // this.camera.updateProjectionMatrix();
    }
}