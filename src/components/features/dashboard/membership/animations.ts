// ─────────────────────────────────────────────────────────────────────────────
// Shared motion language for the CW Members module. Everything here is tuned
// for a dashboard: quick, subtle, and professional — small distances, short
// durations, gentle overshoot (bounce) only where it reads as feedback rather
// than playfulness.
// ─────────────────────────────────────────────────────────────────────────────

import type { Variants, Transition } from "framer-motion";

/** Signature dashboard easing: fast out, gentle settle. */
export const dashboardEase: Transition["ease"] = [0.22, 0.61, 0.36, 1];

/** Slightly springy easing for elements that benefit from a soft bounce. */
export const springTransition: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 26,
  mass: 0.9,
};

/** Container: orchestrates children staggering in. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

/** Standard entrance: fade + rise. Used for cards and sections. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: dashboardEase },
  },
};

/** Fade + rise with a small bounce overshoot — for list rows and badges. */
export const fadeUpBounce: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
};

/** Soft scale-in for modals and floating elements. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.28, ease: dashboardEase },
  },
};

/** Exit fade — pairs with AnimatePresence for list removals. */
export const fadeOut: Variants = {
  hidden: { opacity: 0, transition: { duration: 0.18 } },
  visible: { opacity: 1 },
};

/** Page-level transition used by the membership template.tsx. */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: dashboardEase },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.18, ease: dashboardEase },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Hover language — quick lift with a soft spring, and a gentle press-down on
// tap. Subtle enough for data-dense dashboard surfaces.
// ─────────────────────────────────────────────────────────────────────────────

/** whileHover target for cards and rows. */
export const hoverLift = { y: -2 } as const;

/** Slightly stronger lift for primary interactive tiles (stat cards). */
export const hoverLiftStrong = { y: -3, scale: 1.01 } as const;

/** whileTap target — tactile press without feeling mushy. */
export const tapPress = { scale: 0.99 } as const;

/** Transition used for hover/tap so the response feels immediate. */
export const hoverSpring: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 28,
  mass: 0.6,
};
