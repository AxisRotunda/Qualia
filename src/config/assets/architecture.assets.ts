
import { AssetDef, complex } from '../asset-types';

export const ARCHITECTURE_ASSETS: Record<string, AssetDef> = {
    'gen-building-tall': complex(ctx => ctx.arch.generateBuilding(6, 25, 6, 4), ['mat-concrete', 'mat-window', 'mat-dark-metal']),
    'gen-building-small': complex(ctx => ctx.arch.generateBuilding(5, 8, 5, 2), ['mat-concrete', 'mat-window', 'mat-dark-metal']),
    'gen-building-wide': complex(ctx => ctx.arch.generateBuilding(15, 6, 12, 1), ['mat-concrete', 'mat-window', 'mat-dark-metal']),
    'gen-building-skyscraper': complex(ctx => ctx.arch.generateBuilding(8, 45, 8, 6), ['mat-concrete', 'mat-window', 'mat-dark-metal']),
    'gen-road-straight': complex(ctx => ctx.arch.generateRoad(15, 15), ['mat-asphalt', 'mat-curb', 'mat-pavement']),
    
    // Infrastructure
    'gen-road-highway': complex(ctx => ctx.arch.generateHighway(12, 30), ['mat-asphalt', 'mat-concrete']),
    'gen-road-intersection': complex(ctx => ctx.arch.generateIntersection(15), ['mat-asphalt', 'mat-curb', 'mat-pavement']),
    'gen-road-ramp': complex(ctx => ctx.arch.generateRamp(12, 30, 8), ['mat-asphalt', 'mat-concrete']),
    'gen-road-roundabout': complex(ctx => ctx.arch.generateRoundabout(12, 6), ['mat-asphalt', 'mat-curb', 'mat-grass']),
};
