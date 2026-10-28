/**
 * Icon paths from the app designs (design/chat, design/groups, design/admin).
 * Stroke icons use currentColor; `fill` icons are solid shapes.
 */
export type IconDef = {
  viewBox: string;
  d: string;
  strokeWidth?: number;
  fill?: boolean;
};

export const icons = {
  search: { viewBox: "0 0 16 16", strokeWidth: 1.6, d: "M7 12A5 5 0 107 2a5 5 0 000 10zM11 11l3.5 3.5" },
  plus: { viewBox: "0 0 16 16", strokeWidth: 1.6, d: "M8 2v12M2 8h12" },
  "plus-sm": { viewBox: "0 0 12 12", strokeWidth: 1.8, d: "M6 1.5v9M1.5 6h9" },
  compose: {
    viewBox: "0 0 22 22",
    strokeWidth: 1.8,
    d: "M11 4H5a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1v-6M15.5 3.5l3 3L11 14H8v-3z",
  },
  send: { viewBox: "0 0 16 16", strokeWidth: 1.8, d: "M8 13V3M3.5 7.5L8 3l4.5 4.5" },
  stop: { viewBox: "0 0 16 16", fill: true, d: "M5 3.5h6A1.5 1.5 0 0112.5 5v6a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 11V5A1.5 1.5 0 015 3.5z" },
  sidebar: { viewBox: "0 0 20 20", strokeWidth: 1.6, d: "M5.5 3.5h9a3 3 0 013 3v7a3 3 0 01-3 3h-9a3 3 0 01-3-3v-7a3 3 0 013-3zM8 3.5v13" },
  back: { viewBox: "0 0 16 16", strokeWidth: 1.7, d: "M10 3L5 8l5 5" },
  close: { viewBox: "0 0 12 12", strokeWidth: 1.6, d: "M2 2l8 8M10 2l-8 8" },
  "chevron-down": { viewBox: "0 0 12 8", strokeWidth: 1.6, d: "M2 2l4 4 4-4" },
  "chevron-right": { viewBox: "0 0 8 12", strokeWidth: 1.6, d: "M2 2l4 4-4 4" },
  "chevron-small": { viewBox: "0 0 10 10", strokeWidth: 1.5, d: "M3 2l3 3-3 3" },
  "arrow-right": { viewBox: "0 0 16 16", strokeWidth: 1.8, d: "M3 8h10M8.5 3.5L13 8l-4.5 4.5" },
  "arrow-left": { viewBox: "0 0 16 16", strokeWidth: 1.6, d: "M13 8H3M7.5 3.5L3 8l4.5 4.5" },
  "sign-out": { viewBox: "0 0 16 16", strokeWidth: 1.6, d: "M6 2.5H3.5a1 1 0 00-1 1v9a1 1 0 001 1H6M10.5 11L13.5 8l-3-3M13.5 8H6" },
  transition: { viewBox: "0 0 12 12", strokeWidth: 1.5, d: "M2 6h8M7 3l3 3-3 3" },
  external: { viewBox: "0 0 12 12", strokeWidth: 1.6, d: "M4 2h6v6M10 2L2.5 9.5" },
  expand: { viewBox: "0 0 20 20", strokeWidth: 1.8, d: "M12 3h5v5M8 17H3v-5M17 3l-6 6M3 17l6-6" },
  check: { viewBox: "0 0 12 12", strokeWidth: 2, d: "M2.5 6.2l2.4 2.3 4.6-5" },
  copy: {
    viewBox: "0 0 16 16",
    strokeWidth: 1.6,
    d: "M7.2 5h4.6A2.2 2.2 0 0114 7.2v4.6a2.2 2.2 0 01-2.2 2.2H7.2A2.2 2.2 0 015 11.8V7.2A2.2 2.2 0 017.2 5zM11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5",
  },
  refresh: { viewBox: "0 0 16 16", strokeWidth: 1.6, d: "M13.5 8a5.5 5.5 0 11-1.6-3.9M13.5 2v3h-3" },
  link: {
    viewBox: "0 0 20 20",
    strokeWidth: 1.6,
    d: "M8.5 11.5a3.5 3.5 0 005 0l2.5-2.5a3.5 3.5 0 00-5-5l-1 1M11.5 8.5a3.5 3.5 0 00-5 0L4 11a3.5 3.5 0 005 5l1-1",
  },
  "link-off": {
    viewBox: "0 0 20 20",
    strokeWidth: 1.5,
    d: "M8.5 11.5a3.5 3.5 0 005 0l2.5-2.5a3.5 3.5 0 00-5-5l-1 1M11.5 8.5a3.5 3.5 0 00-5 0L4 11a3.5 3.5 0 005 5l1-1M3 3l14 14",
  },
  group: {
    viewBox: "0 0 16 16",
    strokeWidth: 1.5,
    d: "M6 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.5 13.5c.6-2.3 2.3-3.5 4.5-3.5s3.9 1.2 4.5 3.5M10.5 3.3a2.5 2.5 0 010 4.4M12 10.3c1.2.5 2 1.6 2.5 3.2",
  },
  "user-plus": {
    viewBox: "0 0 20 20",
    strokeWidth: 1.6,
    d: "M7.5 9.5a3 3 0 100-6 3 3 0 000 6zM2 16.5c.6-2.8 2.7-4.5 5.5-4.5s4.9 1.7 5.5 4.5M15.5 6v5M13 8.5h5",
  },
  settings: {
    viewBox: "0 0 20 20",
    strokeWidth: 1.5,
    d: "M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM10 2v2.5M10 15.5V18M2 10h2.5M15.5 10H18M4.3 4.3l1.8 1.8M13.9 13.9l1.8 1.8M4.3 15.7l1.8-1.8M13.9 6.1l1.8-1.8",
  },
  chat: {
    viewBox: "0 0 20 20",
    strokeWidth: 1.6,
    d: "M4 5.5A2.5 2.5 0 016.5 3h7A2.5 2.5 0 0116 5.5v5a2.5 2.5 0 01-2.5 2.5H9l-3.5 3v-3A2.5 2.5 0 014 10.5z",
  },
  pencil: { viewBox: "0 0 22 22", strokeWidth: 1.7, d: "M15.5 3.5l3 3L8 17H5v-3z" },
  mic: {
    viewBox: "0 0 20 20",
    strokeWidth: 1.6,
    d: "M10 2.5a2.5 2.5 0 012.5 2.5v5a2.5 2.5 0 01-5 0V5A2.5 2.5 0 0110 2.5zM4.5 9.5a5.5 5.5 0 0011 0M10 15v2.5",
  },
  lock: {
    viewBox: "0 0 20 20",
    strokeWidth: 1.5,
    d: "M6.5 9h7A2.5 2.5 0 0116 11.5V15a2.5 2.5 0 01-2.5 2.5h-7A2.5 2.5 0 014 15v-3.5A2.5 2.5 0 016.5 9zM6.5 9V6.5a3.5 3.5 0 017 0V9M10 12.5v2",
  },
  warning: { viewBox: "0 0 16 16", strokeWidth: 1.6, d: "M8 1.8l6.5 11.4H1.5zM8 6.3v3M8 11.4v.1" },
  play: { viewBox: "0 0 16 16", fill: true, d: "M4 2.6v10.8a.8.8 0 001.2.7l8.6-5.4a.8.8 0 000-1.4L5.2 1.9A.8.8 0 004 2.6z" },
  pause: { viewBox: "0 0 16 16", fill: true, d: "M4.5 2.5h1a1 1 0 011 1v9a1 1 0 01-1 1h-1a1 1 0 01-1-1v-9a1 1 0 011-1zM10.5 2.5h1a1 1 0 011 1v9a1 1 0 01-1 1h-1a1 1 0 01-1-1v-9a1 1 0 011-1z" },
  overview: { viewBox: "0 0 20 20", strokeWidth: 1.5, d: "M3.5 3.5h5v5h-5zM11.5 3.5h5v5h-5zM3.5 11.5h5v5h-5zM11.5 11.5h5v5h-5z" },
  applications: {
    viewBox: "0 0 20 20",
    strokeWidth: 1.5,
    d: "M7.5 8.5a2.75 2.75 0 100-5.5 2.75 2.75 0 000 5.5zM2.5 16.5c.5-2.8 2.4-4.5 5-4.5s4.5 1.7 5 4.5M12.5 9.5l1.8 1.8 3.4-3.6",
  },
  contributions: { viewBox: "0 0 20 20", strokeWidth: 1.5, d: "M5 2.5h7l3 3v12H5zM12 2.5v3h3M8 10h4M8 13.5h4" },
  users: {
    viewBox: "0 0 20 20",
    strokeWidth: 1.5,
    d: "M7.5 9a3 3 0 100-6 3 3 0 000 6zM2 17c.6-2.8 2.7-4.5 5.5-4.5S12.4 14.2 13 17M13.5 3.3a3 3 0 010 5.4M15 12.8c1.5.6 2.5 2 3 4.2",
  },
  sliders: { viewBox: "0 0 20 20", strokeWidth: 1.5, d: "M3 6h7M14 6h3M3 14h3M10 14h7M12 4v4M8 12v4" },
  audit: {
    viewBox: "0 0 20 20",
    strokeWidth: 1.5,
    d: "M4 5h12M4 10h6M4 15h4M14.5 18a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM14.5 13v1.7l1.1.8",
  },
  text: { viewBox: "0 0 20 20", strokeWidth: 1.6, d: "M4 5h12M4 9h12M4 13h12M4 17h7" },
  file: { viewBox: "0 0 20 20", strokeWidth: 1.5, d: "M5 2.5h7l3 3v12H5zM12 2.5v3h3" },
  reply: { viewBox: "0 0 16 16", strokeWidth: 1.6, d: "M6.5 3.5L2.5 7.5l4 4M2.5 7.5H9a4.5 4.5 0 014.5 4.5v.5" },
  "thumb-up": {
    viewBox: "0 0 16 16",
    strokeWidth: 1.5,
    d: "M5 7l2.6-4.6a1.4 1.4 0 012.6.8L9.8 6.5h3a1.5 1.5 0 011.5 1.8l-.9 4.5a1.5 1.5 0 01-1.5 1.2H5M5 7v7M5 7H2.5v7H5",
  },
  "thumb-down": {
    viewBox: "0 0 16 16",
    strokeWidth: 1.5,
    d: "M11 9l-2.6 4.6a1.4 1.4 0 01-2.6-.8l.4-3.3h-3a1.5 1.5 0 01-1.5-1.8l.9-4.5A1.5 1.5 0 014.1 2H11M11 9V2M11 9h2.5V2H11",
  },
  "at-sign": {
    viewBox: "0 0 16 16",
    strokeWidth: 1.5,
    d: "M10.5 8a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10.5 8v1.2a1.8 1.8 0 003.5 0V8a6 6 0 10-2.4 4.8",
  },
} satisfies Record<string, IconDef>;

export type IconName = keyof typeof icons;
