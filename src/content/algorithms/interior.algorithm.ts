
import * as THREE from 'three';
import { SceneContext } from '../../engine/level/scene-context';
import { EngineService } from '../../services/engine.service';
import { yieldToMain } from '../../engine/utils/thread.utils';

/**
 * InteriorAlgorithm: Generates high-fidelity corporate atrium.
 * RUN_INDUSTRY: Validated against architectural standards (2.2m doors, 5m floor height).
 */
export class InteriorAlgorithm {
  private static readonly _rot = new THREE.Euler();
  private static readonly _scale = { x: 1, y: 1, z: 1 };
  private static readonly _rot90 = new THREE.Euler(0, Math.PI/2, 0);
  private static readonly _rot180 = new THREE.Euler(0, Math.PI, 0);

  static async generateLobby(ctx: SceneContext, engine: EngineService) {
      engine.state.setLoadingStage('ARCHITECTURAL FRAMING');

      const roomW = 40;
      const roomD = 48;
      const floorH = 5;
      const ceilingH = 10;
      
      // 1. Structure
      await this.generateShell(ctx, roomW, roomD, ceilingH);
      await yieldToMain();
      
      // 2. Vertical Circulation
      this.generateMezzanine(ctx, roomW, roomD, floorH);
      
      // 3. Zoning (Reception, Waiting, Work)
      engine.state.setLoadingStage('INTERIOR ZONING');
      await this.generateReception(ctx, engine);
      await this.generateWaitingArea(ctx);
      await this.generateWorkstations(ctx);

      // Hero Lighting
      ctx.spawn('prop-chandelier', 0, 8, 0);
      
      // Fill Light
      const mainLight = new THREE.PointLight(0xffaa00, 1.5, 25);
      mainLight.position.set(0, 7, 0);
      engine.sys.scene.getScene().add(mainLight);
  }

  private static async generateShell(ctx: SceneContext, w: number, d: number, h: number) {
      // Flooring (Marble Checkered pattern via alternating tiles would be expensive, using slab)
      for(let x = -w/2; x < w/2; x+=4) {
          for(let z = -d/2; z < d/2; z+=4) {
              ctx.spawn('structure-floor-marble', x + 2, 0, z + 2, { alignToBottom: true });
              ctx.spawn('structure-ceiling', x + 2, h - 0.1, z + 2);
          }
          if (x % 16 === 0) await yieldToMain();
      }

      // Perimeter Walls (Modular 4m segments)
      // South (Entry)
      for(let x = -w/2; x < w/2; x+=4) {
          if (Math.abs(x) < 4) {
              // Main Entrance (Double Door)
              ctx.spawn('gen-doorway', x + 2, 0, d/2, { alignToBottom: true });
          } else {
              ctx.spawn('structure-wall-interior', x + 2, 0, d/2, { alignToBottom: true });
          }
          // Upper floor
          ctx.spawn('gen-window-wall', x + 2, 5, d/2, { alignToBottom: true });
      }

      // North (Back)
      for(let x = -w/2; x < w/2; x+=4) {
          ctx.spawn('structure-wall-interior', x + 2, 0, -d/2, { alignToBottom: true });
          ctx.spawn('structure-wall-interior', x + 2, 5, -d/2, { alignToBottom: true });
      }

      // Sides (West/East)
      for(let z = -d/2; z < d/2; z+=4) {
          // West
          ctx.spawn('structure-wall-interior', -w/2, 0, z + 2, { alignToBottom: true, rotation: this._rot90 });
          ctx.spawn('gen-window-wall', -w/2, 5, z + 2, { alignToBottom: true, rotation: this._rot90 });
          
          // East
          ctx.spawn('structure-wall-interior', w/2, 0, z + 2, { alignToBottom: true, rotation: this._rot90 });
          ctx.spawn('gen-window-wall', w/2, 5, z + 2, { alignToBottom: true, rotation: this._rot90 });
      }
  }

  private static generateMezzanine(ctx: SceneContext, w: number, d: number, floorH: number) {
      // Mezzanine Floor (U-Shape)
      const depth = 8;
      
      // Back Section
      for(let x = -w/2; x < w/2; x+=4) {
          ctx.spawn('structure-floor-marble', x + 2, floorH, -d/2 + 2, { alignToBottom: true });
          ctx.spawn('structure-floor-marble', x + 2, floorH, -d/2 + 6, { alignToBottom: true });
          // Railing
          ctx.spawn('structure-railing', x + 2, floorH, -d/2 + 8, { alignToBottom: true });
      }

      // Side Sections
      for(let z = -d/2; z < d/2; z+=4) {
          // Left
          ctx.spawn('structure-floor-marble', -w/2 + 2, floorH, z + 2, { alignToBottom: true });
          if (z > -d/2 + 8) ctx.spawn('structure-railing', -w/2 + 4, floorH, z + 2, { alignToBottom: true, rotation: this._rot90 });
          
          // Right
          ctx.spawn('structure-floor-marble', w/2 - 2, floorH, z + 2, { alignToBottom: true });
          if (z > -d/2 + 8) ctx.spawn('structure-railing', w/2 - 4, floorH, z + 2, { alignToBottom: true, rotation: this._rot90 });
      }

      // Grand Staircase (Centered Back)
      const stairs = ctx.spawn('structure-staircase', 0, 0, -d/2 + 12, { alignToBottom: true });
      ctx.modify(stairs, { rotation: this._rot180 });
      
      // Support Columns
      [-12, 12].forEach(x => {
          [0, 12].forEach(zOffset => {
              ctx.spawn('prop-column-ornate', x, 0, -d/2 + 8 + zOffset, { alignToBottom: true });
              ctx.spawn('prop-column-ornate', x, 5, -d/2 + 8 + zOffset, { alignToBottom: true });
          });
      });
  }

  private static async generateReception(ctx: SceneContext, engine: EngineService) {
      const x = 0;
      const z = 10;
      
      // Desk
      const deskId = ctx.spawn('shape-neon-cube', x, 0, z, { alignToBottom: true });
      ctx.modify(deskId, { scale: { x: 4, y: 1.1, z: 0.8 } });
      engine.ops.setEntityName(deskId, 'CONCIERGE_DESK');
      
      // Computers
      ctx.spawn('prop-monitor-triple', x - 1, 1.1, z, { alignToBottom: true, rotation: this._rot180 });
      ctx.spawn('gen-prop-chair-office', x - 1, 0, z - 1.5, { alignToBottom: true });

      // Branding / Logo behind
      const logo = ctx.spawn('prop-glass-pane', x, 2.5, z - 4);
      ctx.modify(logo, { scale: { x: 2, y: 0.8, z: 0.1 } });
  }

  private static async generateWaitingArea(ctx: SceneContext) {
      const z = 12;
      const x = 12;
      
      // Carpet Area
      const rug = ctx.spawn('structure-floor-linoleum', x, 0.02, z, { alignToBottom: true });
      ctx.modify(rug, { scale: { x: 2, y: 0.1, z: 2 } });
      
      // Seating
      ctx.spawn('gen-sofa-01', x - 2, 0, z, { alignToBottom: true, rotation: new THREE.Euler(0, -Math.PI/2, 0) });
      ctx.spawn('gen-sofa-01', x + 2, 0, z, { alignToBottom: true, rotation: new THREE.Euler(0, Math.PI/2, 0) });
      
      // Coffee Table
      const table = ctx.spawn('prop-glass-block', x, 0, z, { alignToBottom: true });
      ctx.modify(table, { scale: { x: 0.8, y: 0.4, z: 1.2 } });
  }

  private static async generateWorkstations(ctx: SceneContext) {
      // Mezzanine Offices
      const startZ = -10;
      for(let i=0; i<3; i++) {
          const z = startZ + (i * 5);
          
          // Left Side
          ctx.spawn('gen-desk-agency', -14, 5, z, { alignToBottom: true, rotation: this._rot90 });
          ctx.spawn('gen-prop-chair-office', -15.5, 5, z, { alignToBottom: true, rotation: this._rot90 });
          ctx.spawn('prop-file-cabinet', -13, 5, z + 1.5, { alignToBottom: true, rotation: this._rot90 });

          // Right Side
          ctx.spawn('gen-desk-agency', 14, 5, z, { alignToBottom: true, rotation: new THREE.Euler(0, -Math.PI/2, 0) });
          ctx.spawn('gen-prop-chair-office', 15.5, 5, z, { alignToBottom: true, rotation: new THREE.Euler(0, -Math.PI/2, 0) });
      }
  }
}
