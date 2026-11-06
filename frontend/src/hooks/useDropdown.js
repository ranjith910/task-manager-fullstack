import { useId, useRef, useState } from "react";
import useClickOutside from "./useClickOutside";

// open/close state for a button + popup panel. Closes on outside click or Escape,
// and Escape puts focus back on the button.
export default function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const panelId = useId();

  const close = () => setIsOpen(false);

  useClickOutside(
    containerRef,
    (event) => {
      close();
      if (event.type === "keydown") buttonRef.current?.focus();
    },
    isOpen,
  );

  const buttonProps = {
    ref: buttonRef,
    type: "button",
    onClick: () => setIsOpen((open) => !open),
    "aria-expanded": isOpen,
    "aria-controls": panelId,
  };

  return { isOpen, close, containerRef, buttonProps, panelId };
}
