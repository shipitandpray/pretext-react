import { useEffect, useState } from "react";

function canUseFontApi(): boolean {
  return typeof document !== "undefined" && "fonts" in document;
}

export function useFontReady(font: string): boolean {
  const [ready, setReady] = useState(() => {
    if (!canUseFontApi()) {
      return false;
    }
    return document.fonts.check(font);
  });

  useEffect(() => {
    if (!canUseFontApi()) {
      return;
    }

    let cancelled = false;

    if (document.fonts.check(font)) {
      setReady(true);
      return;
    }

    setReady(false);

    document.fonts
      .load(font)
      .then(() => document.fonts.ready)
      .then(() => {
        if (!cancelled) {
          setReady(document.fonts.check(font));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setReady(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [font]);

  return ready;
}
