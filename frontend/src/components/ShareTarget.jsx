// src/components/ShareTarget.jsx
// This component handles incoming shares from the Android share sheet.
// When someone shares a URL to Link Vault, Android opens:
// /share-target?url=https://...&title=Page+Title
// This component reads those params and opens the AddLinkModal pre-filled.

import { useEffect } from "react";

export default function ShareTarget({ onShare }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Android passes the URL in either "url" or "text" param
    const sharedUrl = params.get("url") || params.get("text") || "";
    const sharedTitle = params.get("title") || "";

    if (sharedUrl) {
      // Pass data up to App.jsx to open the modal pre-filled
      onShare({ url: sharedUrl, name: sharedTitle });
    }
  }, []);

  // Renders nothing — just triggers the modal
  return null;
}
