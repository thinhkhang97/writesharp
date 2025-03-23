"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Mark } from "@tiptap/core";
import { WritingSuggestion } from "./types";

// Define custom marks for grammar and word choice issues
const GrammarMark = Mark.create({
  name: "grammar",
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  addAttributes() {
    return {
      suggestion: {
        default: null,
      },
      explanation: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [{ tag: "grammar" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      {
        ...HTMLAttributes,
        class: "grammar-issue",
        "data-suggestion": HTMLAttributes.suggestion,
        "data-explanation": HTMLAttributes.explanation,
      },
      0,
    ];
  },
});

const WordChoiceMark = Mark.create({
  name: "wordchoice",
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  addAttributes() {
    return {
      suggestion: {
        default: null,
      },
      explanation: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [{ tag: "wordchoice" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      {
        ...HTMLAttributes,
        class: "wordchoice-issue",
        "data-suggestion": HTMLAttributes.suggestion,
        "data-explanation": HTMLAttributes.explanation,
      },
      0,
    ];
  },
});

type TooltipPosition = {
  x: number;
  y: number;
};

export type WritingCheckProps = {
  value: string;
  onChange: (value: string) => void;
  onSuggestionsChange?: (suggestions: WritingSuggestion[]) => void;
};

export const useWritingCheck = ({
  value,
  onChange,
  onSuggestionsChange,
}: WritingCheckProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [suggestions, setSuggestions] = useState<WritingSuggestion[]>([]);
  const [activeSuggestion, setActiveSuggestion] =
    useState<WritingSuggestion | null>(null);
  const [tooltipPosition, setTooltipPosition] =
    useState<TooltipPosition | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [StarterKit, GrammarMark, WordChoiceMark],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    // Update content when value changes from outside
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  useEffect(() => {
    // Update suggestions list when found in the editor
    if (!editor) return;

    const editorElement = editorRef.current;

    if (editorElement) {
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
          setTooltipPosition(null);
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
        if (tooltip && activeSuggestion) {
          hideTooltipTimeout = setTimeout(() => {
            setActiveSuggestion(null);
            setTooltipPosition(null);
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
    }
  }, [editor, activeSuggestion]);

  const checkWriting = useCallback(async () => {
    if (!editor) return;

    setIsChecking(true);
    try {
      const content = editor.getHTML();
      const response = await fetch("/api/drafts/check-writing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to check writing");
      }

      const data = await response.json();
      const markedContent = data.markedContent;
      const extractedSuggestions = data.suggestions;

      // Update editor content with marked content
      editor.commands.setContent(markedContent);

      // Set suggestions
      setSuggestions(extractedSuggestions);
      if (onSuggestionsChange) {
        onSuggestionsChange(extractedSuggestions);
      }
    } catch (error) {
      console.error("Error checking writing:", error);
    } finally {
      setIsChecking(false);
    }
  }, [editor, onSuggestionsChange]);

  const applySuggestion = useCallback(
    (suggestion: WritingSuggestion) => {
      if (!editor) return;

      // Find the marked node
      const transaction = editor.state.tr;
      let found = false;

      editor.state.doc.descendants((node, pos) => {
        if (found) return false;

        // Check if node has marks matching our suggestion
        node.marks.forEach((mark) => {
          if (
            (mark.type.name === "grammar" || mark.type.name === "wordchoice") &&
            mark.attrs.suggestion === suggestion.suggestion &&
            !found
          ) {
            // Get the text content to confirm it matches our original
            const nodeText = node.textContent;

            if (nodeText.trim() === suggestion.original.trim()) {
              // Replace the node's text with the suggested text
              const to = pos + node.nodeSize;
              transaction.replaceWith(
                pos,
                to,
                editor.schema.text(suggestion.suggestion)
              );

              // Remove the suggestion from our list
              setSuggestions((prev) =>
                prev.filter(
                  (s) =>
                    !(
                      s.original === suggestion.original &&
                      s.suggestion === suggestion.suggestion
                    )
                )
              );

              found = true;
              return false;
            }
          }
        });

        return true;
      });

      if (found) {
        editor.view.dispatch(transaction);
        setActiveSuggestion(null);
        setTooltipPosition(null);
      }
    },
    [editor]
  );

  // More accurate tooltip positioning that accounts for scrolling
  const updateTooltipPosition = useCallback((target: HTMLElement) => {
    const editorElement = editorRef.current;
    if (!editorElement) return;

    const rect = target.getBoundingClientRect();
    const editorRect = editorElement.getBoundingClientRect();

    // Calculate position relative to the editor, accounting for scroll
    setTooltipPosition({
      x:
        rect.left - editorRect.left + rect.width / 2 + editorElement.scrollLeft,
      y: rect.top - editorRect.top + rect.height + editorElement.scrollTop,
    });
  }, []);

  const ignoreSuggestion = useCallback(
    (suggestion: WritingSuggestion) => {
      if (!editor) return;

      // Find the marked node
      const transaction = editor.state.tr;
      let found = false;

      editor.state.doc.descendants((node, pos) => {
        if (found) return false;

        // Check if node has marks matching our suggestion
        node.marks.forEach((mark) => {
          if (
            (mark.type.name === "grammar" || mark.type.name === "wordchoice") &&
            mark.attrs.suggestion === suggestion.suggestion &&
            !found
          ) {
            // Remove the mark but keep the text
            const to = pos + node.nodeSize;
            transaction.removeMark(pos, to, mark.type);

            // Remove the suggestion from our list
            setSuggestions((prev) =>
              prev.filter(
                (s) =>
                  !(
                    s.original === suggestion.original &&
                    s.suggestion === suggestion.suggestion
                  )
              )
            );

            found = true;
            return false;
          }
        });

        return true;
      });

      if (found) {
        editor.view.dispatch(transaction);
        setActiveSuggestion(null);
        setTooltipPosition(null);
      }
    },
    [editor]
  );

  return {
    isChecking,
    suggestions,
    activeSuggestion,
    tooltipPosition,
    editorRef,
    editor,
    EditorContent,
    checkWriting,
    applySuggestion,
    ignoreSuggestion,
    updateTooltipPosition,
  };
};
