
import { AssetDef, complex } from '../asset-types';

export const ACTOR_ASSETS: Record<string, AssetDef> = {
    'robot-actor': complex(ctx => ctx.actor.generateRobotActor(), ['mat-robot', 'mat-dark-metal', 'mat-glow-blue']),
    'ice-golem': complex(ctx => ctx.actor.generateIceGolem(), ['mat-ice', 'mat-glow-blue']),
    'actor-penguin': complex(ctx => ctx.actor.generatePenguin(), ['mat-penguin-body', 'mat-penguin-belly', 'mat-penguin-feet', 'mat-obsidian']),
};
