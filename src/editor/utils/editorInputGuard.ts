/** Editor shortcuts must never take ownership from text, IME or an open dialog. */
export function shouldIgnoreEditorKey(
  event: Pick<
    KeyboardEvent,
    "target" | "isComposing" | "keyCode" | "defaultPrevented"
  >,
  dialogOpen = false,
): boolean {
  if (
    dialogOpen ||
    event.isComposing ||
    event.keyCode === 229 ||
    event.defaultPrevented
  )
    return true;
  const target = event.target;
  if (!target || typeof (target as Element).closest !== "function")
    return false;
  return Boolean(
    (target as Element).closest(
      'input, textarea, select, button, [contenteditable]:not([contenteditable="false"]), [role="dialog"]',
    ),
  );
}
