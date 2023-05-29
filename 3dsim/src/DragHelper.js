import * as THREE from 'three'

export class DragHelper {
    constructor(mainScene) {
        this.camera = mainScene.flyingCamera.camera;
        this.mainScene = mainScene;

        this.dragSquare = null;
    }

    updateDraw(x1, y1, x2, y2) {
        if (x1 > x2){
            let tmp = x1;
            x1 = x2;
            x2 = tmp;
        }
        if (y1 > y2){
            let tmp = y1;
            y1 = y2;
            y2 = tmp;
        }
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;

        /* Dispose current square */
        if (this.dragSquare) {
            this.dragSquare.removeFromParent();
            this.dragSquare.geometry.dispose();
            this.dragSquare.material.dispose();
        }

        /* Draw new one */
        let camera = this.camera;
        let v1 = new THREE.Vector3(x1, y1, -0.9).unproject(camera);
        let v2 = new THREE.Vector3(x1, y2, -0.9).unproject(camera);
        let v3 = new THREE.Vector3(x2, y1, -0.9).unproject(camera);
        let v4 = new THREE.Vector3(x2, y2, -0.9).unproject(camera);

        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            v3.x, v3.y, v3.z,
            v2.x, v2.y, v2.z,
            v1.x, v1.y, v1.z,
            v3.x, v3.y, v3.z,
            v4.x, v4.y, v4.z,
            v2.x, v2.y, v2.z,
        ]);

        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.computeVertexNormals();

        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00, transparent: true,
            opacity: 0.3, side: THREE.DoubleSide
        });
        this.dragSquare = new THREE.Mesh(geometry, material);

        /* Add to Scene */
        this.mainScene.scene.add(this.dragSquare);
    }

    removeSquare() {
        if (this.dragSquare) {
            this.dragSquare.removeFromParent();
            this.dragSquare.geometry.dispose();
            this.dragSquare.material.dispose();
        }
        this.x1 = 0;
        this.x2 = 0;
        this.y1 = 0;
        this.y2 = 0;
    }

    getDragIntersects() {
        let intersectedList = [];
        let droneList = this.mainScene.droneList;
        for (let i = 0; i < droneList.length; i++) {

            let droneNdc = droneList[i].position.clone().project(this.camera);

            if (this.x1 < droneNdc.x && droneNdc.x < this.x2 &&
                this.y1 < droneNdc.y && droneNdc.y < this.y2) {
                intersectedList.push(droneList[i]);
            }
        }
        return intersectedList;
    }
}