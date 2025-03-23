import { useEffect } from "react";
import { WritingSuggestion, EditorRefType } from "./types";

export const useHoverDetection = (
  editorRef: EditorRefType,
  setActiveSuggestion: (suggestion: WritingSuggestion | null) => void,
  updateTooltipPosition: (target: HTMLElement) => { x: number; y: number } | null
) => {
  useEffect(() => {
    const editorElement = editorRef.current;
    if (!editorElement) return;

    // Track if we have a pending timeout to hide the tooltip
    let hideTooltipTimeout: NodeJS.Timeout | null = null;

    // Event delegation for hovering over marked spans
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Clear any pending hide timeout
      if (hideTooltipTimeout) {
        clearTimeout(hideTooltipTimeout);
        hideTooltipTimeout = null;
      }

      // Check if target has one of our mark classes
      if (
        target.classList.contains("grammar-issue") ||
        target.classList.contains("wordchoice-issue")
      ) {
        const type = target.classList.contains("grammar-issue")
          ? "grammar"
          : "word-choice";
        const suggestion = target.getAttribute("data-suggestion") || "";
        const explanation = target.getAttribute("data-explanation") || "";
        const original = target.textContent || "";

        setActiveSuggestion({
          type,
          original,
          suggestion,
          explanation,
        });

        // Use the more accurate position calculation
        updateTooltipPosition(target);
      }
    };

    // Handle mouse leaving the tooltip
    const handleMouseOut = (e: MouseEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement;

      // Don't hide tooltip if moving to the tooltip itself
      if (relatedTarget && relatedTarget.closest(".suggestion-tooltip")) {
        return;
      }

      // Add a delay before hiding the tooltip
      hideTooltipTimeout = setTimeout(() => {
        setActiveSuggestion(null);
      }, 300); // 300ms delay before hiding
    };

    editorElement.addEventListener("mouseover", handleMouseOver);
    editorElement.addEventListener("mouseout", handleMouseOut);

    // Add listener for tooltip leaving
    const handleDocumentMouseOver = (e: MouseEvent) => {
      const tooltip = document.querySelector(".suggestion-tooltip");
      const target = e.target as HTMLElement;

      // If moving to or inside a tooltip or a mark, don't hide
      if (
        target.closest(".suggestion-tooltip") ||
        target.classList.contains("grammar-issue") ||
        target.classList.contains("wordchoice-issue")
      ) {
        // Clear any pending hide timeout
        if (hideTooltipTimeout) {
          clearTimeout(hideTooltipTimeout);
          hideTooltipTimeout = null;
        }
        return;
      }

      // If moving to somewhere else, hide with delay
      if (tooltip) {
        hideTooltipTimeout = setTimeout(() => {
          setActiveSuggestion(null);
        }, 300); // 300ms delay
      }
    };

    document.addEventListener("mouseover", handleDocumentMouseOver);

    return () => {
      editorElement.removeEventListener("mouseover", handleMouseOver);
      editorElement.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("mouseover", handleDocumentMouseOver);

      // Clear any pending timeout when unmounting
      if (hideTooltipTimeout) {
        clearTimeout(hideTooltipTimeout);
      }
    };
  }, [editorRef, setActiveSuggestion, updateTooltipPosition]);
}; 