import { useCallback, useState } from "react";
import { Editor } from "@tiptap/react";
import { WritingSuggestion } from "./types";

export const useWritingApi = (
  editor: Editor | null,
  setSuggestions: (suggestions: WritingSuggestion[]) => void
) => {
  const [isChecking, setIsChecking] = useState(false);

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
    } catch (error) {
      console.error("Error checking writing:", error);
    } finally {
      setIsChecking(false);
    }
  }, [editor, setSuggestions]);

  return {
    isChecking,
    checkWriting,
  };
}; 