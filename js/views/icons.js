/** Line icons for the modes and the header tools, drawn for this game (stroke = currentColor). */
const svg = body => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const ICONS = {
  whoami: svg('<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.6 2.3c-.8.4-1.2 1-1.2 1.9v.4"/><path d="M12 17.2v.1"/>'),
  image: svg('<rect x="3" y="6" width="18" height="13" rx="1.5"/><path d="M8.5 6 10 3.8h4L15.5 6"/><circle cx="12" cy="12.5" r="3.6"/>'),
  description: svg('<path d="M3.5 7.5V18a1.5 1.5 0 0 0 1.5 1.5h14a1.5 1.5 0 0 0 1.5-1.5V9a1.5 1.5 0 0 0-1.5-1.5h-7L10 5H5a1.5 1.5 0 0 0-1.5 1.5z"/><path d="M8 13h8M8 16h5"/>'),
  quote: svg('<path d="M4 5.5h16a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1h-9l-4.5 3.5V16H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1z"/><path d="M8.5 9.5v2.2M11 9.5v2.2M13.5 9.5v2.2M16 9.5v2.2" stroke-width="1.5"/>'),
  episode: svg('<rect x="3" y="6.5" width="18" height="12.5" rx="1.5"/><path d="m8.5 3 3.5 3.5L15.5 3"/><path d="M10 10.5v5l4-2.5z"/>'),
  random: svg('<rect x="4" y="4" width="16" height="16" rx="2.5"/><circle cx="8.5" cy="8.5" r=".9" fill="currentColor"/><circle cx="15.5" cy="15.5" r=".9" fill="currentColor"/><circle cx="12" cy="12" r=".9" fill="currentColor"/><circle cx="15.5" cy="8.5" r=".9" fill="currentColor"/><circle cx="8.5" cy="15.5" r=".9" fill="currentColor"/>'),
  stats: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  history: svg('<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3 4v4h4"/><path d="M12 8v4.5l3 2"/>'),
  rules: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/>'),
  check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  cross: svg('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>'),
  up: svg('<path d="M12 19V5M6 11l6-6 6 6"/>'),
  down: svg('<path d="M12 5v14M6 13l6 6 6-6"/>'),
};
