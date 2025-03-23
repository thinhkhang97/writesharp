"use client";

import React from "react";

interface ToolbarProps {
  checkWriting: () => Promise<void>;
  isLoading: boolean;
  hasContent: boolean;
}

export function Toolbar({ checkWriting, isLoading, hasContent }: ToolbarProps) {
  return (
    <div className="flex justify-between items-center p-2 border-t border-gray-200">
      <div>
        <button
          onClick={checkWriting}
          disabled={isLoading || !hasContent}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
            isLoading || !hasContent
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isLoading ? "Checking..." : "Check my writing"}
        </button>
      </div>
      <div className="text-xs text-gray-500">
        {hasContent
          ? "Click 'Check my writing' to get suggestions."
          : "Add some content to check your writing."}
      </div>
    </div>
  );
}
