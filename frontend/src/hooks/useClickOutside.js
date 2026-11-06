import { useEffect, useRef } from "react";

// calls onOutside(event) when the user clicks outside `ref` or presses Escape
export default function useClickOutside(ref, onOutside, enabled = true) {
  const callbackRef = useRef(onOutside);

  useEffect(() => {
    callbackRef.current = onOutside;
  });

  useEffect(() => {
    if (!enabled) return;

    const handlePointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) callbackRef.current(event);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") callbackRef.current(event);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [ref, enabled]);
}
