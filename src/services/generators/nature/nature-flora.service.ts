import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Geo } from '../architecture/architecture.utils';
import { LSystem } from '../../../engine/utils/lsystem.utils';

// --- Type Definitions ---

export interface StochasticOption {
    weight: number;
    result: string;
}

export type LRule = string | StochasticOption[];

// --- DNA Definitions ---

interface LSystemDNA {
    id: string;
    type: 'deciduous';
    axiom: string;
    rules: Record<string, LRule>;
    params: {
        angleYaw: number;
        anglePitch: number;
        angleRoll: number;
        lenBase: number;
        radiusBase: number;
        radiusDecay: number;
        rootFlareH: number;
        rootFlareR: number;
    };
    foliage: {
        clusterSize: number;
        leafScale: number;
        leafSpread: number;
    };
}

interface ConiferDNA {
    id: string;
    type: 'conifer';
    heightBase: number;
    heightVar: number;
    trunkRadius: number;
    tiers: number;
    needleDensity: number;
}

interface PalmDNA {
    id: string;
    type: 'palm';
    heightBase: number;
    segmentCount: number;
    frondCount: number;
    leanCurve: THREE.Vector3[];
}

// --- Species Registry ---

const OAK_DNA: LSystemDNA = {
    id: 'oak_standard',
    type: 'deciduous',
    axiom: 'F',
    rules: {
        'F': [
            { weight: 0.60, result: 'FF+[&F-F-F]-[-F+F+F]' },
            { weight: 0.20, result: 'F[&F] / F' },
            { weight: 0.20, result: 'FF[\\F] * F' }
        ],
        'X': 'F-[[X]+X]+F[+FX]-X'
    },
    params: {
        angleYaw: 35 * THREE.MathUtils.DEG2RAD,
        anglePitch: 38 * THREE.MathUtils.DEG2RAD,
        angleRoll: 45 * THREE.MathUtils.DEG2RAD,
        lenBase: 1.4,
        radiusBase: 0.8,
        radiusDecay: 0.82,
        rootFlareH: 1.2,
        rootFlareR: 0.8
    },
    foliage: {
        clusterSize: 3,
        leafScale: 0.8,
        leafSpread: 1.5
    }
};

const PINE_DNA: ConiferDNA = {
    id: 'pine_standard',
    type: 'conifer',
    heightBase: 5,
    heightVar: 3,
    trunkRadius: 0.35,
    tiers: 8,
    needleDensity: 12
};

const PALM_DNA: PalmDNA = {
    id: 'palm_standard',
    type: 'palm',
    heightBase: 6,
    segmentCount: 6,
    frondCount: 10,
    leanCurve: [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.5, 0.3, 0),
        new THREE.Vector3(1.5, 0.7, 0),
        new THREE.Vector3(2.5, 1.0, 0)
    ]
};

@Injectable({
    providedIn: 'root'
})
export class NatureFloraService {

    // Deterministic RNG Factory
    private mkRng(seed: number) {
        let s = seed;
        return () => {
            s = (Math.imul(s, 0x41C64E6D) + 12345) & 0x7FFFFFFF;
            return (s >>> 0) / 2147483648.0; // 0..1
        };
    }

    // --- Public API ---

    generateTree(complexity: number = 1.0, seed: number = 12345): THREE.BufferGeometry | null {
        // Clone and Mutate DNA based on complexity
        const dna = { ...OAK_DNA };
        dna.params.radiusBase = 0.8 + (complexity * 0.4);
        return this.generateLSystemTree(dna, complexity, seed);
    }

    generatePineTree(complexity: number = 1.0, seed: number = 54321): THREE.BufferGeometry | null {
        const dna = { ...PINE_DNA };
        dna.tiers = Math.max(4, Math.floor(dna.tiers * complexity));
        return this.generateConifer(dna, complexity, seed);
    }

    generatePalmTree(complexity: number = 1.0, seed: number = 98765): THREE.BufferGeometry | null {
        const dna = { ...PALM_DNA };
        dna.segmentCount = Math.max(3, Math.floor(dna.segmentCount * complexity));
        dna.frondCount = Math.max(5, Math.floor(dna.frondCount * complexity));
        return this.generatePalm(dna, seed);
    }

    generateFern(complexity: number = 1.0, seed: number = 8888): THREE.BufferGeometry | null {
        return this.generateFernCluster(complexity, seed);
    }

    generateBurntTree(seed: number = 666): THREE.BufferGeometry | null {
        const nextRnd = this.mkRng(seed);
        const parts: THREE.BufferGeometry[] = [];
        const height = 4 + nextRnd() * 3;
        const radius = 0.3;

        // Snapped main trunk (broken top)
        const trunk = Geo.cylinder(radius * 0.5, radius, height, 7)
            .mapVertices((v) => {
                if (v.y > height * 0.9) {
                    // Jagged broken top
                    v.y += (nextRnd() - 0.5) * 0.5;
                    v.x += (nextRnd() - 0.5) * 0.2;
                    v.z += (nextRnd() - 0.5) * 0.2;
                }
                // Twist
                const angle = v.y * 0.3;
                const x = v.x * Math.cos(angle) - v.z * Math.sin(angle);
                const z = v.x * Math.sin(angle) + v.z * Math.cos(angle);
                v.x = x; v.z = z;
            })
            .translate(0, height / 2, 0)
            .get();
        parts.push(trunk);

        // Dead branches
        const branchCount = 2 + Math.floor(nextRnd() * 3);
        const branchGeo = Geo.cone(0.1, 1.5, 5).toNonIndexed();

        for (let i = 0; i < branchCount; i++) {
            const y = (0.3 + nextRnd() * 0.5) * height;
            const angle = nextRnd() * Math.PI * 2;
            const tilt = 0.5 + nextRnd() * 0.5;
            parts.push(
                branchGeo.clone()
                    .rotateX(tilt)
                    .rotateY(angle)
                    .translate(0, y, 0)
                    .get()
            );
        }

        return BufferUtils.mergeGeometries(parts);
    }

    // --- Generators ---

    private generateLSystemTree(dna: LSystemDNA, complexity: number, seed: number): THREE.BufferGeometry | null {
        const branches: THREE.BufferGeometry[] = [];
        const foliage: THREE.BufferGeometry[] = [];

        const nextRnd = this.mkRng(seed);
        const p = dna.params;

        // 1. Root Flare
        const flareR = p.rootFlareR + (complexity * 0.4);
        const flareH = p.rootFlareH;

        const rootFlare = Geo.cylinder(flareR * 0.6, flareR * 1.2, flareH, 8)
            .mapCylinder(flareR, flareH, 1.0)
            .toNonIndexed()
            .mapVertices((v) => {
                const t = Math.max(0, (v.y + flareH / 2) / flareH);
                const curve = Math.pow(1.0 - t, 2.5);
                v.x *= (1.0 + curve * 1.5);
                v.z *= (1.0 + curve * 1.5);

                if (v.y < 0) {
                    const angle = Math.atan2(v.z, v.x);
                    const noise = Math.sin(angle * 5) * 0.3 * (1.0 - t);
                    v.x += Math.cos(angle) * noise;
                    v.z += Math.sin(angle) * noise;
                }
            })
            .translate(0, flareH / 2 - 0.2, 0)
            .computeVertexNormals()
            .get();
        branches.push(rootFlare);

        // 2. Grammar Generation
        const treeGrammar = new LSystem(dna.axiom, dna.rules);
        const iterations = complexity > 0.8 ? 4 : 3;
        const instructions = treeGrammar.generate(iterations, nextRnd);

        // 3. Turtle Interpretation
        const stateStack: { pos: THREE.Vector3, rot: THREE.Quaternion, radius: number, depth: number }[] = [];

        const pos = new THREE.Vector3(0, flareH - 0.3, 0);
        const rot = new THREE.Quaternion();
        let radius = flareR * 0.55;
        let currentDepth = 0;

        // Scratch objects
        const axisX = new THREE.Vector3(1, 0, 0);
        const axisY = new THREE.Vector3(0, 1, 0);
        const axisZ = new THREE.Vector3(0, 0, 1);
        const qRot = new THREE.Quaternion();
        const moveDir = new THREE.Vector3();

        for (const char of instructions) {
            if (char === 'F') {
                moveDir.set(0, 1, 0).applyQuaternion(rot).multiplyScalar(p.lenBase);
                const nextPos = pos.clone().add(moveDir);
                const midPos = pos.clone().add(moveDir.clone().multiplyScalar(0.5));

                const radialSegs = currentDepth < 2 ? 8 : 5;
                const nextRadius = radius * p.radiusDecay;

                const branch = Geo.cylinder(nextRadius, radius, p.lenBase, radialSegs)
                    .mapCylinder(radius, p.lenBase, 1.0)
                    .toNonIndexed()
                    .transformQ(midPos, rot, new THREE.Vector3(1, 1, 1))
                    .get();

                branches.push(branch);

                pos.copy(nextPos);
                radius = nextRadius;
                currentDepth++;
            }
            else if (char === '+') {
                qRot.setFromAxisAngle(axisY, p.angleYaw + (nextRnd() - 0.5) * 0.2);
                rot.multiply(qRot);
            }
            else if (char === '-') {
                qRot.setFromAxisAngle(axisY, -p.angleYaw + (nextRnd() - 0.5) * 0.2);
                rot.multiply(qRot);
            }
            else if (char === '&') {
                qRot.setFromAxisAngle(axisX, p.anglePitch + (nextRnd() - 0.5) * 0.25);
                rot.multiply(qRot);
            }
            else if (char === '^') {
                qRot.setFromAxisAngle(axisX, -p.anglePitch + (nextRnd() - 0.5) * 0.25);
                rot.multiply(qRot);
            }
            else if (char === '/') {
                qRot.setFromAxisAngle(axisZ, p.angleRoll);
                rot.multiply(qRot);
            }
            else if (char === '*') {
                qRot.setFromAxisAngle(axisZ, -p.angleRoll);
                rot.multiply(qRot);
            }
            else if (char === '[') {
                stateStack.push({ pos: pos.clone(), rot: rot.clone(), radius: radius, depth: currentDepth });
            }
            else if (char === ']') {
                if (radius < 0.25) {
                    const clusterCount = dna.foliage.clusterSize + Math.floor(nextRnd() * 2);
                    const leafTemplate = Geo.dodecahedron(1.0, 0).toNonIndexed();

                    for (let i = 0; i < clusterCount; i++) {
                        const offset = new THREE.Vector3(
                            (nextRnd() - 0.5) * dna.foliage.leafSpread,
                            (nextRnd() - 0.5) * 1.0,
                            (nextRnd() - 0.5) * dna.foliage.leafSpread
                        );

                        const s = dna.foliage.leafScale + nextRnd() * 0.6;

                        leafTemplate.transform(
                            pos.x + offset.x, pos.y + offset.y, pos.z + offset.z,
                            nextRnd() * Math.PI, nextRnd() * Math.PI, nextRnd() * Math.PI,
                            s * 1.5, s * 0.6, s * 1.5
                        );
                        foliage.push(leafTemplate.get());
                    }
                }

                const state = stateStack.pop();
                if (state) {
                    pos.copy(state.pos);
                    rot.copy(state.rot);
                    radius = state.radius;
                    currentDepth = state.depth;
                }
            }
        }

        return this.mergeComponents(branches, foliage);
    }

    private generateConifer(dna: ConiferDNA, complexity: number, seed: number): THREE.BufferGeometry | null {
        const branches: THREE.BufferGeometry[] = [];
        const needles: THREE.BufferGeometry[] = [];

        const nextRnd = this.mkRng(seed);

        const height = dna.heightBase + nextRnd() * dna.heightVar;
        const trunkRadius = dna.trunkRadius * complexity;

        const trunk = Geo.cylinder(trunkRadius * 0.2, trunkRadius, height, 6)
            .mapCylinder(trunkRadius, height, 0.5)
            .toNonIndexed()
            .translate(0, height / 2, 0)
            .get();
        branches.push(trunk);

        const needleTemplate = Geo.cone(1.0, 1.5, 6).toNonIndexed();

        for (let i = 0; i < dna.tiers; i++) {
            const t = (i / (dna.tiers - 1));
            const y = height * (0.2 + t * 0.7);
            const tierRadius = trunkRadius * dna.needleDensity * (1.0 - t);
            const tierHeight = height * 0.25 * (1.2 - t);

            const tier = needleTemplate.clone()
                .scale(tierRadius, tierHeight, tierRadius)
                .translate(0, y, 0)
                .rotateY(i * 0.5 + nextRnd() * 0.2)
                .get();

            needles.push(tier);
        }

        return this.mergeComponents(branches, needles);
    }

    private generatePalm(dna: PalmDNA, seed: number): THREE.BufferGeometry | null {
        const nextRnd = this.mkRng(seed);
        const trunkParts: THREE.BufferGeometry[] = [];
        const leafParts: THREE.BufferGeometry[] = [];

        const segments = dna.segmentCount;
        const totalH = dna.heightBase;
        const segH = totalH / segments;
        const baseR = 0.4;
        const topR = 0.25;

        // Use configured curve scaled by height
        const curvePoints = dna.leanCurve.map(p => new THREE.Vector3(p.x, p.y * totalH, p.z));
        const curve = new THREE.CatmullRomCurve3(curvePoints);

        const points = curve.getPoints(segments);
        const frames = curve.computeFrenetFrames(segments, false);

        // 1. Trunk Segments
        for (let i = 0; i < segments; i++) {
            const r1 = baseR - ((baseR - topR) * (i / segments));
            const r2 = baseR - ((baseR - topR) * ((i + 1) / segments));
            const tangent = frames.tangents[i];
            const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
            const p1 = points[i];
            const p2 = points[i + 1];
            const mid = p1.clone().add(p2).multiplyScalar(0.5);

            trunkParts.push(
                Geo.cylinder(r2, r1, segH, 7)
                    .toNonIndexed()
                    .applyQuaternion(quat)
                    .translate(mid.x, mid.y, mid.z)
                    .computeVertexNormals()
                    .get()
            );
        }

        const topPos = points[segments];

        // 2. Fronds (Polished: Higher Res & Taper)
        const frondCount = dna.frondCount;

        for (let i = 0; i < frondCount; i++) {
            const frondLen = 2.5 + nextRnd();

            const f = Geo.plane(0.8, frondLen, 2, 6).toNonIndexed();
            f.mapVertices(v => {
                const t = (v.y + frondLen / 2) / frondLen; // 0..1
                const w = Math.sin(t * Math.PI); // Leaf shape
                v.x *= w;
                v.z += t * t * 0.8; // Droop
            });

            f.rotateX(-Math.PI / 2) // Lay flat
                .rotateX(-0.2) // Initial lift
                .rotateY((i / frondCount) * Math.PI * 2 + (nextRnd() * 0.2))
                .translate(topPos.x, topPos.y, topPos.z);

            leafParts.push(f.get());
        }

        // 3. Coconuts (Polished Detail)
        const cocoCount = 3;
        for (let i = 0; i < cocoCount; i++) {
            const angle = (i / cocoCount) * Math.PI * 2;
            const r = 0.2 + nextRnd() * 0.05;
            const cx = topPos.x + Math.cos(angle) * 0.4;
            const cz = topPos.z + Math.sin(angle) * 0.4;
            const cy = topPos.y - 0.3;

            // Using Trunk Material (Bark) for Coconuts to save draw calls
            trunkParts.push(
                Geo.sphere(r, 6, 6).toNonIndexed().translate(cx, cy, cz).get()
            );
        }

        const mergedTrunk = BufferUtils.mergeGeometries(trunkParts);
        const mergedLeaves = BufferUtils.mergeGeometries(leafParts);

        if (!mergedTrunk || !mergedLeaves) return null;
        const final = BufferUtils.mergeGeometries([mergedTrunk, mergedLeaves], false);
        if (final) {
            final.clearGroups();
            final.addGroup(0, mergedTrunk.getAttribute('position').count, 0);
            final.addGroup(mergedTrunk.getAttribute('position').count, mergedLeaves.getAttribute('position').count, 1);

            final.computeBoundingBox();
            const center = new THREE.Vector3();
          final.boundingBox!.getCenter(center);
          final.translate(-center.x, -final.boundingBox!.min.y, -center.z);
        }
        return final;
    }

    private generateFernCluster(complexity: number, seed: number): THREE.BufferGeometry | null {
        const nextRnd = this.mkRng(seed);
        const fronds: THREE.BufferGeometry[] = [];
        const count = 6 + Math.floor(complexity * 6); // 6-12 fronds

        const frondLen = 1.5;

        for (let i = 0; i < count; i++) {
            // Randomized length
            const len = frondLen * (0.8 + nextRnd() * 0.4);

            // Generate single frond (Plane)
            const f = Geo.plane(0.6, len, 2, 4).toNonIndexed();
            f.mapVertices(v => {
                const t = (v.y + len / 2) / len; // 0..1
                const w = Math.sin(t * Math.PI); // Leaf shape
                v.x *= w;
                v.z += t * t * 0.8; // Droop
            });

            // Rotate and place
            const angle = (i / count) * Math.PI * 2 + (nextRnd() * 0.5);
            const tilt = -Math.PI / 4 + (nextRnd() - 0.5) * 0.2;

            f.rotateX(-Math.PI / 2)
                .rotateX(tilt)
                .rotateY(angle)
                .translate(0, 0.1, 0);

            fronds.push(f.get());
        }

        const merged = BufferUtils.mergeGeometries(fronds);
        if (merged) merged.computeVertexNormals();
        return merged;
    }

    // --- Shared Utilities ---

    generateTundraBush(complexity: number = 1.0, seed: number = 4444): THREE.BufferGeometry | null {
        const nextRnd = this.mkRng(seed);
        const parts: THREE.BufferGeometry[] = [];
        const lobeCount = 5 + Math.floor(complexity * 5);
        const center = new THREE.Vector3(0, 0.4, 0);
        const lobeGeo = Geo.dodecahedron(1.0, 0).toNonIndexed();

        for (let i = 0; i < lobeCount; i++) {
            const size = 0.3 + nextRnd() * 0.4;
            const offset = new THREE.Vector3(
                (nextRnd() - 0.5) * 1.2,
                (nextRnd() - 0.5) * 0.5,
                (nextRnd() - 0.5) * 1.2
            );
            const pos = center.clone().add(offset);
            if (pos.y < size / 2) pos.y = size / 2;

            parts.push(
                lobeGeo.clone()
                    .scale(size, size * 0.7, size)
                    .rotateX(nextRnd() * Math.PI)
                    .rotateY(nextRnd() * Math.PI)
                    .translate(pos.x, pos.y, pos.z)
                    .get()
            );
        }

        const merged = BufferUtils.mergeGeometries(parts, false);
        if (merged) merged.computeVertexNormals();
        return merged;
    }

    generateIceSpikeCluster(seed: number = 5555): THREE.BufferGeometry | null {
        const nextRnd = this.mkRng(seed);
        const parts: THREE.BufferGeometry[] = [];
        const count = 4 + Math.floor(nextRnd() * 4);
        const spikeGeo = Geo.cone(0.4, 1.0, 5).toNonIndexed().translate(0, 0.5, 0);

        for (let i = 0; i < count; i++) {
            const h = 0.8 + nextRnd() * 1.2;
            const r = 0.2 + nextRnd() * 0.3;
            const tilt = (nextRnd() - 0.5) * 0.5;
            const angle = (i / count) * Math.PI * 2 + (nextRnd() * 0.5);
            const dist = nextRnd() * 0.5;
            parts.push(
                spikeGeo.clone()
                    .scale(r, h, r)
                    .rotateX(tilt)
                    .rotateZ(tilt)
                    .translate(Math.cos(angle) * dist, 0, Math.sin(angle) * dist)
                    .get()
            );
        }

        const merged = BufferUtils.mergeGeometries(parts, false);
        if (merged) merged.computeVertexNormals();
        return merged;
    }

    generateLog(seed: number = 111): THREE.BufferGeometry {
        return Geo.cylinder(0.25, 0.3, 3, 8)
            .mapCylinder(0.3, 3, 1.0)
            .toNonIndexed()
            .computeVertexNormals()
            .get();
    }

    private mergeComponents(wood: THREE.BufferGeometry[], leaves: THREE.BufferGeometry[]): THREE.BufferGeometry | null {
        const woodGeo = wood.length > 0 ? BufferUtils.mergeGeometries(wood) : null;
        const leafGeo = leaves.length > 0 ? BufferUtils.mergeGeometries(leaves) : null;

        if (!woodGeo || !leafGeo) return null;

        const finalGeo = BufferUtils.mergeGeometries([woodGeo, leafGeo], false);
        if (finalGeo) {
            finalGeo.clearGroups();
            finalGeo.addGroup(0, woodGeo.getAttribute('position').count, 0);
            finalGeo.addGroup(woodGeo.getAttribute('position').count, leafGeo.getAttribute('position').count, 1);

            finalGeo.computeBoundingBox();
            const box = finalGeo.boundingBox!;
            const center = new THREE.Vector3();
            box.getCenter(center);

            // Pivot at center-bottom
            finalGeo.translate(-center.x, -box.min.y, -center.z);
            return finalGeo;
        }
        return null;
    }
}
