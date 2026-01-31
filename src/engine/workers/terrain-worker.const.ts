
import { NOISE_FUNCTIONS } from './terrain/noise.const';
import { EROSION_FUNCTIONS } from './terrain/erosion.const';
import { WORKER_MAIN } from './terrain/main.const';

// Ensure newlines separate the blocks to prevent syntax errors if a block lacks a trailing newline
export const TERRAIN_WORKER_SCRIPT = NOISE_FUNCTIONS + "\n" + EROSION_FUNCTIONS + "\n" + WORKER_MAIN;
