
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { Geo } from './geo-builder';

@Injectable({
    providedIn: 'root'
})
export class SelectionVisualsFactory {

    createSelectionVisuals(target: THREE.Mesh): THREE.Group {
        const group = new THREE.Group();
        group.name = 'Selection_UI';

        let box: THREE.Box3;
        if (target.geometry) {
            if (!target.geometry.boundingBox) target.geometry.computeBoundingBox();
            box = target.geometry.boundingBox!.clone();
        } else {
            box = new THREE.Box3(new THREE.Vector3(-0.5, 0, -0.5), new THREE.Vector3(0.5, 1, 0.5));
        }

        box.expandByScalar(0.08);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // 1. Sleek AR Brackets
        const bracketGeo = this.createBracketGeometry(box);
        const bracketMat = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8,
            depthTest: false
        });
        const brackets = new THREE.LineSegments(bracketGeo, bracketMat);
        brackets.onBeforeRender = () => {
        // Subtle "Acquisition" pulse
            const s = 1.0 + Math.sin(performance.now() * 0.01) * 0.02;
            brackets.scale.set(s, s, s);
        };
        group.add(brackets);

        // 2. Animated Pulse Fill
        const boxGeo = Geo.box(size.x, size.y, size.z).get();
        const fillMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.03,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });
        const fill = new THREE.Mesh(boxGeo, fillMat);
        fill.position.copy(center);
        group.add(fill);

        // 3. Technical Corner Dots
        const dotGeo = this.createCornerDots(box);
        const dotMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.12,
            transparent: true,
            opacity: 0.9,
            depthTest: false
        });
        const dots = new THREE.Points(dotGeo, dotMat);
        group.add(dots);

        // 4. Volumetric Scale Marker (Ground Grid)
        const gridGeo = new THREE.PlaneGeometry(size.x, size.z, 2, 2);
        const gridMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            wireframe: true,
            transparent: true,
            opacity: 0.2,
            depthTest: false
        });
        const grid = new THREE.Mesh(gridGeo, gridMat);
        grid.rotation.x = -Math.PI / 2;
        grid.position.set(center.x, box.min.y, center.z);
        group.add(grid);

        return group;
    }

    private createBracketGeometry(box: THREE.Box3): THREE.BufferGeometry {
        const min = box.min;
        const max = box.max;
        const points: number[] = [];

        const dims = new THREE.Vector3().subVectors(max, min);
        const len = Math.min(Math.min(dims.x, dims.y), dims.z) * 0.25;

        const addL = (x: number, y: number, z: number, dx: number, dy: number, dz: number) => {
            points.push(x, y, z, x + dx * len, y, z);
            points.push(x, y, z, x, y + dy * len, z);
            points.push(x, y, z, x, y, z + dz * len);
        };

        // 8 Corners
        addL(min.x, min.y, min.z, 1, 1, 1);
        addL(max.x, min.y, min.z, -1, 1, 1);
        addL(min.x, max.y, min.z, 1, -1, 1);
        addL(max.x, max.y, min.z, -1, -1, 1);
        addL(min.x, min.y, max.z, 1, 1, -1);
        addL(max.x, min.y, max.z, -1, 1, -1);
        addL(min.x, max.y, max.z, 1, -1, -1);
        addL(max.x, max.y, max.z, -1, -1, -1);

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
        return geo;
    }

    private createCornerDots(box: THREE.Box3): THREE.BufferGeometry {
        const min = box.min;
        const max = box.max;
        const points = [
            min.x, min.y, min.z, max.x, min.y, min.z, min.x, max.y, min.z, max.x, max.y, min.z,
            min.x, min.y, max.z, max.x, min.y, max.z, min.x, max.y, max.z, max.x, max.y, max.z
        ];
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
        return geo;
    }

    dispose(group: THREE.Group) {
        group.traverse((child) => {
            if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments || child instanceof THREE.Points) {
                child.geometry.dispose();
                if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                else child.material.dispose();
            }
        });
    }
}
