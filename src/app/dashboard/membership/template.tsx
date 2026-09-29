"use client";

import { motion } from "framer-motion";

import { pageTransition } from "@/components/features/dashboard/membership/animations";

// Route-level transition for every page under /dashboard/membership.
// Next.js remounts a template on navigation, so the enter animation runs on
// each sub-page change (dashboard → members → settings etc.), giving the
// module a consistent, quick fade-rise entrance.
export default function MembershipTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}
