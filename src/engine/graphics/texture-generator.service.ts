
import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { NatureTextureService } from './textures/nature-texture.service';
import { PatternTextureService } from './textures/pattern-texture.service';
import { TechTextureService } from './textures/tech-texture.service';

@Injectable({
  providedIn: 'root'
})
export class TextureGeneratorService {
  public nature = inject(NatureTextureService);
  public pattern = inject(PatternTextureService);
  public tech = inject(TechTextureService);

  createNoiseTexture(colorHex: string, intensity: number, scale = 1): THREE.Texture {
    return this.nature.createNoiseTexture(colorHex, intensity, scale);
  }

  createIceTexture(): THREE.Texture {
    return this.nature.createIceTexture();
  }

  createWaterNormal(scale = 1): THREE.Texture {
    return this.nature.createWaterNormal(scale);
  }

  // --- New PBR Bridges ---
  createRockNormal(scale = 1): THREE.Texture {
    return this.nature.createRockNormal(scale);
  }

  createBarkNormal(scale = 1): THREE.Texture {
    return this.nature.createBarkNormal(scale);
  }
  // ---------------------

  createGridTexture(bgHex: string, lineHex: string, segments = 8, scale = 1): THREE.Texture {
    return this.pattern.createGridTexture(bgHex, lineHex, segments, scale);
  }

  createBrickTexture(brickHex: string, mortarHex: string, scale = 1): THREE.Texture {
    return this.pattern.createBrickTexture(brickHex, mortarHex, scale);
  }

  createMarbleTexture(baseHex: string, veinHex: string, scale = 1): THREE.Texture {
    return this.pattern.createMarbleTexture(baseHex, veinHex, scale);
  }

  createCarpetTexture(colorHex: string, patternHex: string): THREE.Texture {
    return this.pattern.createCarpetTexture(colorHex, patternHex);
  }

  createCityWindowTexture(density = 4): THREE.Texture {
    // Darker colors for Frame and Glass to prevent washout
    return this.pattern.createCityWindowTexture('#111111', '#050510', '#ffd7a0', density);
  }

  createCityWindowNormal(density = 4): THREE.Texture {
    return this.pattern.createCityWindowNormal(density);
  }

  createTechScreenCode(baseHex: string, textHex: string): THREE.Texture {
    return this.tech.createTechScreenCode(baseHex, textHex);
  }

  createTechScreenMap(): THREE.Texture {
    return this.tech.createTechScreenMap();
  }

  createServerRackTexture(): THREE.Texture {
    return this.tech.createServerRackTexture();
  }
}