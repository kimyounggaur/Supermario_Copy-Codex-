import { describe, expect, test } from 'vitest';
import { shouldIgnoreEditorKey } from '../../src/editor/utils/editorInputGuard';

function keyEvent(
  changes: Partial<
    Pick<
      KeyboardEvent,
      'target' | 'isComposing' | 'keyCode' | 'defaultPrevented'
    >
  > = {}
) {
  return {
    target: null,
    isComposing: false,
    keyCode: 0,
    defaultPrevented: false,
    ...changes
  };
}

describe('editor keyboard ownership', () => {
  test('canvas keyboard shortcuts remain available with no editor dialog or text owner', () => {
    expect(shouldIgnoreEditorKey(keyEvent())).toBe(false);
    const canvas = { closest: () => null } as unknown as EventTarget;
    expect(shouldIgnoreEditorKey(keyEvent({ target: canvas }))).toBe(false);
  });

  test('IME, a previously handled event and an open dialog never become editor commands', () => {
    expect(shouldIgnoreEditorKey(keyEvent({ isComposing: true }))).toBe(true);
    expect(shouldIgnoreEditorKey(keyEvent({ keyCode: 229 }))).toBe(true);
    expect(shouldIgnoreEditorKey(keyEvent({ defaultPrevented: true }))).toBe(
      true
    );
    expect(shouldIgnoreEditorKey(keyEvent(), true)).toBe(true);
  });

  test('text controls, contenteditable children and dialog/button descendants retain key ownership', () => {
    for (const owner of [
      'input',
      'textarea',
      'select',
      'button',
      '[contenteditable]:not([contenteditable="false"])',
      '[role="dialog"]'
    ]) {
      const target = {
        closest: (selector: string) =>
          selector.split(', ').includes(owner) ? {} : null
      } as unknown as EventTarget;
      expect(shouldIgnoreEditorKey(keyEvent({ target })), owner).toBe(true);
    }
  });
});
