import * as THREE from 'three';

export class Terrain {
    heights = [];
    terrainMeshs = [];
    mapsize = 100;

    constructor(scene) {
        this.scene = scene;
        this.initHeights(10);
        this.flatifyHeights();
        this.drawTerrainFromHeights();
    }

    drawSquare(v) {
        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            v[0], v[1], v[2],
            v[3], v[4], v[5],
            v[6], v[7], v[8],

            v[6], v[7], v[8],
            v[9], v[10], v[11],
            v[0], v[1], v[2]
        ]);

        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.computeVertexNormals(); /* For shadows */

        const count = geometry.attributes.position.count;
        geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));

        const color = new THREE.Color();
        const positions = geometry.attributes.position;
        const colors = geometry.attributes.color;

        for (let i = 0; i < count; i++) {
            let posY = positions.getY(i);
            if (posY > 16.0) {
                color.setRGB(1.0 / 2.0, (posY / 20.0), (posY / 20.0));
                colors.setXYZ(i, color.r, color.g, color.b);
            } else {
                color.setRGB(1.0 / 2.0, (posY / 20.0) * 0.5, (posY / 20.0) * 0.1);
                colors.setXYZ(i, color.r, color.g, color.b);
            }
        }
        let material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            vertexColors: true
        });

        const mesh = new THREE.Mesh(geometry, material);

        mesh.receiveShadow = true;
        mesh.castShadow = false;
        mesh.meshName = 'floor';
        this.scene.add(mesh);
        this.terrainMeshs.push(mesh);
        mesh.matrixAutoUpdate = false;
        return mesh;
    }

    drawTerrainFromHeights() {
        const RANDER_BOTH_SIDE = 0;
        const RANDER_DIAGONAL_LINE = 0;
        const DRAW_LINE = 0;

        this.disposeTerrain();
        for (let i = 0; i < this.mapsize - 1; i++) {
            for (let j = 0; j < this.mapsize - 1; j++) {
                let v = [
                    i, this.heights[i][j + 1], j + 1,
                    i + 1, this.heights[i + 1][j + 1], j + 1,
                    i + 1, this.heights[i + 1][j], j,
                    i, this.heights[i][j], j,
                ];
                const mesh = this.drawSquare(v);
                mesh.terrainX = i;
                mesh.terrainY = j;
                mesh.isTerrain = true;
                if (RANDER_BOTH_SIDE) {
                    v = [
                        i, this.heights[i][j], j,
                        i + 1, this.heights[i + 1][j], j,
                        i + 1, this.heights[i + 1][j + 1], j + 1,
                        i, this.heights[i][j + 1], j + 1,
                    ];
                    const mesh = this.drawSquare(v);
                    mesh.terrainX = i;
                    mesh.terrainY = j;
                    mesh.isTerrain = true;
                }

                if (RANDER_DIAGONAL_LINE && DRAW_LINE) {
                    const material = new THREE.LineBasicMaterial({ color: 0xaaaaaa });

                    const points = [];
                    points.push(new THREE.Vector3(i, this.heights[i][j + 1] + 0.02, j + 1));
                    points.push(new THREE.Vector3(i + 1, this.heights[i + 1][j] + 0.02, j));

                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(geometry, material);
                    this.scene.add(line);
                    this.terrainMeshs.push(line);
                }
            }
        }

        if (DRAW_LINE) {
            const material = new THREE.LineBasicMaterial({ color: 0xaaaaaa });

            for (let i = 0; i < this.mapsize; i++) {
                const points = [];
                for (let j = 0; j < this.mapsize; j++) {
                    points.push(new THREE.Vector3(i, this.heights[i][j] + 0.02, j));
                }
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(geometry, material);
                this.scene.add(line);
                this.terrainMeshs.push(line);
            }

            for (let j = 0; j < this.mapsize; j++) {
                const points = [];
                for (let i = 0; i < this.mapsize; i++) {
                    points.push(new THREE.Vector3(i, this.heights[i][j] + 0.02, j));
                }
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(geometry, material);
                this.scene.add(line);
                this.terrainMeshs.push(line);
            }
        }
    }

    initHeights(bumpyness) {
        for (let i = 0; i < this.mapsize + 1; i++) {
            let xarr = [];
            for (let j = 0; j < this.mapsize + 1; j++) {
                xarr[j] = Math.random() * bumpyness + 10;
            }
            this.heights[i] = xarr;
        }
    }

    flatifyHeights() {
        for (let i = 1; i < this.mapsize; i++) {
            for (let j = 1; j < this.mapsize; j++) {
                this.heights[i][j] = (this.heights[i - 1][j - 1] + this.heights[i - 1][j] + this.heights[i][j - 1] + this.heights[i][j]) / 4;
            }
        }

        for (let i = 1; i < this.mapsize; i++) {
            for (let j = 1; j < this.mapsize; j++) {
                this.heights[i][j] = (this.heights[i - 1][j - 1] + this.heights[i - 1][j] + this.heights[i][j - 1] + this.heights[i][j]) / 4;
            }
        }
    }

    sigmoid(z) {
        return 1 / (1 + Math.exp(-z));
    }

    raiseHeightPoint(xPos, yPos, intensity) {
        let range = 10;
        for (let i = xPos - range; i < xPos + range; i++) {
            for (let j = yPos - range; j < yPos + range; j++) {
                if (i > -1 && i < this.mapsize &&
                    j > -1 && j < this.mapsize) {

                    let xdiff = Math.abs(xPos - i);
                    let ydiff = Math.abs(yPos - j);

                    let diff = Math.sqrt(xdiff * xdiff + ydiff * ydiff);

                    this.heights[i][j] += intensity * (this.sigmoid(diff * -1 + 3)) * 2;
                }
            }
        }

        this.drawTerrainFromHeights();
    }

    disposeTerrain() {
        for (let i = 0; i < this.terrainMeshs.length; i++) {
            let mesh = this.terrainMeshs[i];

            mesh.removeFromParent();
            mesh.material.dispose();
            mesh.geometry.dispose();
        }
        this.terrainMeshs = [];
    }
}