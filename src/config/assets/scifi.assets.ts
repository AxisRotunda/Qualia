
import { AssetDef, complex, simple } from '../asset-types';
import { Geo } from '../../engine/graphics/geo-builder';

export const SCIFI_ASSETS: Record<string, AssetDef> = {
    'gen-elevator-cabin': complex(ctx => ctx.scifi.generateElevatorCabin(), ['mat-dark-metal', 'mat-glass', 'mat-linoleum', 'mat-plastic-black']),
    'gen-elevator-shaft': complex(ctx => ctx.scifi.generateElevatorShaft(400), ['mat-concrete', 'mat-stone-dark', 'mat-glow-blue']),
    
    'gen-scifi-corridor': complex(ctx => ctx.scifi.generateSciFiCorridor(6, 5, 12), ['mat-scifi-panel-dark', 'mat-scifi-floor', 'mat-glow-blue', 'mat-scifi-pipe', 'mat-scifi-vent']),
    
    'gen-scifi-hub': complex(ctx => ctx.scifi.generateSciFiHub(18, 8, 18), ['mat-scifi-panel-dark', 'mat-scifi-floor', 'mat-glow-orange', 'mat-scifi-vent']),
    
    'research-station-v2': complex(ctx => ctx.scifi.generateResearchStationV2(), ['mat-tech-hull', 'mat-tech-floor', 'mat-tech-dark', 'mat-tech-orange']),

    'vehicle-traffic-puck': simple(() => Geo.box(2.5, 0.4, 1.2).get(), 'mat-glow-white'),
};
