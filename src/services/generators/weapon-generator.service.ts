
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { WeaponDesignService } from './combat/weapon-design.service';

@Injectable({
    providedIn: 'root'
})
export class WeaponGeneratorService {
    private design = inject(WeaponDesignService);

    generateBlaster(): THREE.BufferGeometry | null {
        return this.design.generateBlaster();
    }

    generateHammer(): THREE.BufferGeometry | null {
        return this.design.generateHammer();
    }

    generateFist(): THREE.BufferGeometry | null {
        return this.design.generateFist();
    }

    generatePistol(): THREE.BufferGeometry | null {
        return this.design.generatePistol();
    }
}
