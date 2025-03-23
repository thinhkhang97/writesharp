"use client";

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { WritingSuggestion } from "./types";
import { GrammarMark, WordChoiceMark } from "./marks";
import { useTooltipPosition } from "./use-tooltip-position";
import { useSuggestions } from "./use-suggestions";
import { useWritingApi } from "./use-writing-api";

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
  // Initialize tooltip position
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [StarterKit, GrammarMark, WordChoiceMark],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Initialize tooltip position handling
  const { editorRef, updateTooltipPosition } = useTooltipPosition();

  // Update content when value changes from outside
  useEffect(() => {
    if (!editor) return;

    if (editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // Initialize suggestions handling
  const {
    suggestions,
    activeSuggestion,
    setActiveSuggestion,
    setSuggestions,
    applySuggestion: applySuggestionBase,
    ignoreSuggestion: ignoreSuggestionBase,
  } = useSuggestions(editor, onSuggestionsChange);

  // Initialize API integration
  const { isChecking, checkWriting } = useWritingApi(editor, setSuggestions);

  // Handle hover detection
  useEffect(() => {
    const editorElement = editorRef.current;
    if (!editorElement || !editor) return;

    let hideTooltipTimeout: NodeJS.Timeout | null = null;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (hideTooltipTimeout) {
        clearTimeout(hideTooltipTimeout);
        hideTooltipTimeout = null;
      }

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

        const position = updateTooltipPosition(target);
        if (position) setTooltipPosition(position);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (relatedTarget && relatedTarget.closest(".suggestion-tooltip")) {
        return;
      }

      hideTooltipTimeout = setTimeout(() => {
        setActiveSuggestion(null);
        setTooltipPosition(null);
      }, 300);
    };

    editorElement.addEventListener("mouseover", handleMouseOver);
    editorElement.addEventListener("mouseout", handleMouseOut);

    return () => {
      editorElement.removeEventListener("mouseover", handleMouseOver);
      editorElement.removeEventListener("mouseout", handleMouseOut);
      if (hideTooltipTimeout) {
        clearTimeout(hideTooltipTimeout);
      }
    };
  }, [editorRef, editor, setActiveSuggestion, updateTooltipPosition]);

  // Wrap suggestion actions to also update tooltip position
  const applySuggestion = (suggestion: WritingSuggestion) => {
    applySuggestionBase(suggestion);
    setTooltipPosition(null);
  };

  const ignoreSuggestion = (suggestion: WritingSuggestion) => {
    ignoreSuggestionBase(suggestion);
    setTooltipPosition(null);
  };

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
  };
};
