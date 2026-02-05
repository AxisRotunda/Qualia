import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { Geo } from './architecture.utils';

@Injectable({
    providedIn: 'root'
})
export class ArchIndustrialService {

    generateRigLeg(height: number, radius: number): THREE.BufferGeometry | null {
        const parts: THREE.BufferGeometry[] = [];
        parts.push(Geo.cylinder(radius, radius, height, 16).mapCylinder(radius, height, 0.4).toNonIndexed().translate(0, height / 2, 0).get());
        const flangeCount = Math.floor(height / 5);
        const flangeGeo = Geo.cylinder(radius * 1.15, radius * 1.15, 0.4, 16).toNonIndexed();
        for (let i = 1; i < flangeCount; i++) parts.push(flangeGeo.clone().translate(0, i * 5, 0).get());
        parts.push(Geo.box(radius * 2.5, 1, radius * 2.5).mapBox(radius * 2.5, 1, radius * 2.5).toNonIndexed().translate(0, 0.5, 0).get());

        const merged = BufferUtils.mergeGeometries(parts, true);
        if (merged) new Geo(merged).gradientY(0x664433, 0xffffff, 0, height * 0.3).ensureTangents();
        return merged;
    }

    generateIndustrialCrate(size: number): THREE.BufferGeometry | null {
        const partsFrame: THREE.BufferGeometry[] = [], partsPanel: THREE.BufferGeometry[] = [];
        const s = size, ft = s * 0.1;
        const edgeV = Geo.box(ft, s, ft).toNonIndexed();
        const edgeH = Geo.box(s - ft * 2, ft, ft).toNonIndexed();
        const edgeD = Geo.box(ft, ft, s - ft * 2).toNonIndexed();
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => partsFrame.push(edgeV.clone().translate(x * (s / 2 - ft / 2), 0, z * (s / 2 - ft / 2)).get()));
        [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([y, z]) => partsFrame.push(edgeH.clone().translate(0, y * (s / 2 - ft / 2), z * (s / 2 - ft / 2)).get()));
        [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([x, y]) => partsFrame.push(edgeD.clone().translate(x * (s / 2 - ft / 2), y * (s / 2 - ft / 2), 0).get()));
        partsPanel.push(Geo.box(s - ft * 0.8, s - ft * 0.8, s - ft * 0.8).mapBox(s - ft * 0.8, s - ft * 0.8, s - ft * 0.8).toNonIndexed().get());

        const frame = BufferUtils.mergeGeometries(partsFrame);
        const body = BufferUtils.mergeGeometries(partsPanel);
        if (frame) new Geo(frame).gradientY(0x888888, 0xffffff, -s / 2, s / 2).ensureTangents();
        if (body) new Geo(body).gradientY(0x666666, 0xaaaaaa, -s / 2, s / 2).ensureTangents();

        const combined = [frame, body];
        const hasColor = combined.some(p => p.getAttribute('color'));
        combined.forEach(p => { if (hasColor) new Geo(p).ensureColor(); });

        const final = BufferUtils.mergeGeometries(combined, true);
        final.translate(0, s / 2, 0);
        return final;
    }

    generateIndustrialBarrel(radius: number, height: number): THREE.BufferGeometry | null {
        const partsBody: THREE.BufferGeometry[] = [], partsRibs: THREE.BufferGeometry[] = [];
        partsBody.push(Geo.cylinder(radius, radius, height, 16).mapCylinder(radius, height).toNonIndexed().get());
        const ribGeo = Geo.torus(radius, radius * 0.05, 8, 16).rotateX(Math.PI / 2).toNonIndexed();
        partsRibs.push(ribGeo.clone().translate(0, height * 0.33 - height / 2, 0).get(), ribGeo.clone().translate(0, height * 0.66 - height / 2, 0).get());

        const body = BufferUtils.mergeGeometries(partsBody);
        const ribs = BufferUtils.mergeGeometries(partsRibs);
        if (body) new Geo(body).gradientY(0x999999, 0xffffff, -height / 2, height / 2).ensureTangents();
        if (ribs) new Geo(ribs).ensureTangents();

        const combined = [body, ribs];
        const hasColor = combined.some(p => p.getAttribute('color'));
        combined.forEach(p => { if (hasColor) new Geo(p).ensureColor(); });

        const final = BufferUtils.mergeGeometries(combined, true);
        final.translate(0, height / 2, 0);
        return final;
    }

    generateShippingContainer(length: number, width: number, height: number): THREE.BufferGeometry | null {
        const partsFrame: THREE.BufferGeometry[] = [], partsBody: THREE.BufferGeometry[] = [];
        const corner = Geo.box(0.3, 0.3, 0.3).toNonIndexed();
        [[-1, -1, -1], [1, -1, -1], [-1, 1, -1], [1, 1, -1], [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1]].forEach(([x, y, z]) => partsFrame.push(corner.clone().translate(x * (width / 2 - 0.15), y * (height / 2 - 0.15), z * (length / 2 - 0.15)).get()));
        partsBody.push(Geo.box(width - 0.2, height - 0.2, length - 0.2).toNonIndexed().get());

        const frame = BufferUtils.mergeGeometries(partsFrame);
        const body = BufferUtils.mergeGeometries(partsBody);
        if (body) new Geo(body).gradientY(0xaaaaaa, 0xffffff, -height / 2, height / 2).ensureTangents();
        if (frame) new Geo(frame).ensureTangents();

        const combined = [body, frame];
        const hasColor = combined.some(p => p.getAttribute('color'));
        combined.forEach(p => { if (hasColor) new Geo(p).ensureColor(); });

        const final = BufferUtils.mergeGeometries(combined, true);
        final.translate(0, height / 2, 0);
        return final;
    }

    generateIndustrialStairs(width: number, height: number, depth: number, steps: number): THREE.BufferGeometry | null {
        const stepH = height / steps, stepD = depth / steps, parts: THREE.BufferGeometry[] = [];
        const st = 0.05, sw = 0.2, angle = Math.atan2(height, depth);
        const sGeo = BufferUtils.mergeGeometries([Geo.box(st, 0.3, Math.sqrt(height ** 2 + depth ** 2) + 0.4).toNonIndexed().get(), Geo.box(sw, st, Math.sqrt(height ** 2 + depth ** 2) + 0.4).toNonIndexed().translate(sw / 2, 0.15, 0).get(), Geo.box(sw, st, Math.sqrt(height ** 2 + depth ** 2) + 0.4).toNonIndexed().translate(sw / 2, -0.15, 0).get()]);
        sGeo.rotateX(angle);
        parts.push(sGeo.clone().translate(-width / 2, height / 2 - stepH, -depth / 2), sGeo.clone().translate(width / 2, height / 2 - stepH, -depth / 2));
        const tread = Geo.box(width - 0.1, 0.04, stepD - 0.02).toNonIndexed();
        for (let i = 0; i < steps; i++) parts.push(tread.clone().translate(0, (i * stepH) + (stepH * 0.5), -(i * stepD) - stepD / 2).get());
        const final = BufferUtils.mergeGeometries(parts);
        if (final) final.translate(0, 0, depth / 2);
        return final;
    }

    generateIndustrialRailing(length: number): THREE.BufferGeometry | null {
        const h = 1.1, parts: THREE.BufferGeometry[] = [];
        parts.push(Geo.cylinder(0.05, 0.05, length).rotateZ(Math.PI / 2).translate(0, h, 0).toNonIndexed().get(), Geo.box(length, 0.15, 0.02).translate(0, 0.075, 0).toNonIndexed().get());
        const count = Math.ceil(length / 1.5), post = Geo.cylinder(0.04, 0.04, h).toNonIndexed();
        for (let i = 0; i <= count; i++) parts.push(post.clone().translate(-length / 2 + (i * (length / count)), h / 2, 0).get());
        return BufferUtils.mergeGeometries(parts);
    }
}
