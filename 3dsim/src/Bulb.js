import * as THREE from 'three'

export class Bulb {
    constructor(scene, pos) {
        let bulbMesh = this.genBulbMesh();
        bulbMesh.position.copy(pos);

        let pointLight = this.genPointLight();
        pointLight.position.set(0, -3, 0);
        bulbMesh.add(pointLight);
        scene.add(bulbMesh);

        this.bulbMesh = bulbMesh;
        this.scene = scene;
    }

    genBulbMesh() {
        const geometry = new THREE.SphereGeometry(1, 8, 8);
        const material = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF
        });

        return new THREE.Mesh(geometry, material);
    }

    genPointLight() {
        let light = new THREE.PointLight(0xffffff, 1, 100);

        light.castShadow = true;

        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 2500;
        light.shadow.bias = -0.001;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;

        return light;
    }
}