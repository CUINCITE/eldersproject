// [data-animation]
import { fadeUp } from './fadeUp';
import { slideUp } from './slideUp';

// [data-scroll]
import { collectionHero } from './scroll/collectionHero';
import { interviews } from './scroll/interviews';
import { claim } from './scroll/claim';
import { sticker } from './scroll/sticker';
import { illustration } from './scroll/illustration';
import { line } from './scroll/line';
import { people } from './scroll/people';
import { collections } from './scroll/collections';
import { collectionsSimple } from './scroll/collectionsSimple';
import { cover } from './scroll/cover';
import { sticky } from './scroll/sticky';


export const animations = { fadeUp, slideUp };

export const scrolls = {
    collections,
    collectionsSimple,
    collectionHero,
    cover,
    interviews,
    claim,
    sticker,
    illustration,
    line,
    people,
    sticky,
};

export const hovers = {};
