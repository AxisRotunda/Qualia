
import * as THREE from 'three';
import { AssetDef, simple, complex } from '../asset-types';

export const NATURE_ASSETS: Record<string, AssetDef> = {
    'tree-01': complex(ctx => ctx.nature.generateTree(), ['mat-bark', 'mat-leaf']),
    'rock-01': simple(ctx => ctx.nature.generateRock('granite'), 'mat-rock'),
    'rock-sandstone': simple(ctx => ctx.nature.generateRock('sedimentary'), 'mat-sandstone'),
    'hero-palm': complex(ctx => ctx.nature.generatePalmTree(), ['mat-palm-bark', 'mat-palm-leaf']),
    
    'ice-01': simple(ctx => ctx.nature.generateIceChunk(), 'mat-ice'),
    'log-01': simple(ctx => ctx.nature.generateLog(), 'mat-bark'),
    'ice-terrain-lg': simple(ctx => ctx.nature.generateIceTerrain(128), 'mat-snow'),
    'ice-spire-lg': simple(ctx => ctx.nature.generateIceSpire(), 'mat-ice'),
    
    'terrain-water-lg': simple(() => new THREE.PlaneGeometry(300, 300, 256, 256).rotateX(-Math.PI/2), 'mat-water'),
    'terrain-soil-lg': simple(() => new THREE.BoxGeometry(200, 0.5, 200), 'mat-dirt'),
    
    // Oasis Water (Smaller)
    'oasis-water': simple(() => new THREE.PlaneGeometry(60, 60, 128, 128).rotateX(-Math.PI/2), 'mat-water'),
    
    'debris-cinderblock': simple(ctx => ctx.nature.generateCinderBlock(), 'mat-concrete'),
};
