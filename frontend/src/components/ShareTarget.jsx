// src/components/ShareTarget.jsx
import { useEffect } from "react";

export default function ShareTarget({ onShare }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get("url") || params.get("text") || "";
    const sharedTitle = params.get("title") || "";

    if (sharedUrl) {
      onShare({ url: sharedUrl, name: sharedTitle });
    }
  }, []);

  return null;
}
