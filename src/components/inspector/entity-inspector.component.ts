
import { Component, inject, signal, effect } from '@angular/core';
import { EngineService } from '../../services/engine.service';
import { Transform, PhysicsProps } from '../../engine/core';
import { TransformPanelComponent } from './transform-panel.component';
import { PhysicsPanelComponent } from './physics-panel.component';

@Component({
  selector: 'app-entity-inspector',
  standalone: true,
  imports: [
      TransformPanelComponent, 
      PhysicsPanelComponent
  ],
  template: `
    <div class="space-y-4">
      <!-- Identity -->
      <div class="flex gap-2">
         <div class="relative flex-1">
            <span class="absolute left-2 top-1.5 material-symbols-outlined text-cyan-500 text-sm">data_object</span>
            <input type="text" 
                   [value]="entityName()" 
                   (change)="updateName($event)"
                   class="w-full bg-slate-950 border border-slate-800 rounded py-1 pl-7 pr-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors">
         </div>
         <button class="px-2 bg-rose-950/30 border border-rose-900/50 hover:bg-rose-900/50 text-rose-400 rounded transition-colors" 
                 title="Delete Entity"
                 (click)="deleteSelected()">
            <span class="material-symbols-outlined text-[18px]">delete</span>
         </button>
      </div>

      <!-- Transform Sub-Component (Editable) -->
      <app-transform-panel 
          [data]="transformSnapshot()" 
          (updatePos)="onPosUpdate($event)"
          (updateRot)="onRotUpdate($event)"
          (updateScale)="onScaleUpdate($event)"
      />

      <hr class="border-slate-800/50">

      <!-- Physics Sub-Component -->
      <app-physics-panel 
        [data]="physicsPropsSnapshot()"
        (update)="updatePhysics($event)"
      />
    </div>
  `
})
export class EntityInspectorComponent {
  engine = inject(EngineService);
  
  transformSnapshot = signal<Transform | null>(null);
  physicsPropsSnapshot = signal<PhysicsProps | null>(null);
  entityName = signal('');

  constructor() {
    effect(() => {
       const id = this.engine.selectedEntity();
       if (id === null) {
         this.transformSnapshot.set(null);
         this.physicsPropsSnapshot.set(null);
         this.entityName.set('');
         return;
       }
       
       this.refreshSnapshot(id);
    });
  }
  
  refreshSnapshot(id: number) {
       const t = this.engine.world.transforms.get(id);
       const p = this.engine.world.physicsProps.get(id);

       if (t) {
         this.transformSnapshot.set({
             position: { ...t.position },
             rotation: { ...t.rotation },
             scale: { ...t.scale }
         });
       }
       if (p) {
         this.physicsPropsSnapshot.set({ ...p });
       }
       this.entityName.set(this.engine.ops.getEntityName(id));
  }

  // --- Transform Updates ---

  onPosUpdate(pos: {x:number, y:number, z:number}) {
      const id = this.engine.selectedEntity();
      if (id !== null) {
          this.engine.transform.setEntityTransform(id, pos);
          this.refreshSnapshot(id); // Re-sync local signal
      }
  }

  onRotUpdate(rot: {x:number, y:number, z:number, w:number}) {
      const id = this.engine.selectedEntity();
      if (id !== null) {
          this.engine.transform.setEntityTransform(id, undefined, rot);
          this.refreshSnapshot(id);
      }
  }

  onScaleUpdate(scale: {x:number, y:number, z:number}) {
      const id = this.engine.selectedEntity();
      if (id !== null) {
          this.engine.transform.setEntityTransform(id, undefined, undefined, scale);
          this.refreshSnapshot(id);
      }
  }

  // --- Other Updates ---

  updateName(e: Event) {
      const val = (e.target as HTMLInputElement).value;
      const id = this.engine.selectedEntity();
      if (id !== null) {
          this.engine.ops.setEntityName(id, val);
      }
  }

  updatePhysics(event: {prop: 'friction' | 'restitution', value: number}) {
      const id = this.engine.selectedEntity();
      if(id===null) return;
      
      const props = this.engine.world.physicsProps.get(id);
      if(!props) return;
      
      const newProps = { ...props, [event.prop]: event.value };
      this.engine.ops.updateEntityPhysics(id, newProps);

      this.physicsPropsSnapshot.update(curr => curr ? ({ ...curr, [event.prop]: event.value }) : null);
  }

  deleteSelected() {
      const e = this.engine.selectedEntity();
      if (e !== null) this.engine.ops.deleteEntity(e);
  }
}
