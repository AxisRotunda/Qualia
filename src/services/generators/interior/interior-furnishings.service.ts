
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { Geo } from '../architecture/architecture.utils';

@Injectable({
    providedIn: 'root'
})
export class InteriorFurnishingsService {

    generateSofa(): THREE.BufferGeometry | null {
        const seatW = 2.0;
        const seatD = 0.8;
        const seatH = 0.45;
        const backH = 0.5;
        const armW = 0.3;
        const totalH = 0.8;

        const fabricParts: THREE.BufferGeometry[] = [];
        const woodParts: THREE.BufferGeometry[] = [];

        fabricParts.push(
            Geo.box(seatW, 0.25, seatD).translate(0, seatH - 0.125, 0).toNonIndexed().get(),
            Geo.box(seatW, backH, 0.2).translate(0, seatH + backH / 2, -seatD / 2 + 0.1).toNonIndexed().get()
        );

        const arm = Geo.box(armW, backH * 0.8, seatD).toNonIndexed();
        fabricParts.push(
            arm.clone().translate(-seatW / 2 + armW / 2, seatH + (backH * 0.8) / 2 - 0.1, 0).get(),
            arm.clone().translate(seatW / 2 - armW / 2, seatH + (backH * 0.8) / 2 - 0.1, 0).get()
        );

        const legGeo = Geo.cylinder(0.04, 0.03, 0.2).toNonIndexed();
        const legPos = [
            [-seatW / 2 + 0.1, seatD / 2 - 0.1], [seatW / 2 - 0.1, seatD / 2 - 0.1],
            [-seatW / 2 + 0.1, -seatD / 2 + 0.1], [seatW / 2 - 0.1, -seatD / 2 + 0.1]
        ];
        legPos.forEach(p => {
            woodParts.push(legGeo.clone().translate(p[0], 0.1, p[1]).get());
        });

        const mergedFabric = BufferUtils.mergeGeometries(fabricParts);
        const mergedWood = BufferUtils.mergeGeometries(woodParts);

        let final: THREE.BufferGeometry | null = null;
        if (mergedFabric && mergedWood) {
            final = BufferUtils.mergeGeometries([mergedFabric, mergedWood], true);
        }

        if (final) final.translate(0, -totalH / 2, 0);
        return final;
    }

    generateBed(): THREE.BufferGeometry | null {
        const partsFrame: THREE.BufferGeometry[] = [];
        const partsMattress: THREE.BufferGeometry[] = [];
        const partsSoft: THREE.BufferGeometry[] = []; // Pillows/Duvet

        const width = 1.8;
        const length = 2.2;
        const height = 0.5;

        // 1. Frame (Wood/Metal)
        const frameH = 0.3;
        partsFrame.push(
            Geo.box(width, frameH, length).toNonIndexed().translate(0, frameH / 2, 0).get()
        );

        // Headboard
        const headH = 1.2;
        partsFrame.push(
            Geo.box(width, headH, 0.1).toNonIndexed().translate(0, headH / 2, -length / 2 + 0.05).get()
        );

        // 2. Mattress
        const matH = 0.25;
        partsMattress.push(
            Geo.box(width - 0.1, matH, length - 0.1).toNonIndexed().translate(0, frameH + matH / 2, 0).get()
        );

        // 3. Pillows
        const pillow = Geo.box(0.7, 0.15, 0.4).toNonIndexed();
        partsSoft.push(
            pillow.clone().rotateX(0.2).translate(-0.45, frameH + matH + 0.1, -length / 2 + 0.4).get(),
            pillow.clone().rotateX(0.2).translate(0.45, frameH + matH + 0.1, -length / 2 + 0.4).get()
        );

        // 4. Duvet (Covering bottom half)
        const duvetL = length * 0.7;
        partsSoft.push(
            Geo.box(width + 0.05, 0.05, duvetL).toNonIndexed().translate(0, frameH + matH + 0.025, length / 2 - duvetL / 2).get()
        );

        const mFrame = BufferUtils.mergeGeometries(partsFrame);
        const mMattress = BufferUtils.mergeGeometries(partsMattress);
        const mSoft = BufferUtils.mergeGeometries(partsSoft);

        if (mFrame && mMattress && mSoft) {
            // Merge order: Frame, Mattress, Softs
            const final = BufferUtils.mergeGeometries([mFrame, mMattress, mSoft], true);
            final.translate(0, -height / 2, 0); // Center pivot roughly
            return final;
        }
        return null;
    }

    generateChandelier(): THREE.BufferGeometry | null {
        const metalParts: THREE.BufferGeometry[] = [];
        const crystalParts: THREE.BufferGeometry[] = [];

        const rodLen = 4.0;
        metalParts.push(
            Geo.cylinder(0.05, 0.05, rodLen).translate(0, rodLen / 2, 0).toNonIndexed().get()
        );

        metalParts.push(
            Geo.torus(0.8, 0.04, 8, 16).rotateX(Math.PI / 2).toNonIndexed().get()
        );

        const crystalGeo = Geo.cone(0.05, 0.2, 4).rotateX(Math.PI).toNonIndexed();
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            crystalParts.push(
                crystalGeo.clone().translate(Math.cos(angle) * 0.8, -0.1, Math.sin(angle) * 0.8).get()
            );
        }

        metalParts.push(
            Geo.torus(0.4, 0.04, 8, 16).rotateX(Math.PI / 2).translate(0, -0.3, 0).toNonIndexed().get()
        );

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            crystalParts.push(
                crystalGeo.clone().translate(Math.cos(angle) * 0.4, -0.4, Math.sin(angle) * 0.4).get()
            );
        }

        const mergedMetal = BufferUtils.mergeGeometries(metalParts);
        const mergedCrystal = BufferUtils.mergeGeometries(crystalParts);

        let final: THREE.BufferGeometry | null = null;
        if (mergedMetal && mergedCrystal) {
            final = BufferUtils.mergeGeometries([mergedMetal, mergedCrystal], true);
        }

        if (final) final.translate(0, -2.25, 0);
        return final;
    }

    generateServerRack(): THREE.BufferGeometry | null {
        const w = 0.8;
        const h = 2.2;
        const d = 1.0;

        const cabinet = Geo.box(w, h, d).translate(0, h / 2, 0).toNonIndexed().get();
        const face = Geo.plane(w - 0.1, h - 0.2).translate(0, h / 2, d / 2 + 0.01).toNonIndexed().get();

        const final = BufferUtils.mergeGeometries([cabinet, face], true);
        if (final) final.translate(0, -h / 2, 0);
        return final;
    }

    generateDesk(): THREE.BufferGeometry | null {
        const w = 1.6;
        const h = 0.75;
        const d = 0.8;

        const top = Geo.box(w, 0.05, d).translate(0, h, 0).toNonIndexed().get();

        const legs: THREE.BufferGeometry[] = [];
        const legGeo = Geo.box(0.05, h, 0.05).toNonIndexed();

        [-w / 2 + 0.1, w / 2 - 0.1].forEach(x => {
            [-d / 2 + 0.1, d / 2 - 0.1].forEach(z => {
                legs.push(legGeo.clone().translate(x, h / 2, z).get());
            });
        });

        // Privacy Panel
        legs.push(
            Geo.box(w - 0.2, h / 2, 0.02).translate(0, h * 0.75, d / 2 - 0.2).toNonIndexed().get()
        );

        // Cable Grommet (Hole visual)
        const grommet = Geo.cylinder(0.04, 0.04, 0.06, 8).toNonIndexed().translate(w / 2 - 0.2, h, -d / 2 + 0.15).get();
        // Since CSG is expensive, we just add a dark cylinder sitting flush with top to simulate hole
        const parts = [top, ...legs, grommet];

        const final = BufferUtils.mergeGeometries(parts, false);
        if (final) final.translate(0, -h / 2, 0);
        return final;
    }

    generateOfficeChair(): THREE.BufferGeometry | null {
        const partsPlastic: THREE.BufferGeometry[] = [];
        const partsFabric: THREE.BufferGeometry[] = [];
        const partsMetal: THREE.BufferGeometry[] = [];

        // 1. Base (5-Star)
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            partsPlastic.push(
                Geo.box(0.05, 0.05, 0.35).toNonIndexed()
                    .translate(0, 0.05, 0.17)
                    .rotateY(angle)
                    .get()
            );
        }

        // 2. Piston
        partsMetal.push(
            Geo.cylinder(0.03, 0.03, 0.4).toNonIndexed().translate(0, 0.25, 0).get()
        );

        // 3. Seat (Ergonomic Curve approximation)
        const seat = Geo.box(0.5, 0.08, 0.5).toNonIndexed().translate(0, 0.5, 0).get();
        partsFabric.push(seat);

        // 4. Backrest
        const back = Geo.box(0.45, 0.5, 0.05).toNonIndexed();
        // Slight recline
        back.rotateX(-0.15).translate(0, 0.8, -0.2);
        partsFabric.push(back.get());

        // Spine Connector
        partsPlastic.push(
            Geo.box(0.08, 0.4, 0.05).toNonIndexed().rotateX(-0.15).translate(0, 0.65, -0.22).get()
        );

        // 5. Armrests
        const arm = Geo.box(0.05, 0.2, 0.3).toNonIndexed();
        partsPlastic.push(
            arm.clone().translate(-0.25, 0.7, 0).get(),
            arm.clone().translate(0.25, 0.7, 0).get()
        );

        const mergedPlastic = BufferUtils.mergeGeometries(partsPlastic);
        const mergedFabric = BufferUtils.mergeGeometries(partsFabric);
        const mergedMetal = BufferUtils.mergeGeometries(partsMetal);

        if (mergedPlastic && mergedFabric && mergedMetal) {
            const final = BufferUtils.mergeGeometries([mergedPlastic, mergedFabric, mergedMetal], true);
            final.translate(0, -0.5, 0); // Pivot at floor
            return final;
        }
        return null;
    }

    generateMonitorCluster(): THREE.BufferGeometry | null {
        const plasticParts: THREE.BufferGeometry[] = [];
        const screenParts: THREE.BufferGeometry[] = [];

        const cFrame = Geo.box(0.6, 0.35, 0.05).translate(0, 1.2, 0).toNonIndexed();
        plasticParts.push(cFrame.get());

        const cScreen = Geo.plane(0.55, 0.3).translate(0, 1.2, 0.03).toNonIndexed();
        screenParts.push(cScreen.get());

        const lFrame = cFrame.clone().rotateY(Math.PI / 6).translate(-0.55, 0, 0.15);
        plasticParts.push(lFrame.get());

        const lScreen = cScreen.clone().rotateY(Math.PI / 6).translate(-0.55, 0, 0.15);
        screenParts.push(lScreen.get());

        const rFrame = cFrame.clone().rotateY(-Math.PI / 6).translate(0.55, 0, 0.15);
        plasticParts.push(rFrame.get());

        const rScreen = cScreen.clone().rotateY(-Math.PI / 6).translate(0.55, 0, 0.15);
        screenParts.push(rScreen.get());

        plasticParts.push(
            Geo.cylinder(0.05, 0.05, 0.5).translate(0, 0.95, 0).toNonIndexed().get(),
            Geo.cylinder(0.15, 0.15, 0.02).translate(0, 0.75, 0).toNonIndexed().get()
        );

        const final = BufferUtils.mergeGeometries([BufferUtils.mergeGeometries(plasticParts), BufferUtils.mergeGeometries(screenParts)], true);

        if (final) final.translate(0, -1.2, 0);
        return final;
    }

    generateFileCabinet(): THREE.BufferGeometry | null {
        const w = 0.5;
        const h = 1.4;
        const d = 0.6;

        const body = Geo.box(w, h, d).translate(0, h / 2, 0).toNonIndexed().get();

        const handles: THREE.BufferGeometry[] = [];
        const handleGeo = Geo.box(0.15, 0.02, 0.04).toNonIndexed();
        const lineGeo = Geo.box(w - 0.05, 0.01, 0.01).toNonIndexed();

        for (let i = 0; i < 4; i++) {
            const y = (h / 4) * i + (h / 8);
            handles.push(handleGeo.clone().translate(0, y, d / 2 + 0.02).get());

            handles.push(lineGeo.clone().translate(0, (h / 4) * (i + 1), d / 2).get());
        }

        const final = BufferUtils.mergeGeometries([body, BufferUtils.mergeGeometries(handles)], true);
        if (final) final.translate(0, -h / 2, 0);
        return final;
    }

    generateMapTable(): THREE.BufferGeometry | null {
        const w = 3.0;
        const h = 0.9;
        const d = 2.0;

        const body = Geo.box(w, h, d).translate(0, h / 2, 0).toNonIndexed().get();
        const screen = Geo.box(w - 0.2, 0.05, d - 0.2).translate(0, h + 0.01, 0).toNonIndexed().get();

        const final = BufferUtils.mergeGeometries([body, screen], true);
        if (final) final.translate(0, -h / 2, 0);
        return final;
    }

    generateCeilingLight(): THREE.BufferGeometry | null {
        const w = 2.0;
        const d = 0.4;
        const h = 0.1;

        const frame = Geo.box(w, h, d).toNonIndexed().get();
        const light = Geo.box(w - 0.1, 0.05, d - 0.1).translate(0, -0.05, 0).toNonIndexed().get();

        return BufferUtils.mergeGeometries([frame, light], true);
    }
}
