"use client";

import { useMemo } from "react";
import { ContentEditor } from "./content-editor";
import { SuggestionTooltip } from "./suggestion-tooltip";
import { Toolbar } from "./toolbar";
import { useWritingCheck } from "./use-writing-check";

export interface WritingCheckerProps {
  value: string;
  onChange: (value: string) => void;
}

export function WritingChecker({ value, onChange }: WritingCheckerProps) {
  const {
    contentDivRef,
    activeSuggestion,
    tooltipPosition,
    isLoading,
    handleContentInput,
    checkWriting,
    applySuggestion,
    ignoreSuggestion,
  } = useWritingCheck(value, onChange);

  // Determine if we have content to check
  const hasContent = useMemo(() => value.trim().length > 0, [value]);

  return (
    <div className="writing-checker flex flex-col border rounded-lg overflow-hidden">
      <ContentEditor
        contentDivRef={contentDivRef}
        handleContentInput={handleContentInput}
        isLoading={isLoading}
      />

      <Toolbar
        checkWriting={checkWriting}
        isLoading={isLoading}
        hasContent={hasContent}
      />

      <SuggestionTooltip
        suggestion={activeSuggestion}
        position={tooltipPosition}
        applySuggestion={applySuggestion}
        ignoreSuggestion={ignoreSuggestion}
      />
    </div>
  );
}
