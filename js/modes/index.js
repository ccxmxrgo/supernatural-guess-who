/**
 * The mode registry. To add a mode: write a file in this folder following core/game.js's
 * "mode object" note, then add it to this list. The menu, routes, stats and dailies pick it up.
 */
import whoami from './whoami.js';
import description from './description.js';
import image from './image.js';
import quote from './quote.js';
import episode from './episode.js';

export const MODES = [whoami, description, quote, episode, image];
export const getMode = id => MODES.find(m => m.id === id);
export const isAvailable = m => (m.available ? m.available() : true);
