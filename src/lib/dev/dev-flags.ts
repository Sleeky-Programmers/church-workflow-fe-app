/**
 * Shared flag gating every `?testLimit=...` preview mechanism (member/user
 * plan limits, custom-roles gate, etc).
 *
 * Enabled when:
 *  - running locally (`next dev`, NODE_ENV !== "production"), or
 *  - NEXT_PUBLIC_ENABLE_TEST_LIMITS=true is set on the deployment.
 *
 * The env-var opt-in exists because a deployed test/staging build still runs
 * `next build`, which sets NODE_ENV=production just like real production —
 * so NODE_ENV alone can't tell a QA environment apart from the live one.
 * Set NEXT_PUBLIC_ENABLE_TEST_LIMITS=true on the test-live deployment's env
 * vars to turn this on there; leave it unset (or "false") on production.
 *
 * Safe to delete: remove this file, unset the env var everywhere, and
 * delete the ?testLimit scaffolding it gates (see member-limit-test.ts and
 * its call sites) once you're done testing.
 */
export function isDevLimitTestingEnabled() {
  if (process.env.NEXT_PUBLIC_ENABLE_TEST_LIMITS === "true") return true;
  return process.env.NODE_ENV !== "production";
}
