
import { ScenePreset } from './scene-types';
import { CITY_SCENE } from '../content/scenes/city.scene';
import { FOREST_SCENE } from '../content/scenes/forest.scene';
import { ORBIT_SCENE } from '../content/scenes/orbit.scene';
import { ICE_SCENE } from '../content/scenes/ice.scene';
import { PARTICLES_SCENE } from '../content/scenes/particles.scene';
import { INTERIOR_SCENE } from '../content/scenes/interior.scene';
import { SPACESHIP_SCENE } from '../content/scenes/spaceship.scene';
import { AGENCY_SCENE } from '../content/scenes/agency.scene';
import { ELEVATOR_SCENE } from '../content/scenes/elevator.scene';
import { WATER_SCENE } from '../content/scenes/water.scene';
import { DESERT_SCENE } from '../content/scenes/desert.scene';
import { MOUNTAIN_SUMMIT_SCENE } from '../content/scenes/mountain-summit.scene';
import { FACTORY_SCENE } from '../content/scenes/factory.scene';
import { NEURAL_ARRAY_SCENE } from '../content/scenes/neural-array.scene';
import { DEBUG_SCENE } from '../content/scenes/debug.scene';
import { EDEN_COMPLEX_SCENE } from '../content/scenes/eden-complex.scene';
import { PARK_VOLCANO_SCENE } from '../content/scenes/park-volcano.scene';
import { ABYSSAL_REACH_SCENE } from '../content/scenes/abyssal-reach.scene';
import { FALLOUT_SCENE } from '../content/scenes/fallout.scene';
import { MEDIEVAL_CITADEL_SCENE } from '../content/scenes/medieval-citadel.scene';
import { BEDROOM_SCENE } from '../content/scenes/bedroom.scene';

export type { ScenePreset };

export const SCENE_DEFINITIONS: ScenePreset[] = [
    DEBUG_SCENE,
    BEDROOM_SCENE,
    MEDIEVAL_CITADEL_SCENE,
    FALLOUT_SCENE,
    ABYSSAL_REACH_SCENE,
    PARK_VOLCANO_SCENE,
    EDEN_COMPLEX_SCENE,
    NEURAL_ARRAY_SCENE,
    FACTORY_SCENE,
    MOUNTAIN_SUMMIT_SCENE,
    DESERT_SCENE,
    WATER_SCENE,
    ELEVATOR_SCENE,
    AGENCY_SCENE,
    SPACESHIP_SCENE,
    INTERIOR_SCENE,
    CITY_SCENE,
    FOREST_SCENE,
    ORBIT_SCENE,
    ICE_SCENE,
    PARTICLES_SCENE
];
