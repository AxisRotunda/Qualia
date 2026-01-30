
import { EngineService } from '../services/engine.service';
import { EntityLibraryService } from '../services/entity-library.service';

export interface ScenePreset {
  id: string;
  label: string;
  description: string;
  theme: 'city' | 'forest' | 'ice' | 'space' | 'default';
  previewColor: string;
  load: (engine: EngineService, lib: EntityLibraryService) => void;
  onUpdate?: (dt: number, totalTime: number, engine: EngineService) => void;
}
