"use client";

import React from "react";

interface ContentEditorProps {
  contentDivRef: React.RefObject<HTMLDivElement>;
  handleContentInput: (e: React.FormEvent<HTMLDivElement>) => void;
  isLoading: boolean;
}

export function ContentEditor({
  contentDivRef,
  handleContentInput,
  isLoading,
}: ContentEditorProps) {
  return (
    <div className="relative w-full">
      <div
        ref={contentDivRef}
        contentEditable={!isLoading}
        className="w-full p-4 border border-gray-300 rounded-md min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        onInput={handleContentInput}
        spellCheck={false}
        data-gramm="false"
        suppressContentEditableWarning
      />
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  );
}
