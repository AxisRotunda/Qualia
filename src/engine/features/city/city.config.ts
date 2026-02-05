
export const CITY_CONFIG = {
    // Spatial Constants
    BLOCK_SIZE: 30, // Main city block size (meters)
    GRID_UNIT: 15,  // Sub-grid unit (Road segments are 15x15)

    // Verticality
    HIGHWAY_Y: 12,
    GROUND_Y: 0,

    // Traffic Simulation
    TRAFFIC: {
        COUNT: 250,
        BOUNDS_RADIUS: 320,
        MIN_SPEED: 28, // Slightly faster
        SPEED_VARIANCE: 15,
        HOVER_HEIGHT: 1.2,
        BOB_FREQ: 4.5,
        BOB_AMP: 0.12
    },

    // Assets
    ASSETS: {
        HIGHWAY_STRAIGHT: { id: 'terrain-highway', length: 30, width: 12, height: 1.5 },
        HIGHWAY_PILLAR: { id: 'prop-pillar-highway', width: 2, height: 12 },
        RAMP: { id: 'terrain-ramp', length: 30, width: 12, height: 12 },

        ROAD_STRAIGHT: { id: 'terrain-road', size: 15 },
        INTERSECTION: { id: 'terrain-intersection', size: 15 },

        BUILDING_SKYSCRAPER: { id: 'building-skyscraper', footprint: 15 },
        BUILDING_TALL: { id: 'building-tall', footprint: 10 },
        BUILDING_WIDE: { id: 'building-wide', footprint: 20 },
        BUILDING_SMALL: { id: 'building-small', footprint: 8 }
    }
};
