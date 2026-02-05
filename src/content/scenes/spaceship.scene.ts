import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';

export const SPACESHIP_SCENE: ScenePreset = {
    id: 'spaceship-envoy',
    label: 'Envoy Vessel',
    description: 'A massive exploration ship orbiting a red giant star.',
    theme: 'space',
    previewColor: 'from-orange-700 to-amber-900',

    preloadAssets: [
        'gen-scifi-hub',
        'gen-scifi-corridor',
        'prop-sensor-unit'
    ],

    load: (ctx, engine) => {
        ctx.atmosphere('space')
            .weather('clear')
            .light({
                dirIntensity: 2.0,
                ambientIntensity: 0.2,
                dirColor: '#ff8800'
            })
            .time(16)
            .gravity(-5.0);

        if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

        // FIX: Access subsystems through sys
        const physicsFactory = engine.sys.physicsFactory;
        const assetService = engine.sys.assets;

        const spawnStructure = (id: string, x: number, y: number, z: number, rotationY = 0) => {
            const pos = new THREE.Vector3(x, y + 4, z);
            const rot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotationY);

            // FIX: Access visuals factory through sys
            const mesh = engine.sys.visualsFactory.createMesh({
                type: 'box', bodyType: 'dynamic', handle: -1, position: pos, rotation: { x: rot.x, y: rot.y, z: rot.z, w: rot.w }
            }, { meshId: id });

            // FIX: Access scene graph through sys
            if (mesh instanceof THREE.Mesh) engine.sys.graph.addEntity(mesh);

            const geo = assetService.getGeometry(id);
            const bodyDef = physicsFactory.createTrimeshFromGeometry(geo, pos.x, pos.y, pos.z);

            // FIX: Access physics service through sys
            engine.sys.physics.world.updateBodyTransform(bodyDef.handle, pos, { x: rot.x, y: rot.y, z: rot.z, w: rot.w });

            const entity = engine.world.createEntity();
            engine.world.rigidBodies.add(entity, bodyDef.handle);
            engine.world.meshes.add(entity, { mesh: mesh as THREE.Mesh });
            engine.world.transforms.add(entity, { position: pos, rotation: { x: rot.x, y: rot.y, z: rot.z, w: rot.w }, scale: { x: 1, y: 1, z: 1 } });
            engine.world.bodyDefs.add(entity, bodyDef);
            engine.world.names.add(entity, `Hull Segment ${entity}`);
            engine.entityMgr.objectCount.update(c => c + 1);
        };

        const bridgeZ = -24;
        spawnStructure('gen-scifi-hub', 0, 0, bridgeZ);

        for (let i = 0; i < 4; i++) {
            spawnStructure('gen-scifi-corridor', 0, 0, bridgeZ + 15 + (i * 12));
        }

        const crossZ = bridgeZ + 15 + 12;
        spawnStructure('gen-scifi-corridor', -12, 0, crossZ, Math.PI / 2);
        spawnStructure('gen-scifi-corridor', 12, 0, crossZ, Math.PI / 2);

        spawnStructure('gen-scifi-hub', -24, 0, crossZ);
        spawnStructure('gen-scifi-hub', 24, 0, crossZ);

        ctx.spawn('prop-sensor-unit', 0, 2, bridgeZ);
        ctx.spawn('shape-sphere-lg', 0, 5, bridgeZ);

        for (let i = 0; i < 5; i++) {
            ctx.spawn('prop-crate', -24 + (Math.random() - 0.5) * 8, 1, crossZ + (Math.random() - 0.5) * 8);
            ctx.spawn('prop-barrel', 24 + (Math.random() - 0.5) * 8, 1, crossZ + (Math.random() - 0.5) * 8);
        }

        engine.input.setMode('walk');
        // FIX: Access scene service through sys
        const cam = engine.sys.scene.getCamera();
        cam.position.set(0, 2, 0);
        cam.lookAt(0, 2, bridgeZ);
    }
};
