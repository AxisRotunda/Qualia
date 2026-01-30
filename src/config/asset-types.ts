
import * as THREE from 'three';

// Context interface to pass generators to the config functions
export interface GeneratorContext {
    nature: any;
    arch: any;
    interior: any;
    scifi: any;
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
