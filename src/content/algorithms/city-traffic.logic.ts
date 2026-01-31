
import * as THREE from 'three';
import { EngineService } from '../../services/engine.service';

/**
 * Specialized logic for high-volume city traffic.
 * Uses raw InstancedMesh for maximum performance (skips ECS overhead).
 */
export class CityTrafficLogic {
    private mesh: THREE.InstancedMesh | null = null;
    private count = 200; // Performance tuning: reduced from 300
    private speeds: Float32Array;
    private offsets: Float32Array;
    
    // Config
    private bounds = { minX: -320, maxX: 320 }; // Aligned with new city radius
    private highwayZ = -90;
    private highwayY = 12.0;
    private hoverHeight = 1.0;

    // Scratch
    private dummy = new THREE.Object3D();
    private _color = new THREE.Color();

    constructor(private engine: EngineService) {
        this.speeds = new Float32Array(this.count);
        this.offsets = new Float32Array(this.count);
    }

    init() {
        const geo = this.engine.assetService.getGeometry('vehicle-traffic-puck');
        // Basic material supports vertex colors
        const mat = new THREE.MeshBasicMaterial({ color: 0xffffff }); 

        this.mesh = new THREE.InstancedMesh(geo, mat, this.count);
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.mesh.frustumCulled = false; // Always update as it spans the whole city
        
        for(let i=0; i<this.count; i++) {
            this.resetVehicle(i);
        }
        
        this.mesh.instanceMatrix.needsUpdate = true;
        if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
        
        // Direct Scene Graph insertion (bypassing EntityStore for raw performance)
        this.engine.sceneGraph.addEntity(this.mesh);
    }
    
    update(dt: number, totalTime: number) {
        if (!this.mesh) return;
        const dtSec = dt / 1000;
        const timeSec = totalTime / 1000;
        
        for(let i=0; i<this.count; i++) {
            this.mesh.getMatrixAt(i, this.dummy.matrix);
            this.dummy.position.setFromMatrixPosition(this.dummy.matrix);
            
            // Move
            this.dummy.position.x += this.speeds[i] * dtSec;
            
            // Hover Bob
            const bob = Math.sin(timeSec * 5 + this.offsets[i]) * 0.15;
            this.dummy.position.y = this.highwayY + this.hoverHeight + bob;

            // Wrap
            if (this.dummy.position.x > this.bounds.maxX) {
                this.dummy.position.x = this.bounds.minX;
            } else if (this.dummy.position.x < this.bounds.minX) {
                this.dummy.position.x = this.bounds.maxX;
            }
            
            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
        }
        
        this.mesh.instanceMatrix.needsUpdate = true;
    }
    
    private resetVehicle(i: number) {
        const lane = i % 4; // 4 Lanes total
        const dir = lane < 2 ? 1 : -1; // 0,1 East | 2,3 West
        
        // Z Offsets relative to highway center (-90)
        // Highway width is 12. Lanes at roughly -3, -1, 1, 3
        let zLane = 0;
        if (lane === 0) zLane = 4;
        if (lane === 1) zLane = 1.5;
        if (lane === 2) zLane = -1.5;
        if (lane === 3) zLane = -4;

        const x = (Math.random() - 0.5) * (this.bounds.maxX - this.bounds.minX);
        
        this.dummy.position.set(x, this.highwayY + this.hoverHeight, this.highwayZ + zLane);
        // Face direction
        this.dummy.rotation.set(0, dir === 1 ? 0 : Math.PI, 0);
        this.dummy.updateMatrix();
        
        if (this.mesh) this.mesh.setMatrixAt(i, this.dummy.matrix);
        
        // Colors: Eastbound (Away) = Red Taillights, Westbound (Towards) = White/Blue Headlights
        // Or simplified: Orange vs Blue for Cyberpunk feel
        if (dir === 1) this._color.setHex(0xffaa00); // Orange
        else this._color.setHex(0x0ea5e9); // Cyan
        
        // Add variation
        if (Math.random() > 0.9) this._color.setHex(0xffffff); // Occasional bright white

        if (this.mesh) this.mesh.setColorAt(i, this._color);
        
        // Speed: 25-45 m/s (Fast highway)
        this.speeds[i] = (25 + Math.random() * 20) * dir;
        this.offsets[i] = Math.random() * 100;
    }

    dispose() {
        if (this.mesh) {
            this.engine.sceneGraph.removeEntity(this.mesh);
            this.mesh.dispose();
            this.mesh = null;
        }
    }
}