
import { EngineService } from '../services/engine.service';
import { SceneContext } from '../engine/level/scene-context';

export interface ScenePreset {
  id: string;
  label: string;
  description: string;
  theme: 'city' | 'forest' | 'ice' | 'space' | 'default';
  previewColor: string;
  // load now takes SceneContext for a cleaner API, but we keep engine for backward compatibility if needed in complex scenes
  load: (ctx: SceneContext, engine: EngineService) => Promise<void> | void;
  onUpdate?: (dt: number, totalTime: number, engine: EngineService) => void;
}
