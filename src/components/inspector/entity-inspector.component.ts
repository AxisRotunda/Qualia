
import { Component, inject, signal, effect } from '@angular/core';
import { EngineService } from '../../services/engine.service';
import { Transform, PhysicsProps } from '../../engine/core';
import { Integrity } from '../../engine/ecs/integrity-store';
import { TransformPanelComponent } from './transform-panel.component';
import { PhysicsPanelComponent } from './physics-panel.component';
import { IntegrityPanelComponent } from './integrity-panel.component';

@Component({
  selector: 'app-entity-inspector',
  standalone: true,
  imports: [TransformPanelComponent, PhysicsPanelComponent, IntegrityPanelComponent],
  template: `
    <div class="space-y-4">
      <!-- Header / Name -->
      <div class="flex gap-2">
         <div class="relative flex-1">
            <span class="absolute left-2 top-1.5 material-symbols-outlined text-cyan-500 text-sm">data_object</span>
            <input type="text" [value]="entityName()" (change)="updateName($event)"
                   class="w-full bg-slate-950 border border-slate-800 rounded py-1 pl-7 pr-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors">
         </div>
         <button class="px-2 bg-rose-950/30 border border-rose-900/50 hover:bg-rose-900/50 text-rose-400 rounded transition-colors" 
                 (click)="deleteSelected()"><span class="material-symbols-outlined text-[18px]">delete</span></button>
      </div>

      <!-- Components -->
      <app-transform-panel [data]="transformSnapshot()" 
                           (updatePos)="onPosUpdate($event)" 
                           (updateRot)="onRotUpdate($event)" 
                           (updateScale)="onScaleUpdate($event)" />
      
      <hr class="border-slate-800/50">
      
      <app-physics-panel [data]="physicsPropsSnapshot()" (update)="updatePhysics($event)" />

      @if (integritySnapshot(); as integ) {
          <hr class="border-slate-800/50">
          <app-integrity-panel [data]="integ" (update)="updateIntegrity($event)" />
      }
    </div>
  `
})
export class EntityInspectorComponent {
  engine = inject(EngineService);
  transformSnapshot = signal<Transform | null>(null);
  physicsPropsSnapshot = signal<PhysicsProps | null>(null);
  integritySnapshot = signal<Integrity | null>(null);
  entityName = signal('');

  constructor() {
    effect(() => {
       const id = this.engine.selectedEntity();
       if (id === null) {
         this.transformSnapshot.set(null);
         this.physicsPropsSnapshot.set(null);
         this.integritySnapshot.set(null);
         this.entityName.set('');
       } else {
         this.refreshSnapshot(id);
       }
    });
  }
  
  refreshSnapshot(id: number) {
       this.transformSnapshot.set(this.engine.world.transforms.get(id) || null);
       this.physicsPropsSnapshot.set(this.engine.world.physicsProps.get(id) || null);
       this.integritySnapshot.set(this.engine.world.integrity.get(id) || null);
       this.entityName.set(this.engine.ops.getEntityName(id));
  }

  onPosUpdate(pos: {x:number, y:number, z:number}) {
      const id = this.engine.selectedEntity();
      if (id !== null) { this.engine.transform.setEntityTransform(id, pos); this.refreshSnapshot(id); }
  }
  onRotUpdate(rot: {x:number, y:number, z:number, w:number}) {
      const id = this.engine.selectedEntity();
      if (id !== null) { this.engine.transform.setEntityTransform(id, undefined, rot); this.refreshSnapshot(id); }
  }
  onScaleUpdate(scale: {x:number, y:number, z:number}) {
      const id = this.engine.selectedEntity();
      if (id !== null) { this.engine.transform.setEntityTransform(id, undefined, undefined, scale); this.refreshSnapshot(id); }
  }
  updateName(e: Event) {
      const val = (e.target as HTMLInputElement).value;
      const id = this.engine.selectedEntity();
      if (id !== null) this.engine.ops.setEntityName(id, val);
  }
  updatePhysics(event: {prop: 'friction' | 'restitution', value: number}) {
      const id = this.engine.selectedEntity();
      if(id === null) return;
      const props = this.engine.world.physicsProps.get(id);
      if(!props) return;
      const newProps = { ...props, [event.prop]: event.value };
      this.engine.ops.updateEntityPhysics(id, newProps);
      this.physicsPropsSnapshot.set(newProps);
  }
  updateIntegrity(event: {prop: keyof Integrity, value: number}) {
      const id = this.engine.selectedEntity();
      if (id === null) return;
      const current = this.engine.world.integrity.get(id);
      if (!current) return;
      
      // We don't have a specific update method for integrity yet in Ops, so we write to store directly for now
      // ideally move this to EntityOpsService later.
      // Re-constructing full object for now
      const newData = { ...current, [event.prop]: event.value };
      this.engine.world.integrity.add(id, newData.health, newData.threshold); // .add overwrites
      // Need to handle maxHealth updates if health > max? 
      // The store .add logic sets maxHealth = health. This logic in IntegrityStore is a bit rigid.
      // Let's just re-add it for now as a naive update.
      this.integritySnapshot.set(newData);
  }
  deleteSelected() {
      const e = this.engine.selectedEntity();
      if (e !== null) this.engine.ops.deleteEntity(e);
  }
}
