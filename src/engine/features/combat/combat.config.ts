
export type WeaponType = 'blaster' | 'hammer' | 'fist' | 'pistol';

export type WeaponAnimationType = 'swing' | 'thrust' | 'recoil';

export const COMBAT_CONFIG = {
    WEAPONS: {
        'fist': {
            id: 'fist' as WeaponType,
            label: 'Pneumatic Fist',
            cooldown: 400,
            impulse: 400, // Tuned for 40kg crates (V~10m/s)
            damage: 25,
            range: 2.5,
            color: 0xffffff,
            energyCost: 0,
            shake: 0.08,
            haptic: 15,
            viewOffset: { x: 0.2, y: -0.25, z: -0.4 },
            viewScale: 0.4,
            swingTime: 300,
            hitTime: 150,
            animationType: 'thrust' as WeaponAnimationType
        },
        'pistol': {
            id: 'pistol' as WeaponType,
            label: 'Kinetic 9mm',
            cooldown: 120, 
            impulse: 180, // Snappy response on light props (V~4.5m/s on 40kg)
            damage: 15,
            color: 0xffcc00, 
            range: 150,
            energyCost: 4, 
            projectileSpeed: 380, 
            gravityScale: 1.0, 
            shellEject: true,
            shake: 0.06,
            haptic: 8,
            kickBack: 0.06,
            kickUp: 0.05,
            viewOffset: { x: 0.22, y: -0.28, z: -0.5 },
            viewScale: 0.6,
            swingTime: 0,
            hitTime: 0,
            animationType: 'recoil' as WeaponAnimationType
        },
        'blaster': { 
            id: 'blaster' as WeaponType, 
            label: 'Pulse Rifle', 
            cooldown: 140, 
            impulse: 600, // Heavy impact (V~15m/s on 40kg)
            damage: 40,
            color: 0x0ea5e9,
            range: 200,
            energyCost: 6, 
            projectileSpeed: 180, 
            gravityScale: 0.01, 
            shake: 0.08,
            haptic: [10, 5] as any, 
            kickBack: 0.1,
            kickUp: 0.06,
            viewOffset: { x: 0.28, y: -0.28, z: -0.6 },
            viewScale: 0.5,
            swingTime: 0,
            hitTime: 0,
            animationType: 'recoil' as WeaponAnimationType
        },
        'hammer': { 
            id: 'hammer' as WeaponType, 
            label: 'Breacher', 
            cooldown: 1500, 
            impulse: 8000, // Massive impulse (V~200m/s on 40kg - Instant launch)
            damage: 500, 
            range: 5.0,
            energyCost: 35,
            color: 0xf97316,
            shake: 0.45,
            haptic: 60,
            kickBack: 0.35,
            kickUp: 0.6,
            viewOffset: { x: 0.35, y: -0.4, z: -0.5 },
            viewScale: 0.65,
            swingTime: 850, 
            hitTime: 450,   
            animationType: 'swing' as WeaponAnimationType
        }
    },
    SYSTEMS: {
        RECHARGE_RATE: 20.0, 
        RECHARGE_DELAY: 0.8, 
    },
    VIEW_MODEL: {
        SWAY_AMOUNT: 0.045,
        SWAY_SMOOTHING: 12.0,
        BOB_FREQ: 11.5,
        BOB_AMP: 0.012,
        RECOIL_RETURN: 0.12,
        RECOIL_SNAP: 0.45
    },
    VFX: {
        SPARK_LIFETIME: 0.5,
        FLASH_LIFETIME: 0.08,
        MAX_SPARKS: 1200,
        MAX_FLASHES: 64,
        MAX_SHELLS: 32
    }
};
