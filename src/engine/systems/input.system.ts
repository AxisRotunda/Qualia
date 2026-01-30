
import { Injectable, inject } from '@angular/core';
import { GameSystem } from '../system';
import { InputManagerService } from '../input-manager.service';
import { ObjectManipulationService } from '../features/object-manipulation.service';

@Injectable({ providedIn: 'root' })
export class InputSystem implements GameSystem {
  readonly priority = 0;
  private inputManager = inject(InputManagerService);
  private objectControl = inject(ObjectManipulationService);

  update(dt: number): void {
    this.inputManager.update(dt);
    this.objectControl.update(dt / 1000); 
  }
}
