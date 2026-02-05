
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { Geo } from '../architecture/architecture.utils';

@Injectable({
    providedIn: 'root'
})
export class WeaponDesignService {

    generateBlaster(): THREE.BufferGeometry | null {
        // Main Body
        const body = Geo.box(0.15, 0.25, 0.6).mapBox(0.15, 0.25, 0.6).toNonIndexed().translate(0, 0, 0.1).get();

        // Barrel
        const barrel = Geo.cylinder(0.04, 0.04, 0.4, 8).mapCylinder(0.04, 0.4).toNonIndexed()
            .rotateX(Math.PI / 2).translate(0, 0.05, -0.3).get();

        // Grip
        const grip = Geo.box(0.1, 0.3, 0.15).mapBox(0.1, 0.3, 0.15).toNonIndexed()
            .rotateX(Math.PI / 6).translate(0, -0.2, 0.2).get();

        // Power Cell (Glow)
        const cell = Geo.cylinder(0.05, 0.05, 0.2, 8).toNonIndexed()
            .rotateX(Math.PI / 2).translate(0, 0.05, 0.1).get();

        return BufferUtils.mergeGeometries([body, barrel, grip, cell], true);
    }

    generateHammer(): THREE.BufferGeometry | null {
        // Handle
        const handle = Geo.cylinder(0.04, 0.04, 1.2, 8).mapCylinder(0.04, 1.2).toNonIndexed()
            .translate(0, 0.4, 0).get();

        // Head
        const head = Geo.box(0.2, 0.3, 0.5).mapBox(0.2, 0.3, 0.5).toNonIndexed()
            .translate(0, 1.0, 0).get();

        // Impact Face
        const faceF = Geo.cylinder(0.12, 0.15, 0.1, 8).toNonIndexed()
            .rotateX(Math.PI / 2).translate(0, 1.0, 0.25).get();

        const faceB = Geo.cone(0.1, 0.2).toNonIndexed()
            .rotateX(-Math.PI / 2).translate(0, 1.0, -0.3).get();

        return BufferUtils.mergeGeometries([handle, head, faceF, faceB], true);
    }

    generateFist(): THREE.BufferGeometry | null {
        const partsMain: THREE.BufferGeometry[] = [];
        const partsGlow: THREE.BufferGeometry[] = [];

        // 1. Forearm (Cylinder)
        const forearm = Geo.cylinder(0.12, 0.1, 0.6, 8)
            .mapCylinder(0.12, 0.6)
            .toNonIndexed()
            .rotateX(Math.PI / 2)
            .translate(0, 0, 0.3)
            .get();
        partsMain.push(forearm);

        // 2. Fist (Heavy Block)
        const fist = Geo.dodecahedron(0.2, 0)
            .toNonIndexed()
            .scale(1.0, 0.8, 1.2)
            .translate(0, 0, -0.1)
            .get();
        partsMain.push(fist);

        // 3. Knuckles (Emissive)
        const knuckle = Geo.cylinder(0.03, 0.03, 0.3, 6).toNonIndexed().rotateZ(Math.PI / 2);
        partsGlow.push(knuckle.clone().translate(0, 0.1, -0.2).get());
        partsGlow.push(knuckle.clone().translate(0, -0.1, -0.2).get());

        // 4. Piston Mechanism
        const piston = Geo.cylinder(0.06, 0.06, 0.4, 8)
            .toNonIndexed()
            .rotateX(Math.PI / 2)
            .translate(0, 0.15, 0.3)
            .get();
        partsMain.push(piston);

        const mergedMain = BufferUtils.mergeGeometries(partsMain);
        const mergedGlow = BufferUtils.mergeGeometries(partsGlow);

        if (mergedMain && mergedGlow) {
            return BufferUtils.mergeGeometries([mergedMain, mergedGlow], true);
        }
        return null;
    }

    generatePistol(): THREE.BufferGeometry | null {
        const partsPolymer: THREE.BufferGeometry[] = [];
        const partsSlide: THREE.BufferGeometry[] = [];
        const partsMetal: THREE.BufferGeometry[] = [];

        // 1. Frame (Polymer Grip)
        const grip = Geo.box(0.05, 0.25, 0.12).mapBox(0.05, 0.25, 0.12).toNonIndexed();
        grip.rotateX(0.15).translate(0, -0.12, 0.15); // Angled grip
        partsPolymer.push(grip.get());

        const guard = Geo.box(0.02, 0.02, 0.15).toNonIndexed();
        partsPolymer.push(
            guard.clone().rotateX(Math.PI / 4).translate(0, -0.1, 0).get(), // Guard curve
            Geo.box(0.02, 0.1, 0.02).toNonIndexed().translate(0, -0.05, -0.05).get() // Trigger
        );

        // 2. Slide (Matte Metal)
        const slide = Geo.box(0.06, 0.08, 0.4).mapBox(0.06, 0.08, 0.4).toNonIndexed().translate(0, 0.04, 0);
        partsSlide.push(slide.get());

        // Sights
        partsSlide.push(
            Geo.box(0.01, 0.02, 0.01).toNonIndexed().translate(0, 0.09, 0.19).get(), // Rear
            Geo.box(0.005, 0.015, 0.01).toNonIndexed().translate(0, 0.09, -0.19).get() // Front
        );

        // 3. Barrel (Exposed Metal)
        const barrel = Geo.cylinder(0.015, 0.015, 0.4, 8).toNonIndexed().rotateX(Math.PI / 2).translate(0, 0.04, 0);
        partsMetal.push(barrel.get());

        // 4. Ejection Port
        const port = Geo.box(0.04, 0.01, 0.08).toNonIndexed().translate(0.015, 0.08, 0.05);
        partsMetal.push(port.get());

        const merge = (arr: any[]) => arr.length ? BufferUtils.mergeGeometries(arr) : new THREE.BoxGeometry(0, 0, 0);

        return BufferUtils.mergeGeometries([
            merge(partsPolymer), // 0: Frame
            merge(partsSlide),   // 1: Slide
            merge(partsMetal)    // 2: Barrel/Mech
        ], true);
    }
}
