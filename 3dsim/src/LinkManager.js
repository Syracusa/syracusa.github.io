import * as THREE from 'three'

export class LinkManager {
    constructor(mainScene) {
        this.mainScene = mainScene;

        this.param = {
            linkDist: 20,
            goodLinkDist: 15
        };
        this.raycaster = new THREE.Raycaster();

        this.lineList = [];
        this.drawLink();
    }

    checkLos(pos1, pos2) {
        this.raycaster.set(pos1, pos2.clone().sub(pos1).normalize());
        let distance = pos1.distanceTo(pos2);
        // console.log(distance);
        this.raycaster.near = 0;
        this.raycaster.far = distance;

        const intersects = this.raycaster.intersectObjects(this.mainScene.scene.children, false);

        if (intersects.length > 0) {
            for (let i = 0; i < intersects.length; i++) {
                if (intersects[i].object.hasOwnProperty('isTerrain')) {
                    return false;
                }
            }
        }
        return true;
    }

    drawLinkLine(pos1, pos2) {
        let distance = pos1.distanceTo(pos2);
        let material;

        if (distance > this.param.linkDist)
            return;

        if (!this.checkLos(pos1, pos2)) {
            material = new THREE.LineBasicMaterial({ color: 0xdddddd });
            material.transparent = true;
            material.opacity = 0.5;
        } else {
            if (distance < this.param.goodLinkDist) {
                material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
            } else {
                material = new THREE.LineBasicMaterial({ color: 0xff0000 });
                material.transparent = true;
                material.opacity = 1 - (distance - this.param.goodLinkDist) / (this.param.linkDist - this.param.goodLinkDist);
            }
        }

        const points = [pos1, pos2];

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        line.ignoreIntersect = true;
        this.lineList.push(line);

        this.mainScene.scene.add(line);
    }

    drawLink() {
        for (let i = 0; i < this.lineList.length; i++) {
            this.lineList[i].removeFromParent();
            this.lineList[i].geometry.dispose();
            this.lineList[i].material.dispose();
        }
        this.lineList = [];

        for (let i = 0; i < this.mainScene.droneList.length; i++) {
            for (let j = i + 1; j < this.mainScene.droneList.length; j++) {

                this.drawLinkLine(
                    this.mainScene.droneList[i].position.clone(),
                    this.mainScene.droneList[j].position.clone()
                );
            }
        }
    }
}