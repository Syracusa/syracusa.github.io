import * as THREE from 'three'
import { Line3, Vector3, _SRGBAFormat } from 'three';
import { ArrowShape } from './Arrow.js';

export class ShiftHelper {
    constructor(scene, cam, target) {
        this.scene = scene;
        this.cam = cam;
        this.target = target;
        this.targetPos = target.position.clone();
        this.drawXYZArrows();
    }

    retarget(target) {
        this.target = target;
        this.targetPos = target.position.clone();

        this.xArrowTo = this.targetPos.clone();
        this.xArrowTo.x += 8;
        this.yArrowTo = this.targetPos.clone();
        this.yArrowTo.y += 8;
        this.zArrowTo = this.targetPos.clone();
        this.zArrowTo.z += 8;

        this.arrowX.reposition(this.targetPos, this.xArrowTo);
        this.arrowY.reposition(this.targetPos, this.yArrowTo);
        this.arrowZ.reposition(this.targetPos, this.zArrowTo);

        this.arrowX.to = this.xArrowTo;
        this.arrowY.to = this.yArrowTo;
        this.arrowZ.to = this.zArrowTo;
    }

    drawArrow(name, color, to) {
        let arrow = new ArrowShape(this.scene, this.targetPos, to);
        arrow.to = to.clone();
        arrow.setColor(color);
        arrow.setMeshName(name);
        arrow.setIntersectHandler(() => {
            arrow.setTempColor(0xFFFF00);
        });
        arrow.setIntersectOutHandler(() => {
            arrow.setOriginalColor();
        });
        arrow.setOnMouseDownHandler((e) => {
            // console.log("Mouse down on " + name);
            this.dragStartPos = this.targetPos.clone();
            this.dragStartTo = arrow.to.clone();

            if (0) {
                const material = new THREE.LineBasicMaterial({ color: 0xaaaaaa });
                const points = [];

                let posStart = this.targetPos.clone().project(this.cam);
                posStart.z = -1.0
                posStart.unproject(this.cam);

                let posEnd = arrow.to.clone().project(this.cam);
                posEnd.z = -1.0
                posEnd.unproject(this.cam);

                points.push(posStart);
                points.push(posEnd);

                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(geometry, material);
                this.scene.add(line);
            }
        });

        arrow.setOnMouseDragHandler((x1, y1, x2, y2) => {
            let arrowStart = this.dragStartPos.clone().project(this.cam);
            arrowStart.z = -1.0;
            let arrowEnd = this.dragStartTo.clone().project(this.cam);
            arrowEnd.z = -1.0;

            let arrowLine = new Line3(arrowStart, arrowEnd);

            let ndcX1 = (x1 / window.innerWidth) * 2 - 1;
            let ndcY1 = -1 * (y1 / window.innerHeight) * 2 + 1;
            let dragStart = new Vector3();
            arrowLine.closestPointToPoint(new Vector3(ndcX1, ndcY1, -1.0), false, dragStart);

            let ndcX2 = (x2 / window.innerWidth) * 2 - 1;
            let ndcY2 = -1 * (y2 / window.innerHeight) * 2 + 1;
            let dragEnd = new Vector3();
            arrowLine.closestPointToPoint(new Vector3(ndcX2, ndcY2, -1.0), false, dragEnd);

            let dragDist = dragStart.distanceTo(dragEnd);
            let arrowProjDist = arrowStart.distanceTo(arrowEnd);

            let movedir = this.dragStartPos.clone().sub(this.dragStartTo);
            movedir.multiplyScalar(dragDist / arrowProjDist);

            let d1 = arrowStart.distanceTo(dragStart);
            let d2 = arrowEnd.distanceTo(dragStart);
            let d3 = arrowStart.distanceTo(dragEnd);
            let d4 = arrowEnd.distanceTo(dragEnd);

            if ((d1 - d2) < (d3 - d4)) {
                movedir.multiplyScalar(-1.0);
            }
            this.move(movedir);
        });
        return arrow;
    }

    move(movedir) {
        this.targetPos = this.dragStartPos.clone().add(movedir);

        this.xArrowTo = this.targetPos.clone();
        this.xArrowTo.x += 8;

        this.yArrowTo = this.targetPos.clone();
        this.yArrowTo.y += 8;
        this.zArrowTo = this.targetPos.clone();
        this.zArrowTo.z += 8;

        this.arrowX.reposition(this.targetPos, this.xArrowTo);
        this.arrowY.reposition(this.targetPos, this.yArrowTo);
        this.arrowZ.reposition(this.targetPos, this.zArrowTo);

        this.arrowX.to = this.xArrowTo;
        this.arrowY.to = this.yArrowTo;
        this.arrowZ.to = this.zArrowTo;

        this.target.position.copy(this.targetPos);
    }

    drawXYZArrows() {
        let xArrowTo = this.targetPos.clone();
        xArrowTo.x += 8;
        this.arrowX = this.drawArrow('X_Arrow', 0xFF0000, xArrowTo);
        this.xArrowTo = xArrowTo;

        let yArrowTo = this.targetPos.clone();
        yArrowTo.y += 8;
        this.arrowY = this.drawArrow('Y_Arrow', 0x00FF00, yArrowTo);
        this.yArrowTo = yArrowTo;

        let zArrowTo = this.targetPos.clone();
        zArrowTo.z += 8;
        this.arrowZ = this.drawArrow('Z_Arrow', 0x0000FF, zArrowTo);
        this.zArrowTo = zArrowTo;
    }
}