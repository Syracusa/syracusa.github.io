import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.18/+esm';
import * as THREE from 'three'
import { DragHelper } from './DragHelper.js';
import { ShiftHelper } from './ShiftHelper.js';

const MOUSE_STATE_DEFAULT = 0;
const MOUSE_STATE_RAISE_TERRAIN = 1;
const MOUSE_STATE_DIG_TERRAIN = 2;

export class Controller {
    that = this;

    constructor(mainScene) {
        this.mainScene = mainScene;
        this.keystate = {};

        window.onkeydown = (e) => {
            this.keystate[e.key] = 1;
        }
        window.onkeyup = (e) => {
            this.keystate[e.key] = 0;
        }

        this.pointer = new THREE.Vector2(0, 0);

        this.addMouseEventListener(this);

        /* Raycaster */
        this.raycaster = new THREE.Raycaster();

        this.intersected = null;
        this.dragTarget = null;
        this.selectedTarget = null;
        this.selectedTargetList = [];

        this.initDatGui(this);

        this.dragHelper = new DragHelper(mainScene);

        this.dummyTargetSync = false;

        /* Dummy target for shifthelper */
        this.genDummy();

        /* ShiftHelper */
        this.shiftHelper = new ShiftHelper(mainScene.scene,
            this.mainScene.flyingCamera.camera,
            this.dummyTarget);
    }

    initDatGui(controller) {
        let callbacks = {
            'Create new node': function () {
                console.log("Create new node");
                let node = controller.mainScene.droneModel.generateDrone();
                controller.mainScene.droneList.push(node);
            },
            'Remove node': function () {
                console.log("Remove node");
                console.log(controller.selectedTarget);
                controller.selectedTarget.object.removeFromParent();
            },
            'Remove all node': function () {
                console.log("Remove all node");
                let droneList = controller.mainScene.droneList;
                console.log(droneList);
                for (let i = 0; i < droneList.length; i++) {
                    console.log(droneList[i]);
                    droneList[i].removeFromParent();
                }
                controller.mainScene.droneList = [];
            },
            'Raise Terrain': function () {
                controller.mouseMode = MOUSE_STATE_RAISE_TERRAIN;
                document.body.style.cursor = 'zoom-in';
            },
            'Dig Terrain': function () {
                controller.mouseMode = MOUSE_STATE_DIG_TERRAIN;
                document.body.style.cursor = 'zoom-out';
            },
            'Default Mode': function () {
                controller.mouseMode = MOUSE_STATE_DEFAULT;
                document.body.style.cursor = 'default';
            }
        }

        const gui = new GUI()

        const nodeFolder = gui.addFolder('Node');
        nodeFolder.add(callbacks, 'Create new node');
        nodeFolder.add(callbacks, 'Remove node');
        nodeFolder.add(callbacks, 'Remove all node');

        nodeFolder.open();

        const mouseModeFolder = gui.addFolder('MouseMode');
        mouseModeFolder.add(callbacks, 'Raise Terrain');
        mouseModeFolder.add(callbacks, 'Dig Terrain');
        mouseModeFolder.add(callbacks, 'Default Mode');

        mouseModeFolder.open();
    }

    genDummy() {
        const geometryS = new THREE.SphereGeometry(0.1, 32, 32);
        const materialS = new THREE.MeshStandardMaterial({
            color: 0xFFAACF,
            // wireframe: true,
        });

        const sphere1 = new THREE.Mesh(geometryS, materialS);

        sphere1.position.set(45, 100, 48);
        sphere1.meshName = 'Dummy';
        this.mainScene.scene.add(sphere1);

        this.dummyTarget = sphere1;
    }

    isKeyPressed(key) {
        if (key in this.keystate) {
            if (this.keystate[key] == 1) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    outCurrentTarget(e) {
        /* Target out handler */

        if (this.intersected.object.hasOwnProperty('keepTargetListFlag')) {
            /* Keep target */
            // console.log('Keep target');
        } else {
            if (this.selectedTarget) {
                // console.log(this.selectedTarget)
                if (this.selectedTarget.object.hasOwnProperty('outTargetHandler')) {
                    this.selectedTarget.object.outTargetHandler(e);
                }
            }

            for (let i = 0; i < this.selectedTargetList.length; i++) {
                if (this.selectedTargetList[i].hasOwnProperty('outTargetHandler')) {
                    this.selectedTargetList[i].outTargetHandler(e);
                }
            }
            this.selectedTargetList = [];
            this.dummyTarget.position.y = -50;
        }
    }

    inNewTarget(e) {
        /* Update Target */
        if (this.intersected.object.isTarget == true){
            this.selectedTarget = this.intersected;
        }

        this.dragTarget = this.intersected;
        if (this.intersected.object.hasOwnProperty('onMouseDownHandler')) {
            this.intersected.object.onMouseDownHandler(e);
        } else {
            this.shiftHelper.retarget(this.dummyTarget);
        }

        if (this.intersected.object.hasOwnProperty('onTargetHandler')) {
            this.intersected.object.onTargetHandler(e);
        }
    }

    terrainEventHandler(terrainMesh) {
        let x = terrainMesh.object.terrainX;
        let y = terrainMesh.object.terrainY;

        if (this.mouseMode == MOUSE_STATE_RAISE_TERRAIN){
            this.mainScene.terrain.raiseHeightPoint(x, y, 1);
        } else if (this.mouseMode == MOUSE_STATE_DIG_TERRAIN){
            this.mainScene.terrain.raiseHeightPoint(x, y, -1);
        }
    }

    addMouseEventListener(controller) {
        /* On mouse down */

        window.addEventListener("pointerdown", (e) => {
            controller.dragStartX = e.x;
            controller.dragStartY = e.y;

            controller.outCurrentTarget(e);
            if (controller.intersected) {
                if (controller.intersected.object.hasOwnProperty('isTerrain')){
                    controller.terrainEventHandler(controller.intersected);
                }
                controller.inNewTarget(e);
            }

        });

        window.addEventListener("pointermove", (e) => {
            controller.pointer.x = (e.x / window.innerWidth) * 2 - 1;
            controller.pointer.y = -1 * (e.y / window.innerHeight) * 2 + 1;

            /* Warning : this != Controller */
            if (controller.dragTarget) {
                if (controller.dragTarget.object.hasOwnProperty('onMouseDragHandler')) {
                    controller.dragTarget.object.onMouseDragHandler(
                        controller.dragStartX, controller.dragStartY,
                        e.x, e.y);

                } else {
                    controller.dragHelper.updateDraw(
                        (controller.dragStartX / window.innerWidth) * 2 - 1,
                        -1 * (controller.dragStartY / window.innerHeight) * 2 + 1,
                        controller.pointer.x,
                        controller.pointer.y
                    );
                }
            }
        });

        window.addEventListener("pointerup", (e) => {
            /* Warning : this != Controller */
            if (controller.dragTarget
                && controller.dragTarget.object.hasOwnProperty('keepTargetListFlag')) {
                /* Keep target */
                // console.log("Keep target!")
            } else {
                controller.onDragMouseUp(e);
            }
            controller.dragTarget = null;
        });

        /* On mouse out */
        controller.mainScene.renderer.domElement.onmouseout = function (e) {
            /* Warning : this != Controller */
        }
    }

    onDragMouseUp(e) {

        this.selectedTargetList = this.dragHelper.getDragIntersects();
        this.selectdTargetOrigPos = [];

        let maxX = -99999.9;
        let minX = 99999.9;
        let maxY = -99999.9;
        let minY = 99999.9;
        let maxZ = -99999.9;
        let minZ = 99999.9;

        for (let i = 0; i < this.selectedTargetList.length; i++) {
            let selTarget = this.selectedTargetList[i];

            if (selTarget.hasOwnProperty('onTargetHandler')) {
                selTarget.onTargetHandler(e);
            }
            this.selectdTargetOrigPos[i] = selTarget.position.clone();

            if (selTarget.position.x > maxX)
                maxX = selTarget.position.x;
            if (selTarget.position.x < minX)
                minX = selTarget.position.x;
            if (selTarget.position.y > maxY)
                maxY = selTarget.position.y;
            if (selTarget.position.y < minY)
                minY = selTarget.position.y;
            if (selTarget.position.z > maxZ)
                maxZ = selTarget.position.z;
            if (selTarget.position.z < minZ)
                minZ = selTarget.position.z;
        }

        if (this.selectedTargetList.length > 0) {
            /* Calc Max x, y, z and Min x, y, z */
            let targetCenterPos = new THREE.Vector3((minX + maxX) / 2,
                (minY + maxY) / 2,
                (minZ + maxZ) / 2);

            this.dummyTarget.position.copy(targetCenterPos);
            /* Move dummy target to center of targets */
            this.dummyTargetOriginalpos = targetCenterPos.clone();

            /* Shifthelper retarget to dummy target */
            this.shiftHelper.retarget(this.dummyTarget);

            this.dummyTargetSync = true;
        }
        this.dragHelper.removeSquare();
    }

    raycastControl() {
        /* Raycaster */
        this.raycaster.setFromCamera(this.pointer, this.mainScene.flyingCamera.camera);
        const intersects = this.raycaster.intersectObjects(this.mainScene.scene.children, false);

        if (intersects.length > 0) {
            let firstIntersect = null;
            for (let i = 0; i < intersects.length; i++) {
                if (intersects[i].object.hasOwnProperty('ignoreIntersect')) {
                    if (intersects[i].object.ignoreIntersect == true) {
                        continue;
                    }
                }
                firstIntersect = intersects[i];
                break;
            }

            const INTERSECT_VERBOSE = 0;
            if (INTERSECT_VERBOSE) {
                if (firstIntersect.object.hasOwnProperty('meshName')) {
                    console.log(firstIntersect.object.meshName);
                } else {
                    console.log(firstIntersect);
                }
            }

            if (this.intersected == null || firstIntersect == null
                || this.intersected.object.uuid != firstIntersect.object.uuid) {
                if (this.intersected &&
                    this.intersected.object.hasOwnProperty('intersectOutHandler')) {
                    this.intersected.object.intersectOutHandler();
                }

                if (firstIntersect) {
                    this.intersected = firstIntersect;
                    if (firstIntersect.object.hasOwnProperty('intersectHandler')) {
                        firstIntersect.object.intersectHandler();
                    }
                }
            }
        }
    }

    update(timeDiff) {
        timeDiff *= 0.1;
        if (this.isKeyPressed('w')) {
            this.mainScene.flyingCamera.GoFront(timeDiff);
        }
        if (this.isKeyPressed('s')) {
            this.mainScene.flyingCamera.GoBack(timeDiff);
        }
        if (this.isKeyPressed('a')) {
            this.mainScene.flyingCamera.GoLeft(timeDiff);
        }
        if (this.isKeyPressed('d')) {
            this.mainScene.flyingCamera.GoRight(timeDiff);
        }
        if (this.isKeyPressed('q')) {
            this.mainScene.flyingCamera.LeftRotate(timeDiff);
        }
        if (this.isKeyPressed('e')) {
            this.mainScene.flyingCamera.RightRotate(timeDiff);
        }
        if (this.isKeyPressed('1')) {
            this.mainScene.flyingCamera.ViewUp(timeDiff);
        }
        if (this.isKeyPressed('2')) {
            this.mainScene.flyingCamera.ViewBottom(timeDiff);
        }
        if (this.isKeyPressed('3')) {
            this.mainScene.flyingCamera.GetClose(0.1 * timeDiff);
        }
        if (this.isKeyPressed('4')) {
            this.mainScene.flyingCamera.GetClose(-0.1 * timeDiff);
        }

        this.raycastControl();

        if (this.dummyTargetSync == true) {
            let diffPos = this.dummyTargetOriginalpos.clone().sub(this.dummyTarget.position);
            for (let i = 0; i < this.selectedTargetList.length; i++) {
                let elem = this.selectedTargetList[i];
                let origPos = this.selectdTargetOrigPos[i];

                elem.position.copy(origPos.clone().sub(diffPos));
            }
        }
    }
}