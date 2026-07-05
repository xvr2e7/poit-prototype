import React from "react";

/*
 * POiT's icon set — marks cut for this tool, not borrowed from a library.
 *
 * One voice throughout: square caps and mitred joins (a chisel, not a pen),
 * 1.8px strokes on a 24px grid, drawn with the fewest cuts that still read.
 * Filled dots are pressed points — the same gesture as the seal.
 *
 * All icons take the usual svg props (`className`, `strokeWidth`, ...) and
 * are aria-hidden by default; pair them with a visible label or aria-label
 * on the interactive element.
 */
const Mark = ({ className = "", strokeWidth = 1.8, size, children, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="square"
    strokeLinejoin="miter"
    aria-hidden="true"
    focusable="false"
    className={className}
    {...(size ? { width: size, height: size } : {})}
    {...props}
  >
    {children}
  </svg>
);

/* A pressed point — used inside several marks */
const Dot = ({ cx, cy, r = 1.9 }) => (
  <circle cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />
);

/* ---- chrome ---- */

export const IconMenu = (p) => (
  <Mark {...p}>
    <path d="M4 7h16M4 12h11M4 17h16" />
  </Mark>
);

export const IconClose = (p) => (
  <Mark {...p}>
    <path d="M7 7l10 10M17 7L7 17" />
  </Mark>
);

export const IconAsk = (p) => (
  <Mark {...p}>
    <path d="M8.8 8.2c0-2.4 1.4-3.7 3.2-3.7s3.2 1.3 3.2 3.2c0 2.8-3.2 2.9-3.2 5.8v1" />
    <Dot cx={12} cy={18.8} r={1.3} />
  </Mark>
);

export const IconBack = (p) => (
  <Mark {...p}>
    <path d="M20 12H5M10.5 6.5L5 12l5.5 5.5" />
  </Mark>
);

export const IconChevronLeft = (p) => (
  <Mark {...p}>
    <path d="M14.5 6l-6 6 6 6" />
  </Mark>
);

export const IconChevronRight = (p) => (
  <Mark {...p}>
    <path d="M9.5 6l6 6-6 6" />
  </Mark>
);

export const IconChevronDown = (p) => (
  <Mark {...p}>
    <path d="M6 9.5l6 6 6-6" />
  </Mark>
);

export const IconCheck = (p) => (
  <Mark {...p}>
    <path d="M5 12.5l5 5L19 6.5" />
  </Mark>
);

export const IconAlert = (p) => (
  <Mark {...p}>
    <path d="M12 4l9 15.5H3L12 4zM12 10.5v3.5" />
    <Dot cx={12} cy={16.8} r={1.1} />
  </Mark>
);

/* ---- theme ---- */

export const IconSun = (p) => (
  <Mark {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21" />
  </Mark>
);

export const IconMoon = (p) => (
  <Mark {...p}>
    <path d="M14.5 3.8A8.7 8.7 0 1 0 20.2 15.9 7 7 0 0 1 14.5 3.8z" />
  </Mark>
);

export const IconMonitor = (p) => (
  <Mark {...p}>
    <path d="M4 5.5h16v11H4zM9.5 20h5M12 16.5V20" />
  </Mark>
);

/* ---- the practice ---- */

/** Streak — tally strokes, the fourth cut across */
export const IconTally = (p) => (
  <Mark {...p}>
    <path d="M6 5v14M10.5 5v14M15 5v14M4 17l16-9" />
  </Mark>
);

/** Constellation — three pressed stars, two cuts between */
export const IconConstellation = (p) => (
  <Mark {...p}>
    <path d="M5.5 17.5L12 6.5l6.5 7" />
    <Dot cx={5.5} cy={17.5} />
    <Dot cx={12} cy={6.5} />
    <Dot cx={18.5} cy={13.5} />
  </Mark>
);

/** Poemlet — a leaf with a folded corner, two lines of writing */
export const IconPoemlet = (p) => (
  <Mark {...p}>
    <path d="M6 3.5h9L18.5 7v13.5H6V3.5z" />
    <path d="M15 3.5V7h3.5" />
    <path d="M9 13h6M9 16.5h4" />
  </Mark>
);

/** Write — a fountain nib, point down, ready */
export const IconNib = (p) => (
  <Mark {...p}>
    <path d="M12 4c3 0 4.8 1.4 4.8 4 0 3.2-3 7.8-4.8 11.5C10.2 15.8 7.2 11.2 7.2 8c0-2.6 1.8-4 4.8-4z" />
    <path d="M12 9.8v3.7" />
    <Dot cx={12} cy={8.8} r={1} />
  </Mark>
);

export const IconPencil = (p) => (
  <Mark {...p}>
    <path d="M14.5 5L19 9.5 8.5 20H4v-4.5L14.5 5zM12.5 7l4.5 4.5" />
  </Mark>
);

/* ---- files & saves ---- */

export const IconExport = (p) => (
  <Mark {...p}>
    <path d="M12 4v8.5M8.5 9l3.5 3.5L15.5 9M5 17.5h14" />
  </Mark>
);

export const IconImport = (p) => (
  <Mark {...p}>
    <path d="M12 13V4.5M8.5 8L12 4.5 15.5 8M5 17.5h14" />
  </Mark>
);

/** Wipe — the page, struck through */
export const IconWipe = (p) => (
  <Mark {...p}>
    <path d="M6.5 4.5h11v15h-11z" />
    <path d="M4.5 19.5l15-15" />
  </Mark>
);

/** Save — a leaf kept, marked done */
export const IconSave = (p) => (
  <Mark {...p}>
    <path d="M6.5 4.5H15l2.5 2.5v12.5h-11V4.5z" />
    <path d="M9 13.5l2 2 4-4.5" />
  </Mark>
);

export const IconLink = (p) => (
  <Mark {...p}>
    <path d="M10 7H6.5a5 5 0 0 0 0 10H10M14 7h3.5a5 5 0 0 1 0 10H14M8.5 12h7" />
  </Mark>
);

/* ---- navigation & views ---- */

export const IconHome = (p) => (
  <Mark {...p}>
    <path d="M4.5 11L12 4l7.5 7M6.5 9.5v10h11v-10" />
  </Mark>
);

export const IconExit = (p) => (
  <Mark {...p}>
    <path d="M13 4H5.5v16H13M10 12h10M16.5 8.5L20 12l-3.5 3.5" />
  </Mark>
);

export const IconRetry = (p) => (
  <Mark {...p}>
    <path d="M19 5v4.5h-4.5" />
    <path d="M19 9.5A7.5 7.5 0 1 0 19.5 12" />
  </Mark>
);

export const IconZoomIn = (p) => (
  <Mark {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M15.8 15.8L20 20M11 8.5v5M8.5 11h5" />
  </Mark>
);

export const IconZoomOut = (p) => (
  <Mark {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M15.8 15.8L20 20M8.5 11h5" />
  </Mark>
);

/** Telescope — for looking at the constellation from the ground */
export const IconTelescope = (p) => (
  <Mark {...p}>
    <path d="M4 13l9.5-8L16 8 6.5 16 4 13z" />
    <path d="M9 15.5l-2.5 5M11.5 14l3.5 6.5" />
    <Dot cx={19.5} cy={4.5} r={1.2} />
  </Mark>
);

/* ---- craft tools ---- */

export const IconPlus = (p) => (
  <Mark {...p}>
    <path d="M12 5v14M5 12h14" />
  </Mark>
);

export const IconType = (p) => (
  <Mark {...p}>
    <path d="M5 7V4.5h14V7M12 4.5v15M9 19.5h6" />
  </Mark>
);

export const IconHash = (p) => (
  <Mark {...p}>
    <path d="M9.5 4l-2 16M16.5 4l-2 16M4.5 9h16M3.5 15h16" />
  </Mark>
);

export const IconLayout = (p) => (
  <Mark {...p}>
    <path d="M4.5 4.5h15v15h-15zM4.5 10h15M10.5 10v9.5" />
  </Mark>
);

export const IconGrid = (p) => (
  <Mark {...p}>
    <path d="M4.5 4.5h15v15h-15zM12 4.5v15M4.5 12h15" />
  </Mark>
);

/** A four-point star — one bright cut */
export const IconStar = (p) => (
  <Mark {...p}>
    <path d="M12 3.5l1.7 6.8 6.8 1.7-6.8 1.7L12 20.5l-1.7-6.8L3.5 12l6.8-1.7L12 3.5z" />
  </Mark>
);

/** Sparks — a bright cut and a pressed point beside it */
export const IconSpark = (p) => (
  <Mark {...p}>
    <path d="M10 4l1.4 4.6L16 10l-4.6 1.4L10 16l-1.4-4.6L4 10l4.6-1.4L10 4z" />
    <path d="M17.5 14.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z" strokeWidth="1.4" />
  </Mark>
);

const icons = {
  IconMenu,
  IconClose,
  IconAsk,
  IconBack,
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
  IconCheck,
  IconAlert,
  IconSun,
  IconMoon,
  IconMonitor,
  IconTally,
  IconConstellation,
  IconPoemlet,
  IconNib,
  IconPencil,
  IconExport,
  IconImport,
  IconWipe,
  IconSave,
  IconLink,
  IconHome,
  IconExit,
  IconRetry,
  IconZoomIn,
  IconZoomOut,
  IconTelescope,
  IconPlus,
  IconType,
  IconHash,
  IconLayout,
  IconGrid,
  IconStar,
  IconSpark,
};

export default icons;
