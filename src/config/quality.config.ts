/**
 * Quality Configuration
 * Defines material and rendering quality levels for different device capabilities
 *
 * @scope Graphics Pipeline
 * @source src/config/quality.config.ts
 */

export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

/**
 * Material quality settings for Physical materials
 * Controls expensive features like clearcoat, transmission, and anisotropy
 */
export interface MaterialQualitySettings {
    // Core PBR features
    clearcoat: number;
    clearcoatRoughness: number;
    transmission: number;
    thickness: number;
    ior: number;
    reflectivity: number;

    // Advanced features
    anisotropy: number;
    attenuationColor: boolean;
    attenuationDistance: boolean;

    // Texture quality
    textureSize: number;
    normalMapEnabled: boolean;
    displacementMapEnabled: boolean;
    roughnessMapEnabled: boolean;
    metalnessMapEnabled: boolean;

    // Shadow quality
    shadowMapSize: number;
    shadowBias: number;
}

/**
 * Post-processing quality settings
 */
export interface PostProcessQualitySettings {
    bloom: {
        enabled: boolean;
        strength: number;
        radius: number;
        threshold: number;
        iterations: number;
    };

    ambientOcclusion: {
        enabled: boolean;
        samples: number;
        radius: number;
        intensity: number;
    };

    screenSpaceReflections: {
        enabled: boolean;
        maxSteps: number;
        binarySearchSteps: number;
    };

    toneMapping: {
        toneMapping: 'none' | 'linear' | 'reinhard' | 'cineon' | 'acesFilmic';
        exposure: number;
    };
}

/**
 * Rendering quality settings
 */
export interface RenderingQualitySettings {
    antialias: boolean;
    pixelRatio: number;
    shadows: boolean;
    softShadows: boolean;

    // Instancing
    maxInstances: number;

    // Culling
    frustumCulling: boolean;
    occlusionCulling: boolean;

    // LOD
    lodBias: number;

    // Texture anisotropy
    anisotropy: number;
}

/**
 * Complete quality configuration for each level
 */
export const QUALITY_SETTINGS: Record<QualityLevel, {
    materials: MaterialQualitySettings;
    postProcess: PostProcessQualitySettings;
    rendering: RenderingQualitySettings;
}> = {
    low: {
        materials: {
            clearcoat: 0,
            clearcoatRoughness: 0.5,
            transmission: 0,
            thickness: 1.0,
            ior: 1.5,
            reflectivity: 0.5,
            anisotropy: 0,
            attenuationColor: false,
            attenuationDistance: false,
            textureSize: 512,
            normalMapEnabled: true,
            displacementMapEnabled: false,
            roughnessMapEnabled: true,
            metalnessMapEnabled: true,
            shadowMapSize: 1024,
            shadowBias: -0.0005
        },
        postProcess: {
            bloom: {
                enabled: false,
                strength: 0,
                radius: 0,
                threshold: 1.0,
                iterations: 0
            },
            ambientOcclusion: {
                enabled: false,
                samples: 0,
                radius: 0,
                intensity: 0
            },
            screenSpaceReflections: {
                enabled: false,
                maxSteps: 0,
                binarySearchSteps: 0
            },
            toneMapping: {
                toneMapping: 'linear',
                exposure: 1.0
            }
        },
        rendering: {
            antialias: false,
            pixelRatio: 1.0,
            shadows: true,
            softShadows: false,
            maxInstances: 512,
            frustumCulling: true,
            occlusionCulling: false,
            lodBias: 0.5,
            anisotropy: 4
        }
    },

    medium: {
        materials: {
            clearcoat: 0.3,
            clearcoatRoughness: 0.3,
            transmission: 0.5,
            thickness: 1.5,
            ior: 1.5,
            reflectivity: 0.7,
            anisotropy: 0.5,
            attenuationColor: false,
            attenuationDistance: false,
            textureSize: 1024,
            normalMapEnabled: true,
            displacementMapEnabled: true,
            roughnessMapEnabled: true,
            metalnessMapEnabled: true,
            shadowMapSize: 2048,
            shadowBias: -0.0002
        },
        postProcess: {
            bloom: {
                enabled: true,
                strength: 0.3,
                radius: 0.1,
                threshold: 1.0,
                iterations: 4
            },
            ambientOcclusion: {
                enabled: true,
                samples: 16,
                radius: 0.5,
                intensity: 0.5
            },
            screenSpaceReflections: {
                enabled: false,
                maxSteps: 32,
                binarySearchSteps: 6
            },
            toneMapping: {
                toneMapping: 'acesFilmic',
                exposure: 1.25
            }
        },
        rendering: {
            antialias: true,
            pixelRatio: 1.0,
            shadows: true,
            softShadows: true,
            maxInstances: 1024,
            frustumCulling: true,
            occlusionCulling: false,
            lodBias: 0.25,
            anisotropy: 8
        }
    },

    high: {
        materials: {
            clearcoat: 0.7,
            clearcoatRoughness: 0.1,
            transmission: 0.9,
            thickness: 2.0,
            ior: 1.5,
            reflectivity: 1.0,
            anisotropy: 0.7,
            attenuationColor: true,
            attenuationDistance: true,
            textureSize: 2048,
            normalMapEnabled: true,
            displacementMapEnabled: true,
            roughnessMapEnabled: true,
            metalnessMapEnabled: true,
            shadowMapSize: 4096,
            shadowBias: -0.0001
        },
        postProcess: {
            bloom: {
                enabled: true,
                strength: 0.45,
                radius: 0.1,
                threshold: 1.05,
                iterations: 8
            },
            ambientOcclusion: {
                enabled: true,
                samples: 32,
                radius: 0.5,
                intensity: 0.7
            },
            screenSpaceReflections: {
                enabled: true,
                maxSteps: 64,
                binarySearchSteps: 8
            },
            toneMapping: {
                toneMapping: 'acesFilmic',
                exposure: 1.25
            }
        },
        rendering: {
            antialias: true,
            pixelRatio: 1.5,
            shadows: true,
            softShadows: true,
            maxInstances: 2048,
            frustumCulling: true,
            occlusionCulling: true,
            lodBias: 0,
            anisotropy: 16
        }
    },

    ultra: {
        materials: {
            clearcoat: 1.0,
            clearcoatRoughness: 0.02,
            transmission: 1.0,
            thickness: 3.0,
            ior: 1.5,
            reflectivity: 1.0,
            anisotropy: 1.0,
            attenuationColor: true,
            attenuationDistance: true,
            textureSize: 4096,
            normalMapEnabled: true,
            displacementMapEnabled: true,
            roughnessMapEnabled: true,
            metalnessMapEnabled: true,
            shadowMapSize: 8192,
            shadowBias: -0.00005
        },
        postProcess: {
            bloom: {
                enabled: true,
                strength: 0.5,
                radius: 0.15,
                threshold: 1.0,
                iterations: 16
            },
            ambientOcclusion: {
                enabled: true,
                samples: 64,
                radius: 0.5,
                intensity: 0.8
            },
            screenSpaceReflections: {
                enabled: true,
                maxSteps: 128,
                binarySearchSteps: 10
            },
            toneMapping: {
                toneMapping: 'acesFilmic',
                exposure: 1.25
            }
        },
        rendering: {
            antialias: true,
            pixelRatio: 2.0,
            shadows: true,
            softShadows: true,
            maxInstances: 4096,
            frustumCulling: true,
            occlusionCulling: true,
            lodBias: -0.25,
            anisotropy: 16
        }
    }
};

/**
 * Auto-detect quality level based on device capabilities
 */
export function detectQualityLevel(): QualityLevel {
    // Check for mobile/tablet
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const screenWidth = window.innerWidth;

    // Check WebGL capabilities
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

    if (!gl) {
        return 'low'; // Fallback for no WebGL
    }

    // Get GPU info if available
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    let gpuTier = 'unknown';

    if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);

        // Detect high-end GPUs
        const highEndGPUs = /(RTX|GTX 1[0-9]|Radeon RX [0-9]{4}|M1|M2|M3)/i;
        const midEndGPUs = /(GTX [0-9]{3}|Radeon RX [0-9]{3}|Intel Iris)/i;

        if (highEndGPUs.test(renderer)) {
            gpuTier = 'high';
        } else if (midEndGPUs.test(renderer)) {
            gpuTier = 'medium';
        } else {
            gpuTier = 'low';
        }
    }

    // Decision matrix
    if (isMobile || isTouch || screenWidth < 768) {
        return gpuTier === 'high' ? 'medium' : 'low';
    }

    if (screenWidth >= 1920 && gpuTier === 'high') {
        return 'high';
    }

    if (gpuTier === 'high') {
        return 'high';
    } else if (gpuTier === 'medium') {
        return 'medium';
    }

    return 'low';
}

/**
 * Get quality settings for current level
 */
export function getQualitySettings(level?: QualityLevel): typeof QUALITY_SETTINGS['high'] {
    const detectedLevel = level || detectQualityLevel();
    return QUALITY_SETTINGS[detectedLevel];
}
