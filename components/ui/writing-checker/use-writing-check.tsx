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

  const formatContentWithLineBreaks = (text: string) => {
    return text.replace(/\n/g, "<br>") || "<br>";
  };

  // When value changes, update the display
  useEffect(() => {
    if (contentDivRef.current) {
      // Don't update if user is currently editing
      if (document.activeElement !== contentDivRef.current) {
        if (
          contentDivRef.current.innerHTML !== formatContentWithLineBreaks(value)
        ) {
          // Update the text with proper line breaks
          contentDivRef.current.innerHTML = formatContentWithLineBreaks(value);
        }
      }
    }
  }, [value]);

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

    // When content changes, clear suggestions since positions will be invalid
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

  // Add event handlers after updating highlights
  useEffect(() => {
    if (!contentDivRef.current || suggestions.length === 0) return;

    // First remove any existing event handlers to prevent duplicates
    const cleanup = () => {
      if (!contentDivRef.current) return;

      const existingElements = contentDivRef.current.querySelectorAll(
        ".grammar-error, .word-choice-suggestion"
      );

      existingElements.forEach((element) => {
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

    // Clean up existing handlers
    cleanup();

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
    return cleanup;
  }, [suggestions, handleSuggestionHover, handleSuggestionLeave]);

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
      // Get the plain text content without any spans
      const plainContent = value;

      // Clear existing suggestions before making new request
      setSuggestions([]);
      setActiveSuggestion(null);

      // Update contentDivRef to show plain content without highlights
      if (contentDivRef.current) {
        contentDivRef.current.innerHTML =
          formatContentWithLineBreaks(plainContent);
      }

      // Call API endpoint with plain text
      const response = await fetch("/api/drafts/check-writing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: plainContent }),
      });

      if (!response.ok) throw new Error("Failed to check writing");

      const data = await response.json();

      // Process the tagged content
      const { taggedContent, suggestions: newSuggestions } = data;

      // Set suggestions for tooltip display
      setSuggestions(newSuggestions);

      // Process the tagged content to replace tags with spans
      if (contentDivRef.current) {
        // First convert line breaks in the tagged content to <br> tags for HTML display
        let processedContent = taggedContent.replace(/\n/g, "<br>");

        // Replace grammar tags with spans
        processedContent = processedContent.replace(
          /<grammar suggestion="([^"]*)" explanation="([^"]*)">([^<]*)<\/grammar>/g,
          (
            match: string,
            suggestion: string,
            explanation: string,
            text: string
          ) => {
            const suggestionData = encodeURIComponent(
              JSON.stringify({
                type: "grammar",
                original: text,
                suggestion,
                explanation,
              })
            );

            return `<span class="grammar-error" data-suggestion="${suggestionData}" style="background-color: rgba(239, 68, 68, 0.1)">${text}</span>`;
          }
        );

        // Replace wordchoice tags with spans
        processedContent = processedContent.replace(
          /<wordchoice suggestion="([^"]*)" explanation="([^"]*)">([^<]*)<\/wordchoice>/g,
          (
            match: string,
            suggestion: string,
            explanation: string,
            text: string
          ) => {
            const suggestionData = encodeURIComponent(
              JSON.stringify({
                type: "word-choice",
                original: text,
                suggestion,
                explanation,
              })
            );

            return `<span class="word-choice-suggestion" data-suggestion="${suggestionData}" style="background-color: rgba(59, 130, 246, 0.1)">${text}</span>`;
          }
        );

        // Update the content with processed HTML
        contentDivRef.current.innerHTML = processedContent || "<br>";
      }

      // The highlighting is already done by replacing tags, so we don't need updateHighlightedContent
    } catch (error) {
      console.error("Error checking writing:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Define these as useCallbacks to stabilize their identity
  const applySuggestion = useCallback(() => {
    if (!activeSuggestion) return;

    const { original, suggestion } = activeSuggestion;

    // Create a new DOM parser to safely find and replace text
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      contentDivRef.current?.innerHTML || "",
      "text/html"
    );

    // Find the span element with this suggestion
    const spans = doc.querySelectorAll(
      ".grammar-error, .word-choice-suggestion"
    );
    let targetSpan: Element | null = null;

    for (const span of spans) {
      const spanData = span.getAttribute("data-suggestion");
      if (spanData) {
        try {
          const suggestionData = JSON.parse(decodeURIComponent(spanData));
          if (suggestionData.original === original) {
            targetSpan = span;
            break;
          }
        } catch (e) {
          console.error("Error parsing span data", e);
        }
      }
    }

    // Replace the content if found
    if (targetSpan) {
      // Apply the suggestion while preserving any HTML formatting
      // like line breaks within the content
      targetSpan.outerHTML = suggestion;

      // Update the content
      if (contentDivRef.current) {
        contentDivRef.current.innerHTML = doc.body.innerHTML;
      }

      // Convert HTML back to plain text while properly handling line breaks
      const htmlContent = doc.body.innerHTML;
      const plainText = htmlContent
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<div>/gi, "\n")
        .replace(/<\/div>/gi, "")
        .replace(/&nbsp;/gi, " ");

      const decodedText =
        parser.parseFromString(plainText, "text/html").body.textContent || "";

      onChange(decodedText);
    }

    // Remove this suggestion from the list
    setSuggestions(
      suggestions.filter(
        (s) =>
          !(
            s.original === activeSuggestion.original &&
            s.suggestion === activeSuggestion.suggestion
          )
      )
    );

    setActiveSuggestion(null);
  }, [activeSuggestion, onChange, suggestions]);

  const ignoreSuggestion = useCallback(() => {
    if (!activeSuggestion) return;

    // Just remove from the list
    setSuggestions(
      suggestions.filter(
        (s) =>
          !(
            s.original === activeSuggestion.original &&
            s.suggestion === activeSuggestion.suggestion
          )
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
