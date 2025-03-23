import { useCallback, useRef } from "react";

export const useTooltipPosition = () => {
  const editorRef = useRef<HTMLDivElement>(null);

  const updateTooltipPosition = useCallback((target: HTMLElement) => {
    const editorElement = editorRef.current;
    if (!editorElement) return null;

    const rect = target.getBoundingClientRect();
    const editorRect = editorElement.getBoundingClientRect();

    // Calculate position relative to the editor, accounting for scroll
    return {
      x:
        rect.left - editorRect.left + rect.width / 2 + editorElement.scrollLeft,
      y: rect.top - editorRect.top + rect.height + editorElement.scrollTop,
    };
  }, []);

  return {
    editorRef,
    updateTooltipPosition,
  };
}; 