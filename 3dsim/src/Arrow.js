import * as THREE from 'three'

export class ArrowShape {
    constructor(scene, vStart, vEnd) {
        this.scene = scene;
        let scale = vStart.distanceTo(vEnd);
        this.createArrow(scale);

        this.reposition(vStart, vEnd);
    }

    test() {
        const geometry = new THREE.ConeGeometry(1, 4, 32);
        const material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
        let cone = new THREE.Mesh(geometry, material);
        cone.position.set(0, 0, 0);

        let target = new THREE.Vector3(1, -1, 1);
        const direction = target.clone().normalize();
        const angleXZ = Math.atan2(direction.x, direction.z);
        const angleY = Math.acos(direction.y);
        const euler = new THREE.Euler(-angleY, angleXZ + Math.PI, 0, 'YXZ');

        cone.rotation.copy(euler);
        this.scene.add(cone);
    }

    setMeshName(name) {
        this.cone.meshName = name;
        this.cylinder.meshName = name;
        
        this.cone.keepTargetListFlag = true;
        this.cylinder.keepTargetListFlag = true;
    }

    setOriginalColor() {
        this.setTempColor(this.originalColor);
    }

    setTempColor(color) {
        this.cone.material.color.set(color);
        this.cylinder.material.color.set(color);
    }

    setColor(color) {
        this.originalColor = color;
        this.setTempColor(color);
    }

    setOnMouseDownHandler(func) {
        this.cone.onMouseDownHandler = func;
        this.cylinder.onMouseDownHandler = func;
    }

    setOnMouseDragHandler(func) {
        this.cone.onMouseDragHandler = func;
        this.cylinder.onMouseDragHandler = func;
    }

    setOnMouseMoveHandler(func) {
        this.cone.onMouseMoveHandler = func;
        this.cylinder.onMouseMoveHandler = func;
    }

    setOnMouseUpHandler(func) {
        this.cone.onMouseUpHandler = func;
        this.cylinder.onMouseUpHandler = func;
    }

    setIntersectHandler(func) {
        this.cone.intersectHandler = func;
        this.cylinder.intersectHandler = func;
    }

    setIntersectOutHandler(func) {
        this.cone.intersectOutHandler = func;
        this.cylinder.intersectOutHandler = func;
    }

    reposition(vStart, vEnd) {
        let rotation = vEnd.clone();
        rotation.sub(vStart);

        let cylinderPos = new THREE.Vector3().lerpVectors(vStart, vEnd, 0.5);
        let conePos = new THREE.Vector3().lerpVectors(vStart, vEnd, 1.0);

        this.cone.position.copy(conePos);
        this.cylinder.position.copy(cylinderPos);

        const direction = rotation.clone().normalize();
        const angleXZ = Math.atan2(direction.x, direction.z);
        const angleY = Math.acos(direction.y);
        const euler = new THREE.Euler(-angleY, angleXZ + Math.PI, 0, 'YXZ');

        this.cone.rotation.copy(euler);
        this.cylinder.rotation.copy(euler);
    }

    createArrow(scale) {
        this.createCone();
        this.createCylinder(scale);
    }

    createCone() {
        const geometry = new THREE.ConeGeometry(0.5, 2, 32);
        const material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
        this.cone = new THREE.Mesh(geometry, material);
        this.scene.add(this.cone);
    }

    createCylinder(scale) {
        const geometry = new THREE.CylinderGeometry(0.15, 0.15, scale, 32);
        const material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
        this.cylinder = new THREE.Mesh(geometry, material);

        this.scene.add(this.cylinder);
    }
}