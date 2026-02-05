import * as THREE from 'three';
import { ScenePreset } from '../../data/scene-types';
import { Entity } from '../../engine/core';

// State for the elevator
let shaftEntity: Entity | null = null;
let currentDepth = 0;
let targetDepth = 0;
let velocity = 0;
const ACCEL = 5.0;
const MAX_SPEED = 15.0;
const MAX_DEPTH = 400;

let btnUpEntity: Entity | null = null;
let btnDownEntity: Entity | null = null;
let statusLight: THREE.PointLight | null = null;

export const ELEVATOR_SCENE: ScenePreset = {
    id: 'elevator-deep',
    label: 'Deep Descent',
    description: 'A functional elevator descending into the crust. Kinematic platforms allow physical traversal.',
    theme: 'city',
    previewColor: 'from-gray-800 to-black',

    preloadAssets: [
        'structure-elevator-cabin',
        'structure-elevator-shaft',
        'prop-elevator-button',
        'mat-concrete'
    ],

    load: async (ctx, engine) => {
        // Reset State
        currentDepth = 0;
        targetDepth = 0;
        velocity = 0;
        shaftEntity = null;

        ctx.atmosphere('night')
            .weather('clear')
            .light({
                dirIntensity: 0.0,
                ambientIntensity: 0.1,
                dirColor: '#000000'
            })
            .gravity(-9.81);

        // Cabin Light
        const cabinLight = new THREE.PointLight(0xffffff, 0.8, 8);
        cabinLight.position.set(0, 2.8, 0);
        // FIX: Access scene service through sys
        engine.sys.scene.getScene().add(cabinLight);

        // Status Light
        statusLight = new THREE.PointLight(0x22c55e, 1.0, 3);
        statusLight.position.set(1.2, 1.5, 1.3);
        // FIX: Access scene service through sys
        engine.sys.scene.getScene().add(statusLight);

        if (!engine.texturesEnabled()) engine.viewport.toggleTextures();

        // 1. Spawn Static Cabin (Origin)
        ctx.spawn('structure-elevator-cabin', 0, 1.5, 0);

        // 2. Spawn Controls
        const rot = new THREE.Euler(-Math.PI / 4, 0, 0);
        btnUpEntity = ctx.spawn('prop-elevator-button', 1.1, 1.35, 1.4, { rotation: rot });
        const bUpMesh = engine.world.meshes.get(btnUpEntity);
        if (bUpMesh) (bUpMesh.mesh.material as THREE.MeshStandardMaterial).color.setHex(0x22c55e);
        engine.ops.setEntityName(btnUpEntity, 'CALL UP');

        btnDownEntity = ctx.spawn('prop-elevator-button', 1.3, 1.35, 1.4, { rotation: rot });
        engine.ops.setEntityName(btnDownEntity, 'CALL DOWN');

        // 3. Spawn Moving Shaft (Kinematic)
        // We use structure-elevator-shaft which has a trimesh collider
        shaftEntity = ctx.spawn('structure-elevator-shaft', 0, -200, 0);

        // Upgrade to KinematicPositionBased to allow programmatic movement via KinematicSystem
        const rb = engine.world.rigidBodies.get(shaftEntity);
        if (rb) {
            // FIX: Access physics service through sys
            const body = engine.sys.physics.rWorld?.getRigidBody(rb.handle);
            if (body) {
                body.setBodyType(2, true); // 2 = KinematicPositionBased in Rapier
            }
        }

        // Add Kinematic Controller Component
        engine.world.kinematicControllers.add(shaftEntity, {
            targetPosition: { x: 0, y: -200, z: 0 },
            targetRotation: { x: 0, y: 0, z: 0, w: 1 }
        });

        // 4. Decoration
        const agencyFloor = new THREE.Mesh(
            new THREE.BoxGeometry(20, 1, 20),
            new THREE.MeshStandardMaterial({ color: 0x334155 })
        );
        agencyFloor.position.set(0, 200, 0);
        const shaftMesh = engine.world.meshes.get(shaftEntity);
        if (shaftMesh) shaftMesh.mesh.add(agencyFloor);

        engine.input.setMode('walk');
        // FIX: Access scene service through sys
        const cam = engine.sys.scene.getCamera();
        cam.position.set(0, 1.6, 0);
        cam.lookAt(0, 1.6, -1);
    },

    onUpdate: (dt, totalTime, engine) => {
        // Interaction Logic
        const selected = engine.entityMgr.selectedEntity();
        if (selected === btnUpEntity) {
            targetDepth = 0;
            engine.entityMgr.selectedEntity.set(null);
        } else if (selected === btnDownEntity) {
            targetDepth = MAX_DEPTH;
            engine.entityMgr.selectedEntity.set(null);
        }

        // Movement Logic
        const diff = targetDepth - currentDepth;
        const dist = Math.abs(diff);

        if (dist > 0.1) {
            const dir = Math.sign(diff);

            if (dist < 20) {
                velocity = Math.max(0.5, velocity * 0.95);
            } else {
                velocity = Math.min(MAX_SPEED, velocity + (ACCEL * (dt / 1000)));
            }

            currentDepth += dir * velocity * (dt / 1000);

            if (statusLight) {
                statusLight.color.setHex(0xf59e0b);
                statusLight.intensity = 1.0 + Math.sin(totalTime * 0.01) * 0.5;
            }
        } else {
            velocity = 0;
            currentDepth = targetDepth;
            if (statusLight) statusLight.color.setHex(0x22c55e);
        }

        // Update Kinematic Target
        if (shaftEntity !== null) {
            const controller = engine.world.kinematicControllers.get(shaftEntity);
            if (controller) {
                controller.targetPosition.y = -200 + currentDepth;
            }
        }
    }
};
