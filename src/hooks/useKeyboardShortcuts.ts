import { useEffect } from 'react';

interface KeyboardShortcuts {
  onFocusInput?: () => void;
  onExport?: () => void;
  onClear?: () => void;
}

export function useKeyboardShortcuts({ onFocusInput, onExport, onClear }: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+/ or Cmd+/ to focus input
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault();
        onFocusInput?.();
      }
      
      // Ctrl+E or Cmd+E to export
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        onExport?.();
      }
      
      // Ctrl+Shift+Delete to clear all
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'Delete') {
        event.preventDefault();
        if (confirm('Are you sure you want to clear all lookup history?')) {
          onClear?.();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onFocusInput, onExport, onClear]);
}