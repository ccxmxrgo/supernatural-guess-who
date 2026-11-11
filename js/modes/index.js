/**
 * The mode registry. To add a mode: write a file in this folder following core/game.js's
 * "mode object" note, add its names to lib/i18n.js (mode.<id>, .short, .blurb), then list it here.
 */
import { t } from '../lib/i18n.js';
import whoami from './whoami.js';
import description from './description.js';
import image from './image.js';
import quote from './quote.js';
import episode from './episode.js';

export const MODES = [whoami, image, description, quote, episode];
export const getMode = id => MODES.find(m => m.id === id);
export const isAvailable = m => (m.available ? m.available() : true);
export const modeName = m => t(`mode.${m.id}`);
export const modeShort = m => t(`mode.${m.id}.short`);
export const modeBlurb = m => t(`mode.${m.id}.blurb`);
