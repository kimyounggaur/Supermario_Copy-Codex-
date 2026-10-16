import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({
  title,
  description,
  onClose,
  children,
  className = "",
}: ModalProps) {
  const id = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const root = document.getElementById("root");
    const wasInert = root?.inert ?? false;
    if (root) root.inert = true;
    const dialog = dialogRef.current;
    const selector =
      'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]';
    const focusable = () =>
      Array.from(dialog?.querySelectorAll<HTMLElement>(selector) ?? []).filter(
        (node) => node.getClientRects().length > 0,
      );
    (
      dialog?.querySelector<HTMLElement>("[data-autofocus]") ??
      focusable()[0] ??
      dialog
    )?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeRef.current();
      } else if (event.key === "Tab") {
        const items = focusable();
        const first = items[0];
        const last = items.at(-1);
        if (!first) {
          event.preventDefault();
          dialog?.focus();
        } else if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === dialog)
        ) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey, true);
    return () => {
      document.removeEventListener("keydown", handleKey, true);
      if (root) root.inert = wasInert;
      if (previous?.isConnected) previous.focus();
    };
  }, []);

  return createPortal(
    <div
      className="ui-modal-backdrop"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={`ui-modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={description ? `${id}-description` : undefined}
        tabIndex={-1}
      >
        <div className="ui-modal__heading">
          <h2 id={`${id}-title`}>{title}</h2>
          <button
            className="ui-icon-button"
            type="button"
            aria-label="닫기"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        {description ? <p id={`${id}-description`}>{description}</p> : null}
        {children}
      </div>
    </div>,
    document.body,
  );
}
