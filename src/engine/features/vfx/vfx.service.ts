
import { Injectable, inject, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { SceneGraphService } from '../../graphics/scene-graph.service';
import { VfxPool } from './vfx-pool';
import { COMBAT_CONFIG } from '../combat/combat.config';
import { SceneLifecycleService } from '../../level/scene-lifecycle.service';

interface LightFlash {
    light: THREE.PointLight;
    active: boolean;
    age: number;
    lifespan: number;
    maxIntensity: number;
}

interface Tracer {
    line: THREE.Line;
    age: number;
    lifespan: number;
    active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VfxService implements OnDestroy {
  private graph = inject(SceneGraphService);
  private lifecycle = inject(SceneLifecycleService);

  private sparkPool: VfxPool | null = null;
  private flashPool: VfxPool | null = null;
  private dustPool: VfxPool | null = null;
  private shellPool: VfxPool | null = null;
  
  private lightPool: LightFlash[] = [];
  private tracerPool: Tracer[] = [];
  private readonly MAX_LIGHTS = 8; 
  private readonly MAX_TRACERS = 16;

  private readonly _scratchVel = new THREE.Vector3();
  private readonly _scratchPos = new THREE.Vector3();
  private readonly _randomVec = new THREE.Vector3();

  constructor() {
      this.lifecycle.onWorldCleared.subscribe(() => this.reset());
  }

  init() {
      if (this.sparkPool) return;

      // 1. Sparks Pool
      const sparkGeo = new THREE.PlaneGeometry(0.05, 0.2);
      const sparkMat = new THREE.MeshBasicMaterial({ 
          color: 0xffcc00, 
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          transparent: true
      });
      this.sparkPool = new VfxPool(COMBAT_CONFIG.VFX.MAX_SPARKS, sparkGeo, sparkMat);
      this.graph.addEntity(this.sparkPool.mesh);

      // 2. Muzzle Flash Pool
      const flashGeo = new THREE.PlaneGeometry(0.8, 0.8);
      const flashMat = new THREE.MeshBasicMaterial({
          color: 0x0ea5e9,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          transparent: true,
          opacity: 0.8
      });
      this.flashPool = new VfxPool(COMBAT_CONFIG.VFX.MAX_FLASHES, flashGeo, flashMat);
      this.graph.addEntity(this.flashPool.mesh);

      // 3. Dust Pool
      const dustGeo = new THREE.DodecahedronGeometry(0.2, 0);
      const dustMat = new THREE.MeshBasicMaterial({
          color: 0x888888,
          transparent: true,
          opacity: 0.4,
          depthWrite: false
      });
      this.dustPool = new VfxPool(200, dustGeo, dustMat);
      this.graph.addEntity(this.dustPool.mesh);

      // 4. Shell Casings (Brass)
      const shellGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.04, 6);
      const shellMat = new THREE.MeshStandardMaterial({
          color: 0xd4af37, // Brass gold
          roughness: 0.3,
          metalness: 1.0
      });
      this.shellPool = new VfxPool(COMBAT_CONFIG.VFX.MAX_SHELLS, shellGeo, shellMat);
      this.graph.addEntity(this.shellPool.mesh);

      // 5. Light Pool
      for(let i = 0; i < this.MAX_LIGHTS; i++) {
          const light = new THREE.PointLight(0xffffff, 0, 10);
          light.visible = false;
          light.castShadow = false; 
          this.graph.add(light);
          
          this.lightPool.push({
              light, active: false, age: 0, lifespan: 0, maxIntensity: 0
          });
      }

      // 6. Tracer Pool
      for(let i = 0; i < this.MAX_TRACERS; i++) {
          const tracerGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
          const tracerMat = new THREE.LineBasicMaterial({
              color: 0x38bdf8,
              transparent: true,
              opacity: 1.0,
              depthWrite: false,
              blending: THREE.AdditiveBlending
          });
          const line = new THREE.Line(tracerGeo, tracerMat);
          line.visible = false;
          line.frustumCulled = false;
          this.graph.add(line);
          this.tracerPool.push({ line, age: 0, lifespan: 0.08, active: false });
      }
  }

  emitTracer(start: THREE.Vector3, end: THREE.Vector3, color: number = 0x38bdf8) {
      if (this.tracerPool.length === 0) this.init();
      
      const tracer = this.tracerPool.find(t => !t.active) || this.tracerPool[0];
      tracer.active = true;
      tracer.age = 0;
      tracer.lifespan = 0.08;
      
      const posAttr = tracer.line.geometry.attributes['position'];
      posAttr.setXYZ(0, start.x, start.y, start.z);
      posAttr.setXYZ(1, end.x, end.y, end.z);
      posAttr.needsUpdate = true;
      
      (tracer.line.material as THREE.LineBasicMaterial).color.setHex(color);
      (tracer.line.material as THREE.LineBasicMaterial).opacity = 1.0;
      tracer.line.visible = true;
  }

  emitShell(pos: THREE.Vector3, right: THREE.Vector3, up: THREE.Vector3) {
      if (!this.shellPool) this.init();
      
      // Eject to the right and slightly up
      this._scratchVel.copy(right).multiplyScalar(1.5 + Math.random())
          .addScaledVector(up, 1.5 + Math.random())
          .addScaledVector(this._randomVec.set(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5), 0.5);
          
      this.shellPool!.spawn(pos, this._scratchVel, 1.0, 1.5); // 1.5s lifetime
  }

  emitImpact(pos: THREE.Vector3, normal: THREE.Vector3, materialType: string | undefined, color: number) {
      if (!this.sparkPool) this.init();

      const type = materialType || 'default';
      
      if (type === 'metal' || type === 'titanium' || type === 'lead') {
          this.emitSparks(pos, normal, 16, color);
          this.emitLightFlash(pos, color, 6.0, 10.0, 0.12);
      } else if (type === 'glass' || type === 'ice') {
          this.emitSparks(pos, normal, 8, 0xffffff);
          this.emitLightFlash(pos, 0xffffff, 4.0, 6.0, 0.1);
      } else {
          // Concrete, Rock, Soil -> Dust
          this.emitDust(pos, normal, 8, 0x999999);
          this.emitLightFlash(pos, color, 2.0, 4.0, 0.08);
      }
  }

  emitSparks(pos: THREE.Vector3, normal: THREE.Vector3, count = 5, color: number = 0xffaa00) {
      if (!this.sparkPool) this.init();
      (this.sparkPool!.mesh.material as THREE.MeshBasicMaterial).color.setHex(color);

      for(let i=0; i<count; i++) {
          this._randomVec.set((Math.random()-0.5)*2, (Math.random()-0.5)*2, (Math.random()-0.5)*2);
          this._scratchVel.copy(normal).add(this._randomVec).normalize().multiplyScalar(6 + Math.random() * 8);
          this.sparkPool!.spawn(pos, this._scratchVel, 1.2 + Math.random()*0.6, 0.4 + Math.random() * 0.4);
      }
  }

  emitDust(pos: THREE.Vector3, normal: THREE.Vector3, count = 5, color: number = 0x888888) {
      if (!this.dustPool) this.init();
      (this.dustPool!.mesh.material as THREE.MeshBasicMaterial).color.setHex(color);

      for(let i=0; i<count; i++) {
          this._randomVec.set((Math.random()-0.5)*1.2, Math.random()*0.5, (Math.random()-0.5)*1.2);
          this._scratchVel.copy(normal).multiplyScalar(0.5).add(this._randomVec).normalize().multiplyScalar(2 + Math.random() * 3);
          this.dustPool!.spawn(pos, this._scratchVel, 2.0 + Math.random() * 3.0, 1.0 + Math.random() * 1.5);
      }
  }

  emitMuzzleFlash(pos: THREE.Vector3, dir: THREE.Vector3, color: number = 0x0ea5e9) {
      if (!this.flashPool) this.init();
      (this.flashPool!.mesh.material as THREE.MeshBasicMaterial).color.setHex(color);

      this._scratchPos.copy(pos).addScaledVector(dir, 0.4);
      this._scratchVel.copy(dir).multiplyScalar(1.0);
      this.flashPool!.spawn(this._scratchPos, this._scratchVel, 1.5, COMBAT_CONFIG.VFX.FLASH_LIFETIME);
  }

  emitLightFlash(pos: THREE.Vector3, color: number, intensity: number, range: number, duration: number) {
      if (this.lightPool.length === 0) this.init();

      let candidate = this.lightPool.find(l => !l.active);
      if (!candidate) {
          candidate = this.lightPool.reduce((prev, curr) => (curr.age / curr.lifespan) > (prev.age / prev.lifespan) ? curr : prev);
      }

      if (candidate) {
          candidate.active = true;
          candidate.age = 0;
          candidate.lifespan = duration;
          candidate.maxIntensity = intensity;
          candidate.light.color.setHex(color);
          candidate.light.distance = range;
          candidate.light.position.copy(pos);
          candidate.light.intensity = intensity;
          candidate.light.visible = true;
      }
  }

  update(dt: number) {
      if (this.sparkPool) this.sparkPool.update(dt);
      if (this.flashPool) this.flashPool.update(dt);
      if (this.dustPool) this.dustPool.update(dt);
      if (this.shellPool) this.shellPool.update(dt);

      for (let i = 0; i < this.lightPool.length; i++) {
          const item = this.lightPool[i];
          if (!item.active) continue;
          item.age += dt;
          if (item.age >= item.lifespan) {
              item.active = false;
              item.light.visible = false;
          } else {
              const t = item.age / item.lifespan;
              item.light.intensity = item.maxIntensity * (1.0 - (t * t));
          }
      }

      for (let i = 0; i < this.tracerPool.length; i++) {
          const t = this.tracerPool[i];
          if (!t.active) continue;
          t.age += dt;
          if (t.age >= t.lifespan) {
              t.active = false;
              t.line.visible = false;
          } else {
              (t.line.material as THREE.LineBasicMaterial).opacity = 1.0 - (t.age / t.lifespan);
          }
      }
  }

  reset() {
      [this.sparkPool, this.flashPool, this.dustPool, this.shellPool].forEach(p => {
          if (p) { this.graph.removeEntity(p.mesh); p.dispose(); }
      });
      this.sparkPool = this.flashPool = this.dustPool = this.shellPool = null;
      this.lightPool.forEach(l => { this.graph.remove(l.light); l.light.dispose(); });
      this.lightPool = [];
      this.tracerPool.forEach(t => { this.graph.remove(t.line); t.line.geometry.dispose(); (t.line.material as THREE.Material).dispose(); });
      this.tracerPool = [];
  }

  ngOnDestroy() { this.reset(); }
}
