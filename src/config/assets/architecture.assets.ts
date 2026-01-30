
import { AssetDef, complex } from '../asset-types';

export const ARCHITECTURE_ASSETS: Record<string, AssetDef> = {
    'gen-building-tall': complex(ctx => ctx.arch.generateBuilding(6, 25, 6, 4), ['mat-concrete', 'mat-window', 'mat-dark-metal']),
    'gen-building-small': complex(ctx => ctx.arch.generateBuilding(5, 8, 5, 2), ['mat-concrete', 'mat-window', 'mat-dark-metal']),
    'gen-building-wide': complex(ctx => ctx.arch.generateBuilding(15, 6, 12, 1), ['mat-concrete', 'mat-window', 'mat-dark-metal']),
    'gen-building-skyscraper': complex(ctx => ctx.arch.generateBuilding(8, 45, 8, 6), ['mat-concrete', 'mat-window', 'mat-dark-metal']),
    'gen-road-straight': complex(ctx => ctx.arch.generateRoad(15, 15), ['mat-asphalt', 'mat-curb', 'mat-pavement']),
};
