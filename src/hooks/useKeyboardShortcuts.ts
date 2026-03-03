import { useEffect, useRef } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  handler: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      for (const s of shortcutsRef.current) {
        const ctrlOrMeta = s.ctrl || s.meta;
        if (e.key === s.key && (!ctrlOrMeta || e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          s.handler();
        }
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
