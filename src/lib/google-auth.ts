"use client";

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: any;
  }
}

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_SCRIPT_SRC}"]`,
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google SDK")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google SDK"));
    document.head.appendChild(script);
  });
}

export async function getGoogleIdToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
  }

  await loadGoogleScript();

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error("Google sign-in timed out"));
    }, 60000);

    const onCredential = (response: GoogleCredentialResponse) => {
      if (!response?.credential) {
        reject(new Error("Google sign-in failed"));
        return;
      }
      window.clearTimeout(timeout);
      resolve(response.credential);
    };

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: onCredential,
      auto_select: false,
      ux_mode: "popup",
    });

    window.google.accounts.id.prompt((notification: any) => {
      if (
        notification?.isNotDisplayed?.() ||
        notification?.isSkippedMoment?.()
      ) {
        window.clearTimeout(timeout);
        reject(new Error("Unable to open Google sign-in"));
      }
    });
  });
}
