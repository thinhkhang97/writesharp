"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { WritingSuggestion, TooltipPosition } from "./types";

export function useWritingCheck(
  value: string,
  onChange: (value: string) => void
) {
  const [suggestions, setSuggestions] = useState<WritingSuggestion[]>([]);
  const [activeSuggestion, setActiveSuggestion] =
    useState<WritingSuggestion | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const contentDivRef = useRef<HTMLDivElement>(null);

  // Initialize content
  useEffect(() => {
    if (contentDivRef.current) {
      // Convert line breaks to <br> tags to preserve paragraphs
      const formattedContent = value.replace(/\n/g, "<br>");
      contentDivRef.current.innerHTML = formattedContent || "<br>";
    }
  }, []);

  // When value changes, update the display
  useEffect(() => {
    if (contentDivRef.current) {
      // Don't update if user is currently editing
      if (document.activeElement !== contentDivRef.current) {
        if (suggestions.length > 0) {
          updateHighlightedContent();
        } else if (
          contentDivRef.current.innerHTML !== formatContentWithLineBreaks(value)
        ) {
          // If no suggestions, update the text with proper line breaks
          contentDivRef.current.innerHTML = formatContentWithLineBreaks(value);
        }
      }
    }
  }, [value, suggestions]);

  // Add event handlers after updating highlights
  useEffect(() => {
    if (!contentDivRef.current || suggestions.length === 0) return;

    // Add hover listeners to all suggestion elements
    const suggestionElements = contentDivRef.current.querySelectorAll(
      ".grammar-error, .word-choice-suggestion"
    );

    suggestionElements.forEach((element) => {
      element.addEventListener(
        "mouseenter",
        handleSuggestionHover as EventListener
      );
      element.addEventListener(
        "mouseleave",
        handleSuggestionLeave as EventListener
      );
    });

    // Cleanup function
    return () => {
      suggestionElements.forEach((element) => {
        element.removeEventListener(
          "mouseenter",
          handleSuggestionHover as EventListener
        );
        element.removeEventListener(
          "mouseleave",
          handleSuggestionLeave as EventListener
        );
      });
    };
  }, [suggestions]);

  // Add tooltip hover handler
  useEffect(() => {
    const handleTooltipMouseLeave = (e: MouseEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement;

      // If moving to a suggestion element, don't hide
      if (
        relatedTarget &&
        (relatedTarget.classList.contains("grammar-error") ||
          relatedTarget.classList.contains("word-choice-suggestion"))
      ) {
        return;
      }

      setActiveSuggestion(null);
    };

    const tooltipElement = document.querySelector(".suggestion-tooltip");
    if (tooltipElement) {
      tooltipElement.addEventListener(
        "mouseleave",
        handleTooltipMouseLeave as EventListener
      );

      return () => {
        tooltipElement.removeEventListener(
          "mouseleave",
          handleTooltipMouseLeave as EventListener
        );
      };
    }
  }, [activeSuggestion]);

  // Add event handler for clicking buttons in tooltip
  useEffect(() => {
    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if they clicked the Apply button
      if (target.closest(".apply-suggestion-btn") && activeSuggestion) {
        e.preventDefault();
        e.stopPropagation();
        applySuggestion();
      }

      // Check if they clicked the Ignore button
      if (target.closest(".ignore-suggestion-btn") && activeSuggestion) {
        e.preventDefault();
        e.stopPropagation();
        ignoreSuggestion();
      }
    };

    document.addEventListener("click", handleButtonClick);

    return () => {
      document.removeEventListener("click", handleButtonClick);
    };
  }, [activeSuggestion]);

  // Add styles
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .grammar-error {
        text-decoration: underline;
        text-decoration-color: #ef4444;
        text-decoration-style: wavy;
        cursor: pointer;
        position: relative;
        transition: background-color 0.2s ease;
      }
      .word-choice-suggestion {
        text-decoration: underline;
        text-decoration-color: #3b82f6;
        text-decoration-style: wavy;
        cursor: pointer;
        position: relative;
        transition: background-color 0.2s ease;
      }
      .grammar-error:hover, .word-choice-suggestion:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }
      .grammar-error:active, .word-choice-suggestion:active {
        background-color: rgba(0, 0, 0, 0.15);
      }
      .suggestion-tooltip {
        animation: fadeIn 0.2s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
        position: fixed; 
        z-index: 9999;
      }
      .tooltip-above {
        transform: translateY(-100%);
        animation: fadeInAbove 0.2s ease;
      }
      .tooltip-below {
        animation: fadeInBelow 0.2s ease;
      }
      @keyframes fadeInAbove {
        from { opacity: 0; transform: translateY(-90%); }
        to { opacity: 1; transform: translateY(-100%); }
      }
      @keyframes fadeInBelow {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const checkWriting = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // Call API endpoint
      const response = await fetch("/api/drafts/check-writing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: value }),
      });

      if (!response.ok) throw new Error("Failed to check writing");

      const data = await response.json();

      // Save current selection/cursor position
      const selection = window.getSelection();
      let range = null;

      // Check if selection exists and has ranges before accessing
      if (selection && selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
      }

      // Set suggestions and update the content with highlights
      setSuggestions(data.suggestions);

      // Wait for the DOM to update
      setTimeout(() => {
        // If we had a selection, try to restore it
        if (
          range &&
          contentDivRef.current &&
          document.activeElement === contentDivRef.current
        ) {
          try {
            selection?.removeAllRanges();
            selection?.addRange(range);
          } catch (e) {
            console.log("Could not restore selection", e);
          }
        }
      }, 10);
    } catch (error) {
      console.error("Error checking writing:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatContentWithLineBreaks = (text: string) => {
    return text.replace(/\n/g, "<br>") || "<br>";
  };

  const updateHighlightedContent = () => {
    if (!contentDivRef.current) return;

    // Don't update if user is currently editing
    if (document.activeElement === contentDivRef.current) {
      return;
    }

    let html = value;

    // Only replace text with highlighted spans if we have suggestions
    if (suggestions.length > 0) {
      // Convert line breaks to <br> before processing
      html = html.replace(/\n/g, "<br>");

      // Sort suggestions by position.from in descending order
      // This way we can replace from end to start without affecting positions
      const sortedSuggestions = [...suggestions].sort(
        (a, b) => b.position.from - a.position.from
      );

      // Replace each suggestion with highlighted span
      sortedSuggestions.forEach((suggestion) => {
        const { from, to } = suggestion.position;
        const original = suggestion.original;

        // Use different classes for different suggestion types
        const highlightClass =
          suggestion.type === "grammar"
            ? "grammar-error"
            : "word-choice-suggestion";

        // Create data attribute to store suggestion data
        const suggestionData = encodeURIComponent(JSON.stringify(suggestion));

        const beforeText = html.substring(0, from);
        const afterText = html.substring(to);

        html =
          beforeText +
          `<span class="${highlightClass}" data-suggestion="${suggestionData}" style="background-color: ${
            suggestion.type === "grammar"
              ? "rgba(239, 68, 68, 0.1)"
              : "rgba(59, 130, 246, 0.1)"
          }">${original}</span>` +
          afterText;
      });

      // Set the HTML content
      contentDivRef.current.innerHTML = html || "<br>";
    } else {
      // If no suggestions, format with line breaks
      contentDivRef.current.innerHTML = formatContentWithLineBreaks(html);
    }
  };

  // Handle input in the contentEditable div
  const handleContentInput = (e: React.FormEvent<HTMLDivElement>) => {
    // Get the current HTML content and convert <br> tags back to newlines
    const target = e.target as HTMLDivElement;
    const htmlContent = target.innerHTML;
    const plainText = htmlContent
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<div>/gi, "\n")
      .replace(/<\/div>/gi, "")
      .replace(/&nbsp;/gi, " ");

    // Use DOMParser to convert HTML entities
    const parser = new DOMParser();
    const decodedText =
      parser.parseFromString(plainText, "text/html").body.textContent || "";

    // When content changes, clear suggestions
    if (suggestions.length > 0) {
      setSuggestions([]);
      setActiveSuggestion(null);
    }

    // Update the value with the new content
    onChange(decodedText);
  };

  // Hover handlers
  const handleSuggestionHover = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const suggestionData = target.getAttribute("data-suggestion");

    if (suggestionData) {
      try {
        const suggestion = JSON.parse(
          decodeURIComponent(suggestionData)
        ) as WritingSuggestion;

        // Calculate tooltip position
        const rect = target.getBoundingClientRect();

        // Estimate tooltip height based on content
        const estimatedHeight = 150;

        // Check if there's enough space above
        let top = rect.top - 10;

        // If tooltip would go off the top of the viewport, position it below instead
        if (top - estimatedHeight < 0) {
          top = rect.bottom + 10;

          // Set class for tooltip below
          setTimeout(() => {
            const tooltip = document.querySelector(".suggestion-tooltip");
            if (tooltip) {
              tooltip.classList.add("tooltip-below");
              tooltip.classList.remove("tooltip-above");
            }
          }, 0);
        } else {
          // Set class for tooltip above
          setTimeout(() => {
            const tooltip = document.querySelector(".suggestion-tooltip");
            if (tooltip) {
              tooltip.classList.add("tooltip-above");
              tooltip.classList.remove("tooltip-below");
            }
          }, 0);
        }

        // Ensure the tooltip stays within the viewport horizontally
        let left = Math.max(10, rect.left);
        if (left + 300 > window.innerWidth) {
          left = window.innerWidth - 310;
        }

        // Position the tooltip
        setTooltipPosition({
          top: top,
          left: left,
        });

        setActiveSuggestion(suggestion);
      } catch (error) {
        console.error("Error parsing suggestion data:", error);
      }
    }
  }, []);

  const handleSuggestionLeave = useCallback((e: MouseEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;

    // Don't hide if moving to the tooltip
    if (relatedTarget && relatedTarget.closest(".suggestion-tooltip")) {
      return;
    }

    // Small delay to allow moving to the tooltip
    setTimeout(() => {
      const tooltipElement = document.querySelector(".suggestion-tooltip");
      if (tooltipElement && tooltipElement.matches(":hover")) {
        return;
      }

      setActiveSuggestion(null);
    }, 100);
  }, []);

  // Define these as useCallbacks to stabilize their identity
  const applySuggestion = useCallback(() => {
    if (!activeSuggestion) return;

    const { from, to } = activeSuggestion.position;
    const newValue =
      value.substring(0, from) +
      activeSuggestion.suggestion +
      value.substring(to);

    onChange(newValue);

    // Remove this suggestion from the list
    setSuggestions(
      suggestions.filter(
        (s) =>
          s.position.from !== activeSuggestion.position.from ||
          s.position.to !== activeSuggestion.position.to
      )
    );

    setActiveSuggestion(null);
  }, [activeSuggestion, value, onChange, suggestions]);

  const ignoreSuggestion = useCallback(() => {
    if (!activeSuggestion) return;

    // Just remove from the list
    setSuggestions(
      suggestions.filter(
        (s) =>
          s.position.from !== activeSuggestion.position.from ||
          s.position.to !== activeSuggestion.position.to
      )
    );

    setActiveSuggestion(null);
  }, [activeSuggestion, suggestions]);

  return {
    contentDivRef,
    suggestions,
    activeSuggestion,
    tooltipPosition,
    isLoading,
    handleContentInput,
    checkWriting,
    applySuggestion,
    ignoreSuggestion,
    handleSuggestionHover,
    handleSuggestionLeave,
  };
}
