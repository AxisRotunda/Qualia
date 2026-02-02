
import * as THREE from 'three';
import { AssetDef, simple, complex } from '../asset-types';
import { Geo } from '../../engine/graphics/geo-builder';

export const NATURE_ASSETS: Record<string, AssetDef> = {
    'tree-01': complex(ctx => ctx.nature.generateTree(1.0, 1001), ['mat-bark', 'mat-leaf']),
    'hero-pine': complex(ctx => ctx.nature.generatePineTree(1.0, 2002), ['mat-wood-dark', 'mat-pine-leaf']),
    'hero-palm': complex(ctx => ctx.nature.generatePalmTree(1.0, 3003), ['mat-palm-bark', 'mat-palm-leaf']),
    'burnt-tree': simple(ctx => ctx.nature['flora'].generateBurntTree(666), 'mat-charcoal'),
    
    'geyser-vent': simple(ctx => ctx.nature['geology'].generateGeyserVent(888), 'mat-rock'),

    'bush-tundra': simple(ctx => ctx.nature.generateTundraBush(1.0, 3030), 'mat-pine-leaf'),
    'bush-fern': simple(ctx => ctx.nature['flora'].generateFern(1.0, 9999), 'mat-palm-leaf'),
    
    'ice-spike-cluster': simple(ctx => ctx.nature.generateIceSpikeCluster(4040), 'mat-ice'),

    'rock-01': simple(ctx => ctx.nature.generateRock('granite', 1.0, 4004), 'mat-rock'),
    'rock-sandstone': simple(ctx => ctx.nature.generateRock('sedimentary', 1.0, 5005), 'mat-sandstone'),
    
    'ice-01': simple(ctx => ctx.nature.generateIceChunk(1.0, 6006), 'mat-ice'),
    'log-01': simple(ctx => ctx.nature.generateLog(7007), 'mat-bark'),
    'ice-terrain-lg': simple(ctx => ctx.nature.generateIceTerrain(128), 'mat-snow'),
    'ice-spire-lg': simple(ctx => ctx.nature.generateIceSpire(8008), 'mat-ice'),
    
    'gen-ice-block': simple(ctx => ctx.nature.generateIceBlock(0.8, 8080), 'mat-ice'),

    // Water Planes
    // Legacy generic plane (Used for Oasis/Vats) - Size 500m
    'terrain-water-lg': simple(() => Geo.plane(500, 500, 128, 128).rotateX(-Math.PI/2).get(), 'mat-water'),
    
    // Dedicated Ocean Plane (Used for Island/Sea scenes) - Size 1200m to cover fog horizon
    // Higher segment count (300) ensures ~4m vertex spacing for smooth wave displacement
    'terrain-water-ocean': simple(() => Geo.plane(1200, 1200, 300, 300).rotateX(-Math.PI/2).get(), 'mat-water'),
    
    'oasis-water': simple(() => Geo.plane(60, 60, 64, 64).rotateX(-Math.PI/2).get(), 'mat-water'),
    
    // Platform
    'gen-platform': simple(() => Geo.box(10, 0.5, 10).mapBox(10, 0.5, 10).get(), 'mat-metal'),

    'debris-cinderblock': simple(ctx => ctx.nature.generateCinderBlock(9009), 'mat-concrete'),
};
