
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

export { ScenePreset };

export const SCENE_DEFINITIONS: ScenePreset[] = [
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
