
import { AssetDef, simple, complex } from '../asset-types';

export const INTERIOR_ASSETS: Record<string, AssetDef> = {
    // Structure
    'gen-wall-seg-4m': complex(ctx => ctx.interior.generateWallSegment(4, 5, 0.4), ['mat-wall-cream', 'mat-wood-polish', 'mat-wall-cream']),
    'gen-doorway': complex(ctx => ctx.interior.generateDoorway(4, 5, 0.4), ['mat-wall-cream', 'mat-dark-metal']),
    'gen-window-wall': complex(ctx => ctx.interior.generateWindowWall(4, 5, 0.4), ['mat-dark-metal', 'mat-glass']),
    'gen-glass-partition': complex(ctx => ctx.interior.generateGlassPartition(4, 5), ['mat-dark-metal', 'mat-glass']),
    
    // Core Architecture
    'gen-staircase-4m': complex(ctx => ctx.interior.generateStaircase(4, 5, 8, 28), ['mat-marble', 'mat-wall-cream']),
    'gen-railing-4m': complex(ctx => ctx.interior.generateRailing(4), ['mat-wood-polish', 'mat-gold']),
    'gen-ceiling-panel': simple(ctx => ctx.interior.generateCeilingPanel(4), 'mat-wall-cream'),
    'gen-column-ornate': simple(ctx => ctx.interior.generateOrnateColumn(5), 'mat-marble'),

    // Furnishings
    'gen-sofa-01': complex(ctx => ctx.interior.generateSofa(), ['mat-fabric-gray', 'mat-wood-polish']),
    'gen-bed-modern': complex(ctx => ctx.interior.generateBed(), ['mat-wood-dark', 'mat-wall-cream', 'mat-fabric-gray']),
    'gen-chandelier-01': complex(ctx => ctx.interior.generateChandelier(), ['mat-gold', 'mat-glass']),
    
    'gen-prop-chair-office': complex(ctx => ctx.interior.generateOfficeChair(), ['mat-plastic-black', 'mat-fabric-gray', 'mat-steel']),
    'gen-desk-agency': complex(ctx => ctx.interior.generateDesk(), ['mat-desk-top', 'mat-cabinet-metal', 'mat-plastic-black']), // Added black for grommet
    
    // Tech & Storage
    'gen-server-rack': complex(ctx => ctx.interior.generateServerRack(), ['mat-plastic-black', 'mat-server-face']),
    'gen-monitor-triple': complex(ctx => ctx.interior.generateMonitorCluster(), ['mat-plastic-black', 'mat-screen-matrix']),
    'gen-file-cabinet': complex(ctx => ctx.interior.generateFileCabinet(), ['mat-cabinet-metal', 'mat-plastic-black']),
    'gen-table-map': complex(ctx => ctx.interior.generateMapTable(), ['mat-dark-metal', 'mat-screen-map']),
    'gen-ceiling-light': complex(ctx => ctx.interior.generateCeilingLight(), ['mat-plastic-beige', 'mat-glow-white']),
};
