/**
 * Label Mapper Utility
 * Provides human-friendly alternatives for technical/machinistic labels
 */

export interface LabelMapping {
  // Scene count display
  availablePresets: string;
  
  // Gravity descriptions
  gravity: {
    zero: string;
    low: string;
    normal: string;
  };
  
  // Theme descriptions
  theme: {
    [key: string]: string;
  };
  
  // Scene name enhancements
  sceneNames: {
    [key: string]: string;
  };
}

/**
 * Human-friendly label mappings
 */
export const LABEL_MAPPING: LabelMapping = {
  availablePresets: 'Available Worlds',
  
  gravity: {
    zero: 'Zero Gravity',
    low: 'Low Gravity',
    normal: 'Normal Gravity'
  },
  
  theme: {
    city: 'Urban',
    forest: 'Nature',
    ice: 'Arctic',
    space: 'Cosmic',
    desert: 'Arid'
  },
  
  sceneNames: {
    'city': 'Urban Jungle',
    'forest': 'Ancient Woods',
    'orbit': 'Space Station',
    'ice': 'Frozen Tundra',
    'desert': 'Desert Oasis',
    'debug': 'Debug Lab',
    'bedroom': 'Cozy Room',
    'medieval-citadel': 'Medieval Citadel',
    'fallout': 'Fallout Zone',
    'abyssal-reach': 'Abyssal Reach',
    'park-volcano': 'Volcanic Park',
    'eden-complex': 'Eden Complex',
    'neural-array': 'Neural Array',
    'factory': 'Industrial Factory',
    'mountain-summit': 'Mountain Summit',
    'water': 'Water World',
    'elevator': 'Elevator Shaft',
    'agency': 'Agency HQ',
    'spaceship': 'Starship',
    'interior': 'Interior Space',
    'particles': 'Particle Playground'
  }
};

/**
 * Get human-friendly gravity label
 */
export function getGravityLabel(id: string, theme: string): string {
  if (theme === 'space') return LABEL_MAPPING.gravity.zero;
  if (id.includes('moon')) return LABEL_MAPPING.gravity.low;
  return LABEL_MAPPING.gravity.normal;
}

/**
 * Get human-friendly theme label
 */
export function getThemeLabel(theme: string): string {
  return LABEL_MAPPING.theme[theme] || theme;
}

/**
 * Get enhanced scene name
 */
export function getEnhancedSceneName(id: string, currentLabel: string): string {
  return LABEL_MAPPING.sceneNames[id] || currentLabel;
}