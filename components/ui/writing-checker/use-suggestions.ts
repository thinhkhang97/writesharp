import { useCallback, useState } from "react";
import { Editor } from "@tiptap/react";
import { WritingSuggestion } from "./types";

export const useSuggestions = (editor: Editor | null, onSuggestionsChange?: (suggestions: WritingSuggestion[]) => void) => {
  const [suggestions, setSuggestions] = useState<WritingSuggestion[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState<WritingSuggestion | null>(null);
  
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
      }
    },
    [editor]
  );

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
      }
    },
    [editor]
  );

  // Update suggestions and notify parent if callback exists
  const updateSuggestions = useCallback((newSuggestions: WritingSuggestion[]) => {
    setSuggestions(newSuggestions);
    if (onSuggestionsChange) {
      onSuggestionsChange(newSuggestions);
    }
  }, [onSuggestionsChange]);

  return {
    suggestions,
    activeSuggestion,
    setActiveSuggestion,
    setSuggestions: updateSuggestions,
    applySuggestion,
    ignoreSuggestion,
  };
}; 