import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Geo } from './architecture.utils';

interface GeometryGroups {
    frame: THREE.BufferGeometry[];
    window: THREE.BufferGeometry[];
    detail: THREE.BufferGeometry[];
}

export interface BuildingOptions {
    highwayAccess?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ArchBuildingService {

    generateBuilding(w: number, totalH: number, d: number, tiers: number, options: BuildingOptions = {}): THREE.BufferGeometry | null {
        const groups: GeometryGroups = { frame: [], window: [], detail: [] };

        let currentY = 0;
        let currentW = w;
        let currentD = d;

        const groundHeight = options.highwayAccess ? 12.0 : 5.0;
        const bodyHeight = Math.max(totalH - groundHeight, 5);
        const tierHeight = bodyHeight / tiers;

        const foundationH = 4.0;
        groups.frame.push(
            Geo.box(currentW, foundationH, currentD).mapBox(currentW, foundationH, currentD).translate(0, -foundationH / 2, 0).get()
        );

        this.generateLobby(currentW, groundHeight, currentD, groups, tiers, options.highwayAccess);
        currentY += groundHeight;

        for (let t = 0; t < tiers; t++) {
            this.generateTier(currentW, tierHeight, currentD, currentY, groups);
            currentY += tierHeight;
            if (t < tiers - 1) {
                this.generateCornice(currentW, currentD, currentY, groups);
                const taper = (currentW > 10) ? 0.85 : 0.9;
                currentW *= taper;
                currentD *= taper;
            }
        }

        this.generateRoof(currentW, currentD, currentY, groups);

        // RUN_REPAIR: Strict Attribute Synchronization
        const merge = (geos: THREE.BufferGeometry[]) => {
            const filtered = geos.filter(g => g && g.getAttribute('position')?.count > 0);
            return filtered.length ? BufferGeometryUtils.mergeGeometries(filtered) : new THREE.BoxGeometry(0, 0, 0);
        };

        const frameGeo = merge(groups.frame);
        const windowGeo = merge(groups.window);
        const detailGeo = merge(groups.detail);

        // Apply Grime to frame (Adds 'color' attribute)
        if (frameGeo.getAttribute('position')?.count > 0) {
            new Geo(frameGeo).gradientY(0x555555, 0xffffff, -5, totalH * 0.5);
        }

        // CONTRACT ENFORCEMENT: All groups in a multi-material merge MUST have identical attributes.
        // If frame has colors, windows and details must have colors.
        const parts = [frameGeo, windowGeo, detailGeo];
        const hasColor = parts.some(p => p.getAttribute('color'));
        const hasTangents = parts.some(p => p.getAttribute('tangent'));

        parts.forEach(p => {
            const g = new Geo(p);
            if (hasColor) g.ensureColor();
            if (hasTangents) g.ensureTangents();
        });

        const final = BufferGeometryUtils.mergeGeometries(parts);
        final.translate(0, -totalH / 2, 0);
        return final;
    }

    private generateLobby(w: number, h: number, d: number, groups: GeometryGroups, totalTiers: number, isHighway = false) {
        const colSize = 1.2;
        const glassInset = 0.5;
        const isTall = totalTiers >= 4;
        const colBottomScale = isTall ? 1.5 : 1.0;

        const corners = [[w / 2 - colSize / 2, d / 2 - colSize / 2], [-w / 2 + colSize / 2, d / 2 - colSize / 2], [w / 2 - colSize / 2, -d / 2 + colSize / 2], [-w / 2 + colSize / 2, -d / 2 + colSize / 2]];
        corners.forEach(([cx, cz]) => {
            if (isTall) {
                groups.frame.push(Geo.cylinder(colSize / Math.sqrt(2), (colSize * colBottomScale) / Math.sqrt(2), h, 4).rotateY(Math.PI / 4).translate(cx, h / 2, cz).get());
            } else {
                groups.frame.push(Geo.box(colSize, h, colSize).mapBox(colSize, h, colSize).translate(cx, h / 2, cz).get());
            }
        });

        groups.window.push(Geo.box(w - glassInset * 2, h, d - glassInset * 2).mapBox(w - glassInset * 2, h, d - glassInset * 2, 0.2).translate(0, h / 2, 0).get());

        if (!isHighway) {
            groups.detail.push(
                Geo.box(4.8, 0.4, 0.6).translate(0, 3.7, d / 2 + 0.1).get(),
                Geo.box(0.4, 3.5, 0.6).translate(-2.2, 1.75, d / 2 + 0.1).get(),
                Geo.box(0.4, 3.5, 0.6).translate(2.2, 1.75, d / 2 + 0.1).get()
            );
        }
    }

    private generateTier(w: number, h: number, d: number, y: number, groups: GeometryGroups) {
        groups.window.push(Geo.box(w - 0.2, h, d - 0.2).mapBox(w, h, d, 0.5).translate(0, y + h / 2, 0).get());
        const ribX = Math.max(2, Math.floor(w / 4)), ribZ = Math.max(2, Math.floor(d / 4));
        const addRibs = (axis: 'x'|'z', size: number, depth: number) => {
            const count = axis === 'x' ? ribX : ribZ;
            const step = size / count;
            const template = axis === 'x' ? Geo.box(0.35, h, 0.5) : Geo.box(0.5, h, 0.35);
            for (let i = 0; i <= count; i++) {
                const p = -size / 2 + (i * step);
                if (axis === 'x') {
                    groups.frame.push(template.clone().translate(p, y + h / 2, depth / 2).get());
                    groups.frame.push(template.clone().translate(p, y + h / 2, -depth / 2).get());
                } else {
                    groups.frame.push(template.clone().translate(depth / 2, y + h / 2, p).get());
                    groups.frame.push(template.clone().translate(-depth / 2, y + h / 2, p).get());
                }
            }
        };
        addRibs('x', w, d); addRibs('z', d, w);
        groups.detail.push(Geo.box(w + 0.1, 0.4, d + 0.1).mapBox(w, 0.4, d).translate(0, y, 0).get());
        groups.detail.push(Geo.box(w + 0.1, 0.4, d + 0.1).mapBox(w, 0.4, d).translate(0, y + h, 0).get());
    }

    private generateCornice(w: number, d: number, y: number, groups: GeometryGroups) {
        groups.frame.push(Geo.box(w + 0.3, 0.8, d + 0.3).mapBox(w, 0.8, d).translate(0, y, 0).get());
    }

    private generateRoof(w: number, d: number, y: number, groups: GeometryGroups) {
        const pSideX = Geo.box(0.3, 1.2, d).mapBox(0.3, 1.2, d);
        const pSideZ = Geo.box(w, 1.2, 0.3).mapBox(w, 1.2, 0.3);
        groups.frame.push(pSideX.clone().translate(w / 2 - 0.15, y + 0.6, 0).get(), pSideX.clone().translate(-w / 2 + 0.15, y + 0.6, 0).get(), pSideZ.clone().translate(0, y + 0.6, d / 2 - 0.15).get(), pSideZ.clone().translate(0, y + 0.6, -d / 2 + 0.15).get());
        groups.detail.push(Geo.box(w * 0.6, 3, d * 0.6).mapBox(w * 0.6, 3, d * 0.6).translate(0, y + 1.5, 0).get());
        groups.detail.push(Geo.cylinder(0.1, 0.2, 6, 6).translate(0, y + 6, 0).get());
    }
}
