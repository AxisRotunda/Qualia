
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { ActorDesignService } from './actor/actor-design.service';

@Injectable({
    providedIn: 'root'
})
export class ActorGeneratorService {
    private design = inject(ActorDesignService);

    generateRobotActor(): THREE.BufferGeometry | null {
        return this.design.generateRobotActor();
    }

    generateIceGolem(): THREE.BufferGeometry | null {
        return this.design.generateIceGolem();
    }

    generatePenguin(): THREE.BufferGeometry | null {
        return this.design.generatePenguin();
    }
}
