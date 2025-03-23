"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Check, X, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";

interface WritingSuggestion {
  type: "grammar" | "word-choice";
  position: { from: number; to: number };
  original: string;
  suggestion: string;
  explanation: string;
}

interface WritingCheckerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  characterCount?: boolean;
}

export function WritingChecker({
  value,
  onChange,
  className,
  characterCount = false,
}: WritingCheckerProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [suggestions, setSuggestions] = useState<WritingSuggestion[]>([]);
  const [activeSuggestion, setActiveSuggestion] =
    useState<WritingSuggestion | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentDivRef = useRef<HTMLDivElement>(null);

  // When value changes, update the display
  useEffect(() => {
    if (contentDivRef.current) {
      updateHighlightedContent();
    }
  }, [value, suggestions]);

  // Add event handlers after updating highlights
  useEffect(() => {
    if (isChecking && contentDivRef.current) {
      // Add click listeners to all suggestion elements instead of hover
      const suggestionElements = contentDivRef.current.querySelectorAll(
        ".grammar-error, .word-choice-suggestion"
      );

      suggestionElements.forEach((element) => {
        element.addEventListener(
          "click",
          handleSuggestionClick as EventListener
        );
      });

      // Cleanup function
      return () => {
        suggestionElements.forEach((element) => {
          element.removeEventListener(
            "click",
            handleSuggestionClick as EventListener
          );
        });
      };
    }
  }, [isChecking, suggestions]);

  const checkWriting = async () => {
    setIsChecking(true);

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
      setSuggestions(data.suggestions);

      // Update highlighted content
      updateHighlightedContent();
    } catch (error) {
      console.error("Error checking writing:", error);
    }
  };

  const updateHighlightedContent = () => {
    if (!contentDivRef.current) return;

    let html = value;

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

    // Debug: Log found suggestion elements after updating content
    console.log("Suggestions added:", sortedSuggestions.length);
    console.log(
      "Suggestion elements found:",
      contentDivRef.current.querySelectorAll(
        ".grammar-error, .word-choice-suggestion"
      ).length
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // If checking is active, clear suggestions when content changes
    if (isChecking && suggestions.length > 0) {
      setSuggestions([]);
      setActiveSuggestion(null);
    }
  };

  // Replace hover handler with click handler
  const handleSuggestionClick = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;

    const suggestionData = target.getAttribute("data-suggestion");

    if (suggestionData) {
      try {
        const suggestion = JSON.parse(
          decodeURIComponent(suggestionData)
        ) as WritingSuggestion;

        // Calculate tooltip position to show above the text
        const rect = target.getBoundingClientRect();

        // Estimate the tooltip height based on content
        const estimatedHeight = 150;

        // Check if there's enough space above
        let top = rect.top - 10;

        // If tooltip would go off the top of the viewport, position it below instead
        if (top - estimatedHeight < 0) {
          top = rect.bottom + 10;

          // Set a CSS class to indicate the tooltip should appear below
          setTimeout(() => {
            const tooltip = document.querySelector(".suggestion-tooltip");
            if (tooltip) {
              tooltip.classList.add("tooltip-below");
            }
          }, 0);
        } else {
          // Set CSS class for above positioning
          setTimeout(() => {
            const tooltip = document.querySelector(".suggestion-tooltip");
            if (tooltip) {
              tooltip.classList.add("tooltip-above");
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

  const stopChecking = useCallback(() => {
    setIsChecking(false);
    setSuggestions([]);
    setActiveSuggestion(null);
  }, []);

  // Add event handler for clicking buttons in tooltip
  useEffect(() => {
    const contentDiv = contentDivRef.current;
    if (!contentDiv) return;

    const handleClick = (e: Event) => {
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

    contentDiv.addEventListener("click", handleClick);

    return () => {
      contentDiv.removeEventListener("click", handleClick);
    };
  }, [activeSuggestion, applySuggestion, ignoreSuggestion]);

  // Add document click handler to close tooltip when clicking outside
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Don't close if clicking on a suggestion or the tooltip itself
      if (
        target.closest(".grammar-error") ||
        target.closest(".word-choice-suggestion") ||
        target.closest(".suggestion-tooltip") ||
        target.closest(".apply-suggestion-btn") ||
        target.closest(".ignore-suggestion-btn")
      ) {
        return;
      }

      // Close the tooltip when clicking elsewhere
      setActiveSuggestion(null);
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

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

  return (
    <div className={cn("relative w-full", className)}>
      <div className="flex flex-col">
        {/* Hidden textarea for editing */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          className="absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none"
          aria-hidden="true"
        />

        {/* Visible content with highlights */}
        <div
          ref={contentDivRef}
          className="prose max-w-none focus:outline-none min-h-[calc(100vh-22rem)] p-4 overflow-y-auto bg-white border rounded-md"
          contentEditable={true}
          onInput={(e) => {
            onChange((e.target as HTMLDivElement).innerText);
          }}
          onBlur={() => {
            if (textareaRef.current) {
              onChange(textareaRef.current.value);
            }
          }}
          suppressContentEditableWarning={true}
        >
          {value}
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center mt-2">
          <div>
            {characterCount && (
              <span className="text-xs text-gray-500">
                {value.length} characters
              </span>
            )}
          </div>
          <div>
            {isChecking ? (
              <button
                onClick={stopChecking}
                className="ml-auto text-sm flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
              >
                <X className="h-4 w-4" /> Stop Checking
              </button>
            ) : (
              <button
                onClick={checkWriting}
                className="ml-auto text-sm flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
              >
                <AlertCircle className="h-4 w-4" /> Check my writing
              </button>
            )}
          </div>
        </div>

        {/* Active suggestion tooltip */}
        {activeSuggestion && (
          <div
            className="suggestion-tooltip fixed z-50 bg-white border rounded-md shadow-lg p-3 max-w-xs text-sm"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              maxWidth: "300px", // Limit width to improve readability
            }}
          >
            <div className="relative">
              {/* Tooltip content */}
              <p
                className={
                  activeSuggestion.type === "grammar"
                    ? "text-red-600 text-xs font-medium"
                    : "text-blue-600 text-xs font-medium"
                }
              >
                <span className="font-medium">{activeSuggestion.original}</span>{" "}
                →{" "}
                <span className="font-medium">
                  {activeSuggestion.suggestion}
                </span>
              </p>
              <p className="text-gray-600 text-xs mt-1">
                {activeSuggestion.explanation}
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={applySuggestion}
                  className="apply-suggestion-btn text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center gap-1 font-medium"
                >
                  <Check className="h-3 w-3" /> Apply
                </button>
                <button
                  onClick={ignoreSuggestion}
                  className="ignore-suggestion-btn text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium"
                >
                  Ignore
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
