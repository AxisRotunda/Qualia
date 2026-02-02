
import { AssetDef, complex, simple } from '../asset-types';
import { Geo } from '../../services/generators/architecture/architecture.utils';

export const ARCHITECTURE_ASSETS: Record<string, AssetDef> = {
    // Civil Architecture
    'gen-building-tall': complex(ctx => ctx.arch.generateBuilding(6, 25, 6, 4), ['mat-concrete', 'mat-city-window', 'mat-dark-metal']),
    'gen-building-small': complex(ctx => ctx.arch.generateBuilding(5, 8, 5, 2), ['mat-concrete', 'mat-city-window', 'mat-dark-metal']),
    'gen-building-wide': complex(ctx => ctx.arch.generateBuilding(15, 6, 12, 1), ['mat-concrete', 'mat-city-window', 'mat-dark-metal']),
    'gen-building-skyscraper': complex(ctx => ctx.arch.generateBuilding(8, 45, 8, 6), ['mat-concrete', 'mat-city-window', 'mat-dark-metal']),
    'gen-building-highway': complex(ctx => ctx.arch.generateBuilding(8, 30, 8, 3, { highwayAccess: true }), ['mat-concrete', 'mat-city-window', 'mat-dark-metal']),

    // Road Infrastructure
    'gen-road-straight': complex(ctx => ctx.arch.generateRoad(15, 15), ['mat-asphalt', 'mat-curb', 'mat-pavement']),
    'gen-road-highway': complex(ctx => ctx.arch.generateHighway(12, 30), ['mat-asphalt', 'mat-concrete']),
    'gen-road-intersection': complex(ctx => ctx.arch.generateIntersection(15), ['mat-asphalt', 'mat-curb', 'mat-pavement']),
    'gen-road-ramp': complex(ctx => ctx.arch.generateRamp(12, 30, 8), ['mat-asphalt', 'mat-concrete']),
    'gen-road-roundabout': complex(ctx => ctx.arch.generateRoundabout(12, 6), ['mat-asphalt', 'mat-curb', 'mat-grass']),

    // Heavy Industrial (Ref_Ref: arch-industrial.service)
    'gen-piling': simple(() => Geo.cylinder(0.5, 0.5, 8, 16).translate(0, 4, 0).get(), 'mat-concrete'),
    'gen-rig-leg': simple(ctx => ctx.arch.generateRigLeg(35, 2.0), 'mat-metal'),
    'gen-stairs-ind': simple(ctx => ctx.arch.generateIndustrialStairs(3, 3, 4, 15), 'mat-metal'),
    'gen-railing-ind': simple(ctx => ctx.arch.generateIndustrialRailing(3), 'mat-hazard'),

    // High-Fidelity Industrial Props (RUN_INDUSTRY)
    'gen-prop-crate-ind': complex(ctx => ctx.arch.generateIndustrialCrate(1.5), ['mat-wood-frame', 'mat-wood']),
    'gen-prop-barrel-ind': complex(ctx => ctx.arch.generateIndustrialBarrel(0.4, 1.2), ['mat-metal-painted', 'mat-steel']),
    'gen-container-iso': complex(ctx => ctx.arch.generateShippingContainer(6.0, 2.4, 2.6), ['mat-metal-painted', 'mat-steel']),

    // Medieval Fortifications
    'gen-castle-tower': simple(ctx => ctx.arch.medieval.generateTower(4.5, 18), 'mat-rock'),
    'gen-castle-wall': simple(ctx => ctx.arch.medieval.generateWall(15, 12, 4), 'mat-rock'),

    // Ruin Assets (RUN_SCENE_OPT Phase 56.0)
    'gen-ruin-slab': simple(() => Geo.box(10, 1, 10).mapBox(10, 1, 10).get(), 'mat-sandstone'),
    'gen-ruin-wall': simple(() => Geo.box(4, 3.5, 0.8).mapBox(4, 3.5, 0.8).get(), 'mat-sandstone'),
};
