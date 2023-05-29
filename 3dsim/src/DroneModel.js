import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
export class DroneModel {

    constructor(mainScene) {
        this.mainScene = mainScene;
        this.modelLoaded = false;

        this.loadDroneModel(this);
        this.nodeidx = 0;
    }

    generateDrone() {
        if (!this.modelLoaded) {
            console.log('Model not loaded');
            return;
        }
        const geometryS = new THREE.SphereGeometry(1, 8, 8);
        const materialS = new THREE.MeshStandardMaterial({
            color: 0x000000,
            // wireframe: true,
        });
        materialS.transparent = true;
        materialS.opacity = 0.0;

        const node = new THREE.Mesh(geometryS, materialS);
        node.position.set(55 + Math.random() * 15, 22 + Math.random() * 5, 26 + Math.random() * 15);
        node.onMouseDownHandler = () => {
            this.mainScene.controller.shiftHelper.retarget(node);
        }

        node.meshName = 'Drone';

        let droneModel = SkeletonUtils.clone(this.droneModel)
        // droneModel.receiveShadow = true;

        node.add(droneModel);

        let materialL = new THREE.LineBasicMaterial({ color: 0x555555 });
        const points =
            [new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, -100, 0)];
        const geometryL = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometryL, materialL);
        line.ignoreIntersect = true;
        node.add(line);

        const materialC = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        const geometryC = new THREE.CircleGeometry(1.2, 16);
        materialC.transparent = true;
        materialC.opacity = 0.0;

        node.onTargetHandler = () => {
            materialC.opacity = 1.0;
            node.matrixAutoUpdate = true;
        };
        node.outTargetHandler = () => {
            materialC.opacity = 0.0;
            node.matrixAutoUpdate = false;
            node.updateMatrix();
        };

        const itemSize = 3;
        geometryC.setAttribute('position',
            new THREE.BufferAttribute(
                geometryC.attributes.position.array.slice(itemSize,
                    geometryC.attributes.position.array.length - itemSize
                ), itemSize
            )
        );
        geometryC.index = null;
        geometryC.rotateX(Math.PI / 2);
        const circle = new THREE.LineLoop(geometryC, materialC);
        circle.position.set(0, -0.3, 0);
        circle.ignoreIntersect = true;

        node.add(circle);

		const nodeLabelDiv = document.createElement("div");
		nodeLabelDiv.className = "label";
		nodeLabelDiv.innerHTML  = "Node " + this.nodeidx++;
		const nodeLabel = new CSS2DObject(nodeLabelDiv);
		nodeLabel.position.set(0, 2, 0);

        // nodeLabel.center.set( 0, 1 );
		node.add(nodeLabel);
        nodeLabel.layers.set( 0 );

        this.mainScene.scene.add(node);
        node.matrixAutoUpdate = false;
        node.updateMatrix();

        node.isTarget = true;
        return node;
    }

    loadDroneModel(that) {
        const loader = new GLTFLoader();

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/examples/jsm/libs/draco/');
        loader.setDRACOLoader(dracoLoader);

        if (0){
            loader.load(
                './static/Drone.glb',
                function (gltf) {
    
                    gltf.scene.scale.set(2.0, 2.0, 2.0);
                    gltf.scene.traverse(function (node) {
                        if (node.isMesh) {
                            node.castShadow = true;
                            node.receiveShadow = true;
                            
                        } 
                    });
                    that.droneModel = gltf.scene.clone();
    
                    that.modelLoaded = true;
    
                },
                function (xhr) {
                    // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                },
                function (error) {
                    console.log('An error happened');
                }
            );
        } else {
            loader.load(
                './static/Drone2.glb',
                function (gltf) {
    
                    gltf.scene.scale.set(0.5, 0.5, 0.5);
                    gltf.scene.traverse(function (node) {
                        if (node.isMesh) {
                            node.castShadow = true;
                            node.receiveShadow = true;
                        } 
                    });
                    that.droneModel = gltf.scene.clone();
    
                    that.modelLoaded = true;
    
                },
                function (xhr) {
                    // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                },
                function (error) {
                    console.log('An error happened');
                }
            );
    
        }

    }
}