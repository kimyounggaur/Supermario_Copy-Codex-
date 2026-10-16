import type { ButtonHTMLAttributes } from "react";
import { AudioManager } from "../../game/systems/AudioManager";

export function ActionButton({
  className = "",
  variant = "secondary",
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet" | "danger";
}) {
  return (
    <button
      type="button"
      className={`ui-button ui-button--${variant} ${className}`}
      {...props}
      onClick={(event) => {
        AudioManager.get().play("button");
        onClick?.(event);
      }}
    />
  );
}
