
import * as THREE from 'three';

interface ParticleData {
    life: number;
    maxLife: number;
    velocity: THREE.Vector3;
    baseScale: number;
}

export class VfxPool {
    public mesh: THREE.InstancedMesh;
    private particles: ParticleData[] = [];
    private dummy = new THREE.Object3D();

    // Ring buffer pointer for spawning
    private nextIdx = 0;

    // Active Set Optimization: Only iterate living particles
    private activeIndices: number[] = [];
    private isActive: Uint8Array;

    // Persistent Zero Matrix to avoid allocation in hot loops
    private readonly _zeroMatrix = new THREE.Matrix4().set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

    constructor(
        count: number,
        geometry: THREE.BufferGeometry,
        material: THREE.Material
    ) {
        this.mesh = new THREE.InstancedMesh(geometry, material, count);
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.mesh.frustumCulled = false;

        this.isActive = new Uint8Array(count);

        for (let i = 0; i < count; i++) {
            this.particles.push({
                life: 0,
                maxLife: 1.0,
                velocity: new THREE.Vector3(),
                baseScale: 1.0
            });
            this.mesh.setMatrixAt(i, this._zeroMatrix);
        }
    }

    spawn(pos: THREE.Vector3, vel: THREE.Vector3, scale: number, life: number) {
        const idx = this.nextIdx;
        this.nextIdx = (this.nextIdx + 1) % this.particles.length;

        const p = this.particles[idx];

        if (this.isActive[idx] === 0) {
            this.isActive[idx] = 1;
            this.activeIndices.push(idx);
        }

        p.life = life;
        p.maxLife = life;
        p.velocity.copy(vel);
        p.baseScale = scale;

        this.dummy.position.copy(pos);
        this.dummy.scale.setScalar(scale);
        this.dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        this.dummy.updateMatrix();

        this.mesh.setMatrixAt(idx, this.dummy.matrix);
        this.mesh.instanceMatrix.needsUpdate = true;
    }

    update(dt: number) {
        const activeCount = this.activeIndices.length;
        if (activeCount === 0) return;

        let dirty = false;

        for (let i = activeCount - 1; i >= 0; i--) {
            const idx = this.activeIndices[i];
            const p = this.particles[idx];

            p.life -= dt;

            if (p.life <= 0) {
                this.isActive[idx] = 0;
                this.mesh.setMatrixAt(idx, this._zeroMatrix);

                const last = this.activeIndices[this.activeIndices.length - 1];
                this.activeIndices[i] = last;
                this.activeIndices.pop();

                dirty = true;
                continue;
            }

            // Gravity for sparks/debris
            p.velocity.y -= 9.81 * dt;

            this.mesh.getMatrixAt(idx, this.dummy.matrix);
            this.dummy.position.setFromMatrixPosition(this.dummy.matrix);

            this.dummy.position.x += p.velocity.x * dt;
            this.dummy.position.y += p.velocity.y * dt;
            this.dummy.position.z += p.velocity.z * dt;

            // Linear scale decay
            const lifeRatio = p.life / p.maxLife;
            const s = p.baseScale * lifeRatio;
            this.dummy.scale.set(s, s, s);

            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(idx, this.dummy.matrix);
            dirty = true;
        }

        if (dirty) {
            this.mesh.instanceMatrix.needsUpdate = true;
        }
    }

    dispose() {
        this.mesh.geometry.dispose();
        this.particles = [];
        this.activeIndices = [];
    }
}
