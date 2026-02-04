import { BUILDING_TEMPLATES } from './templates/buildings';
import { PROP_TEMPLATES } from './templates/props';
import { NATURE_TEMPLATES } from './templates/nature';
import { SHAPE_TEMPLATES } from './templates/shapes';
import { EntityTemplate } from './entity-types';

export type { EntityTemplate, EntityCategory } from './entity-types';

export const ENTITY_TEMPLATES: EntityTemplate[] = [
    ...BUILDING_TEMPLATES,
    ...PROP_TEMPLATES,
    ...NATURE_TEMPLATES,
    ...SHAPE_TEMPLATES
];
