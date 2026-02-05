
import { AssetDef, complex } from '../asset-types';

export const WEAPON_ASSETS: Record<string, AssetDef> = {
    'gen-weapon-blaster': complex(ctx => ctx.weapon.generateBlaster(), ['mat-plastic-black', 'mat-dark-metal', 'mat-tech-grip', 'mat-glow-blue']),
    'gen-weapon-hammer': complex(ctx => ctx.weapon.generateHammer(), ['mat-tech-grip', 'mat-dark-metal', 'mat-steel', 'mat-metal']),
    'gen-weapon-fist': complex(ctx => ctx.weapon.generateFist(), ['mat-dark-metal', 'mat-glow-orange']),
    'gen-weapon-pistol': complex(ctx => ctx.weapon.generatePistol(), ['mat-tech-grip', 'mat-dark-metal', 'mat-steel'])
};
