
import * as THREE from 'three';
import { AssetDef, simple, complex } from '../asset-types';

export const NATURE_ASSETS: Record<string, AssetDef> = {
    'tree-01': complex(ctx => ctx.nature.generateTree(), ['mat-bark', 'mat-leaf']),
    'rock-01': simple(ctx => ctx.nature.generateRock(), 'mat-rock'),
    'ice-01': simple(ctx => ctx.nature.generateIceChunk(), 'mat-ice'),
    'log-01': simple(ctx => ctx.nature.generateLog(), 'mat-bark'),
    'ice-terrain-lg': simple(ctx => ctx.nature.generateIceTerrain(128), 'mat-snow'),
    'ice-spire-lg': simple(ctx => ctx.nature.generateIceSpire(), 'mat-ice'),
    'terrain-water-lg': simple(() => new THREE.PlaneGeometry(300, 300, 128, 128).rotateX(-Math.PI/2), 'mat-water'),
};
