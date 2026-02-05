
import { TEXTURE_COMMON } from './textures/common.const';
import { TEXTURE_GEN_NATURE } from './textures/generators-nature.const';
import { TEXTURE_GEN_ARCH } from './textures/generators-arch.const';
import { TEXTURE_GEN_TECH } from './textures/generators-tech.const';
import { WORKER_MAIN } from './textures/worker-main.const';

// Order matters: Utilities -> Generators -> Main Execution
export const TEXTURE_WORKER_SCRIPT =
    TEXTURE_COMMON + '\n' +
    TEXTURE_GEN_NATURE + '\n' +
    TEXTURE_GEN_ARCH + '\n' +
    TEXTURE_GEN_TECH + '\n' +
    WORKER_MAIN;
