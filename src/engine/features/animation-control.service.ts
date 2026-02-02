
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { EntityStoreService } from '../ecs/entity-store.service';
import { Entity } from '../core';
import { NullShield } from '../utils/string.utils';

export type StandardClip = 'idle' | 'walk' | 'run' | 'jump' | 'interact' | 'action';

@Injectable({
  providedIn: 'root'
})
export class AnimationControlService {
  private entityStore = inject(EntityStoreService);

  /**
   * Initializes animation component for an entity from a list of clips.
   */
  initAnimations(entity: Entity, root: THREE.Object3D, clips: THREE.AnimationClip[]) {
      const mixer = new THREE.AnimationMixer(root);
      const actions = new Map<string, THREE.AnimationAction>();

      // RUN_OPT: Standard loop for initialization
      for (let i = 0; i < clips.length; i++) {
          const clip = clips[i];
          const action = mixer.clipAction(clip);
          // Standardized performance: enable culling from start
          action.setEffectiveWeight(1.0);
          action.enabled = true;
          // Normalize names for consistent lookups
          actions.set(clip.name.toLowerCase(), action);
      }

      this.entityStore.world.animations.add(entity, {
          mixer,
          actions,
          activeActionName: undefined
      });
  }

  /**
   * Cross-fades to a new animation clip.
   * RUN_REPAIR: Hardened against null clip names.
   */
  play(entity: Entity, clipName: StandardClip | string, duration: number = 0.3) {
      const safeName = NullShield.safeLowerCase(clipName);
      if (!safeName) return;

      const anim = this.entityStore.world.animations.get(entity);
      if (!anim) return;

      // RUN_OPT: Early exit if already playing
      if (anim.activeActionName === safeName) return;

      const nextAction = anim.actions.get(safeName);
      if (!nextAction) return;

      const prevName = anim.activeActionName;
      if (prevName) {
          const prevAction = anim.actions.get(prevName);
          if (prevAction) {
              nextAction.reset();
              nextAction.enabled = true;
              nextAction.setEffectiveTimeScale(1);
              nextAction.setEffectiveWeight(1);
              nextAction.crossFadeFrom(prevAction, duration, true);
              nextAction.play();
          } else {
              // Fallback logic if previous action is corrupted
              nextAction.reset().play();
          }
      } else {
          nextAction.reset().play();
      }

      anim.activeActionName = safeName;
  }

  /**
   * Sets the playback speed for an entity's animations.
   */
  setTimeScale(entity: Entity, scale: number) {
      const anim = this.entityStore.world.animations.get(entity);
      if (anim) anim.mixer.timeScale = scale;
  }

  /**
   * Force stops all animations for an entity.
   */
  stopAll(entity: Entity) {
      const anim = this.entityStore.world.animations.get(entity);
      if (anim) {
          anim.mixer.stopAllAction();
          anim.activeActionName = undefined;
      }
  }
}
