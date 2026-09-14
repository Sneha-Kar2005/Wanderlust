"use client";

import { useEffect, type RefObject } from "react";

/** Calls `handler` on pointer-down outside `ref`, or on Escape. */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: () => void,
) {
  useEffect(() => {
    function onPointerDown(e: MouseEvent | TouchEvent) {
      const el = ref.current;
      if (el && !el.contains(e.target as Node)) handler();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handler();
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [ref, handler]);
}
