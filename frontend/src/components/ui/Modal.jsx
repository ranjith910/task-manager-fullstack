import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

function Modal({ title, description, onClose, children, size = "max-w-lg", role = "dialog" }) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const panel = panelRef.current;

    // the page behind can't be clicked, tabbed into or read by screen readers while open
    const appShell = document.getElementById("app-shell");
    appShell?.setAttribute("inert", "");

    // focus the first field (or button) inside the modal, skipping the close icon
    const focusables = [...panel.querySelectorAll(FOCUSABLE)].filter((el) => !el.dataset.close);
    (focusables[0] || panel).focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      // keep Tab inside the modal
      if (event.key === "Tab") {
        const elements = [...panel.querySelectorAll(FOCUSABLE)];
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      appShell?.removeAttribute("inert");

      // go back to whatever opened the modal, unless it's gone (e.g. the deleted task's row)
      const returnTo = document.body.contains(previouslyFocused)
        ? previouslyFocused
        : document.getElementById("main-content");
      returnTo?.focus?.();
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/40 p-0 sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`bg-white w-full ${size} rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto outline-none`}
      >
        <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-100">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-gray-800">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-sm text-gray-500 mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            data-close="true"
            onClick={onClose}
            aria-label="Close"
            className="p-1 -m-1 rounded-md text-gray-400 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-indigo-500"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
