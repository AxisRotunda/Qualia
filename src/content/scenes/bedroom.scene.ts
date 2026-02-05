
import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';
import { yieldToMain } from '../../engine/utils/thread.utils';

/**
 * Cyber-Loft Scene (Overhauled)
 * Protocol: RUN_SCENE_OPT V2.0 (INTERIOR Archetype)
 * Focus: Hard Realism Scaling (1:1m), Enclosure Integrity, Neon PBR lighting.
 * Dimensions: 8m Width x 10m Depth x 3m Height.
 */
export const BEDROOM_SCENE: ScenePreset = {
    id: 'bedroom',
    label: 'Cyber-Loft',
    description: 'A compact high-rise apartment. Modern minimalist furniture, neon ambient lighting, and panoramic city views.',
    theme: 'city',
    previewColor: 'from-fuchsia-900 to-slate-950',

    preloadAssets: [
        'structure-wall-interior',
        'structure-floor-linoleum',
        'structure-ceiling',
        'structure-glass-partition',
        'prop-bed',
        'prop-desk-agency',
        'prop-monitor-triple',
        'prop-file-cabinet',
        'bush-fern',
        'prop-crate',
        'prop-server-rack',
        'prop-sofa'
    ],

    load: async (ctx, engine) => {
        // 1. Environment Synthesis (High-Contrast Night)
        ctx.atmosphere('night')
            .weather('clear')
            .time(23.8) // Deep midnight
            .light({
                dirIntensity: 0.05,
                ambientIntensity: 0.35,
                dirColor: '#8b5cf6'
            })
            .gravity(-9.81)
            .cameraPreset('side');

        if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

        // 2. Pass 1: Structural Enclosure (8m x 10m x 3.2m)
        // Architecture Rules: All terrestrial structures must pivot at floor level (Y=0).
        const width = 8.0;
        const depth = 10.0;
        const height = 3.2;

        const wallRot90 = new THREE.Euler(0, Math.PI / 2, 0);

        // Floor (Bedrock padding at Y=0)
        const floorId = ctx.spawn('structure-floor-linoleum', 0, 0, 0, { alignToBottom: true });
        ctx.modify(floorId, { scale: { x: 2.0, y: 1.0, z: 2.5 } }); // Covers 8x10

        // Ceiling (Y=3.2)
        const ceilId = ctx.spawn('structure-ceiling', 0, height, 0, { alignToBottom: false });
        ctx.modify(ceilId, { scale: { x: 2.0, y: 1.0, z: 2.5 } });

        // Wall North (Z = -5): Full-width Panoramic Window
        const windowId = ctx.spawn('structure-glass-partition', 0, 0, -depth / 2, { alignToBottom: true });
        ctx.modify(windowId, { scale: { x: 2.0, y: 0.65, z: 1.0 } }); // 8m wide, ~3.2m tall

        // Wall South (Z = 5): Solid Entry Wall
        const wallS = ctx.spawn('structure-wall-interior', 0, 0, depth / 2, { alignToBottom: true });
        ctx.modify(wallS, { scale: { x: 2.0, y: 0.65, z: 1.0 } });

        // Wall West (X = -4): Solid Side Wall
        const wallW = ctx.spawn('structure-wall-interior', -width / 2, 0, 0, { alignToBottom: true, rotation: wallRot90 });
        ctx.modify(wallW, { scale: { x: 2.5, y: 0.65, z: 1.0 } }); // 10m deep, 3.2m tall

        // Wall East (X = 4): Solid Side Wall
        const wallE = ctx.spawn('structure-wall-interior', width / 2, 0, 0, { alignToBottom: true, rotation: wallRot90 });
        ctx.modify(wallE, { scale: { x: 2.5, y: 0.65, z: 1.0 } });

        await yieldToMain();

        // 3. Pass 2: Furnishings & Layout (Zonal distribution)

        // Zone A: Sleeping (Back-Left)
        const bedId = ctx.spawn('prop-bed', -2.8, 0, 1.5, { alignToBottom: true, rotation: wallRot90 });
        ctx.modify(bedId, { scale: 1.1 });

        // Bio-Neon Glow (Magenta highlight)
        const bedLight = new THREE.PointLight(0xd946ef, 1.5, 8);
        bedLight.position.set(-3.5, 0.4, 1.5);
        engine.sys.scene.getScene().add(bedLight);

        // Zone B: Command/Logic (Front-Right)
        const deskX = 3.2;
        const deskZ = -3.0;
        const deskRot = new THREE.Euler(0, -Math.PI / 2, 0);

        ctx.spawn('prop-desk-agency', deskX, 0, deskZ, { alignToBottom: true, rotation: deskRot });
        ctx.spawn('prop-monitor-triple', deskX - 0.25, 0.75, deskZ, { alignToBottom: true, rotation: deskRot });
        ctx.spawn('prop-file-cabinet', deskX, 0, deskZ + 1.2, { alignToBottom: true, rotation: deskRot });
        ctx.spawn('prop-server-rack', -3.2, 0, -3.5, { alignToBottom: true, rotation: wallRot90 });

        // Task Lighting (Concentrated Cyan beam)
        const deskLight = new THREE.SpotLight(0x38bdf8, 12.0, 12, 0.35, 0.5, 1);
        deskLight.position.set(deskX, 3.0, deskZ);
        deskLight.target.position.set(deskX, 0.75, deskZ);
        engine.sys.scene.getScene().add(deskLight);
        engine.sys.scene.getScene().add(deskLight.target);

        // Zone C: Lounge (Near Window)
        const sofaId = ctx.spawn('prop-sofa', -1.5, 0, -2.5, { alignToBottom: true, rotation: new THREE.Euler(0, -0.4, 0) });

        await yieldToMain();

        // 4. Pass 3: Atmospheric Details

        // Hydroponic Flora
        ctx.spawn('bush-fern', -3.2, 0, 3.5, { alignToBottom: true, scale: 1.2 });
        ctx.spawn('hero-palm', 3.0, 0, 4.0, { alignToBottom: true, scale: 0.5 });

        // Storage clutter (Organized entropy)
        ctx.spawn('prop-crate', 3.5, 0, 2.5, { alignToBottom: true, scale: 0.7 });
        ctx.spawn('prop-cinderblock', 3.5, 0.7, 2.5, { alignToBottom: true, scale: 1.0 });

        // 5. Entrance Configuration (Industry Standard Player POV)
        engine.input.setMode('walk');

        // Spawn player inside the room, at the back, facing the large window and city horizon
        const cam = engine.sys.scene.getCamera();
        cam.position.set(0, 1.7, 4.5); // Near the south entry wall
        cam.lookAt(0, 1.6, -100);      // Fixed gaze toward the infinite skyline

        // Cinematic Establishing Shot
        engine.tweenCamera({
            pos: { x: 0, y: 1.8, z: 3.5 },
            lookAt: { x: 0, y: 1.6, z: -100 },
            duration: 3.0
        });
    }
};
