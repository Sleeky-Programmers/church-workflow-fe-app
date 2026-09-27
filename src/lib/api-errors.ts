const MAX_IMAGE_SIZE_MB = 10;

/**
 * Turns any thrown error (from authenticatedFetch or a network failure) into a
 * clear, human-readable message that can be rendered inline in the UI.
 */
export function getFriendlyErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!error) return fallback;

  const anyError = error as any;
  const rawMessage: string =
    (typeof anyError?.message === "string" && anyError.message) || "";
  const status: number | undefined = anyError?.status;
  const normalized = rawMessage.toLowerCase();

  // Payload / file too large (HTTP 413 or message-based)
  if (status === 413 || /too large|payload too large|file size/i.test(normalized)) {
    return `The selected image is too large. Please choose an image smaller than ${MAX_IMAGE_SIZE_MB}MB.`;
  }

  if (status === 401) {
    return "Your session has expired. Please log in again.";
  }

  if (status === 403) {
    return "You don't have permission to perform this action.";
  }

  if (status === 404) {
    return "The item you're trying to update could not be found. Please refresh and try again.";
  }

  if (status === 429) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  if (status && status >= 500) {
    return "We're having trouble with the server right now. Please try again shortly.";
  }

  if (/failed to fetch|networkerror|network request/i.test(normalized)) {
    return "We couldn't reach the server. Please check your internet connection and try again.";
  }

  return rawMessage.trim() || fallback;
}

export { MAX_IMAGE_SIZE_MB };
