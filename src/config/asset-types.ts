
import * as THREE from 'three';
import { NatureGeneratorService } from '../services/generators/nature-generator.service';
import { ArchitectureGeneratorService } from '../services/generators/architecture-generator.service';
import { InteriorGeneratorService } from '../services/generators/interior-generator.service';
import { SciFiGeneratorService } from '../services/generators/scifi-generator.service';
import { WeaponGeneratorService } from '../services/generators/weapon-generator.service';
import { ActorGeneratorService } from '../services/generators/actor-generator.service';

// Context interface to pass generators to the config functions
export interface GeneratorContext {
    nature: NatureGeneratorService;
    arch: ArchitectureGeneratorService;
    interior: InteriorGeneratorService;
    scifi: SciFiGeneratorService;
    weapon: WeaponGeneratorService;
    actor: ActorGeneratorService;
}

export interface AssetDef {
    // Function that uses the generator context to create geometry
    generator: (ctx: GeneratorContext) => THREE.BufferGeometry | null;
    // Array of material IDs to apply to the mesh
    materials: string | string[];
}

// Helper for simple single material assignment
export const simple = (genFunc: (ctx: GeneratorContext) => THREE.BufferGeometry | null, matId: string) => ({
    generator: genFunc,
    materials: matId
});

// Helper for multi-material assignment
export const complex = (genFunc: (ctx: GeneratorContext) => THREE.BufferGeometry | null, matIds: string[]) => ({
    generator: genFunc,
    materials: matIds
});
