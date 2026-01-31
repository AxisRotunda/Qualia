
import * as THREE from 'three';
import { TextureGeneratorService } from '../engine/graphics/texture-generator.service';

export type TextureGenFn = (gen: TextureGeneratorService) => THREE.Texture;

export const TEXTURE_DEFINITIONS: Record<string, TextureGenFn> = {
    'tex-concrete': (gen) => gen.nature.createConcreteBase(1), 
    
    // Hard Realism: Realistic procedural concrete
    'tex-concrete-base': (gen) => gen.nature.createConcreteBase(1),
    'tex-concrete-normal': (gen) => gen.nature.createConcreteNormal(1),
    'tex-concrete-displacement': (gen) => gen.nature.createConcreteDisplacement(1),

    'tex-ground': (gen) => gen.createGridTexture('#0f172a', '#1e293b', 8, 8),
    
    // Updated Nature Textures with PBR Normals
    'tex-bark': (gen) => gen.nature.createBarkTexture('#3f2e26', 60, 1),
    'tex-bark-normal': (gen) => gen.createBarkNormal(1),
    
    'tex-leaf': (gen) => gen.createNoiseTexture('#2f5c35', 60, 1), 
    
    'tex-rock': (gen) => gen.nature.createRockTexture('#64748b', 40, 1),
    'tex-rock-normal': (gen) => gen.createRockNormal(1),
    
    'tex-sand': (gen) => gen.createNoiseTexture('#e6c288', 30, 2),
    
    'tex-snow': (gen) => gen.createNoiseTexture('#e2e8f0', 20, 2),
    'tex-brick': (gen) => gen.createBrickTexture('#8B4513', '#5a2e15', 2),
    'tex-ice': (gen) => gen.createIceTexture(),
    'tex-water-normal': (gen) => gen.createWaterNormal(4),
    
    // Sci-Fi / Tech
    'tex-station-floor': (gen) => gen.createGridTexture('#1e293b', '#334155', 4, 1),
    'tex-scifi-panel': (gen) => gen.createGridTexture('#27272a', '#3f3f46', 2, 1),
    'tex-hex-floor': (gen) => gen.createGridTexture('#18181b', '#0ea5e9', 8, 1),
    'tex-vent': (gen) => gen.tech.createIndustrialVent(1),
    
    // Scratched Metal PBR
    'tex-metal-scratched': (gen) => gen.tech.createScratchedMetal(1),
    'tex-metal-normal': (gen) => gen.tech.createScratchedMetalNormal(1),

    'tex-marble': (gen) => gen.createMarbleTexture('#f8fafc', '#cbd5e1', 1),
    'tex-carpet': (gen) => gen.createCarpetTexture('#7f1d1d', '#991b1b'),
    'tex-fabric-gray': (gen) => gen.createNoiseTexture('#475569', 30, 2),
    'tex-wood-dark': (gen) => gen.nature.createBarkTexture('#3f2418', 30, 1),
    'tex-screen-matrix': (gen) => gen.createTechScreenCode('#000000', '#22c55e'),
    'tex-screen-map': (gen) => gen.createTechScreenMap(),
    'tex-server-rack': (gen) => gen.createServerRackTexture(),
    'tex-linoleum': (gen) => gen.createNoiseTexture('#334155', 10, 2),
    
    // City
    'tex-city-window': (gen) => gen.createCityWindowTexture(8), 
    'tex-city-window-normal': (gen) => gen.createCityWindowNormal(8),
};