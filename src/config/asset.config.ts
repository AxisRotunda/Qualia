
import { AssetDef, GeneratorContext } from './asset-types';
import { NATURE_ASSETS } from './assets/nature.assets';
import { ARCHITECTURE_ASSETS } from './assets/architecture.assets';
import { INTERIOR_ASSETS } from './assets/interior.assets';
import { SCIFI_ASSETS } from './assets/scifi.assets';
import { WEAPON_ASSETS } from './assets/weapon.assets';
import { ACTOR_ASSETS } from './assets/actor.assets';

export { AssetDef, GeneratorContext };

export const ASSET_CONFIG: Record<string, AssetDef> = {
    ...NATURE_ASSETS,
    ...ARCHITECTURE_ASSETS,
    ...INTERIOR_ASSETS,
    ...SCIFI_ASSETS,
    ...WEAPON_ASSETS,
    ...ACTOR_ASSETS
};
