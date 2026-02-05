
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { TextureWorkerService } from './texture-worker.service';

@Injectable({
    providedIn: 'root'
})
export class PatternTextureService {
    private worker = inject(TextureWorkerService);

    private createAsyncTexture(type: string, params: any, scale = 1, isData = false): THREE.Texture {
        const placeholder = document.createElement('canvas');
        placeholder.width = 4; placeholder.height = 4;
        const tex = new THREE.CanvasTexture(placeholder);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(scale, scale);

        tex.colorSpace = isData ? THREE.LinearSRGBColorSpace : THREE.SRGBColorSpace;
        tex.anisotropy = 16;

        this.worker.generate(type, params).then(bitmap => {
            tex.image = bitmap;
            tex.needsUpdate = true;
        });
        return tex;
    }

    createGridTexture(bgHex: string, lineHex: string, segments = 8, scale = 1): THREE.Texture {
        return this.createAsyncTexture('grid', { bgHex, lineHex, segments, size: 512 }, scale);
    }

    createBrickTexture(brickHex: string, mortarHex: string, scale = 1): THREE.Texture {
        return this.createAsyncTexture('brick', { brickHex, mortarHex, size: 512 }, scale);
    }

    createMarbleTexture(baseHex: string, veinHex: string, scale = 1): THREE.Texture {
        return this.createAsyncTexture('marble', { baseHex, veinHex, size: 1024 }, scale);
    }

    createCarpetTexture(colorHex: string, patternHex: string): THREE.Texture {
        return this.createAsyncTexture('carpet', { colorHex, patternHex, size: 512 }, 4);
    }

    createCityWindowTexture(frameHex: string, glassHex: string, litHex: string, density = 4): THREE.Texture {
        return this.createAsyncTexture('city-window', { frameHex, glassHex, litHex, density, size: 512 }, 1);
    }

    createCityWindowNormal(density = 4): THREE.Texture {
    // Normal map is linear data
        return this.createAsyncTexture('city-window-normal', { density, size: 512 }, 1, true);
    }
}
