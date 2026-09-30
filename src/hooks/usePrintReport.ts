import { useCallback, useEffect, useRef } from "react";

interface UsePrintReport {
  printReport: () => void;
}

/**
 * Opens the browser print dialog (save as PDF) with `document.title` set to
 * `title`, so the saved file gets a meaningful name. The original title is
 * restored on `afterprint` (or on unmount, whichever comes first).
 */
export const usePrintReport = (title: string): UsePrintReport => {
  const restoreRef = useRef<(() => void) | null>(null);

  useEffect(() => () => restoreRef.current?.(), []);

  const printReport = useCallback((): void => {
    restoreRef.current?.();
    const originalTitle = document.title;
    const restore = (): void => {
      document.title = originalTitle;
      window.removeEventListener("afterprint", restore);
      restoreRef.current = null;
    };
    restoreRef.current = restore;
    document.title = title;
    window.addEventListener("afterprint", restore);
    window.print();
  }, [title]);

  return { printReport };
};
