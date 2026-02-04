"use client";

import { SecretOverlay } from "@/components/secret-overlay";
import { ValentineSecret } from "@/components/valentine-secret";
import { useSecretMode } from "@/contexts/secret-mode-context";

export function SecretModeRoot() {
  const { secretModeActive, mode } = useSecretMode();

  if (!secretModeActive || mode === null) return null;

  if (mode === "valentine") {
    return <ValentineSecret />;
  }

  // Default to the existing notes/photos overlay.
  return <SecretOverlay />;
}

