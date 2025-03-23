"use client";

import React from "react";
import { Button } from "../button";
import { useWritingCheck } from "./use-writing-check";
import { Loader2, Check, X } from "lucide-react";

interface WritingCheckerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function WritingChecker({
  value,
  onChange,
  className = "",
}: WritingCheckerProps) {
  const {
    editor,
    EditorContent,
    editorRef,
    activeSuggestion,
    tooltipPosition,
    isChecking,
    checkWriting,
    applySuggestion,
    ignoreSuggestion,
  } = useWritingCheck({
    value,
    onChange,
  });

  return (
    <div className="relative">
      {/* Editor */}
      <div
        ref={editorRef}
        className={`w-full border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent ${className}`}
      >
        {/* Tiptap Editor */}
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none"
        />
      </div>

      {/* Check Button */}
      <div className="mt-2 flex justify-end">
        <Button
          onClick={checkWriting}
          disabled={isChecking}
          variant="outline"
          className="relative"
        >
          {isChecking ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>Check Writing</>
          )}
        </Button>
      </div>

      {/* Tooltip */}
      {activeSuggestion && tooltipPosition && (
        <div
          className="suggestion-tooltip bg-white border border-gray-200 rounded-md shadow-lg p-4 max-w-sm absolute z-10 transition-opacity duration-200"
          style={{
            top: `${tooltipPosition.y}px`,
            left: `${tooltipPosition.x}px`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="font-medium">
            {activeSuggestion.type === "grammar" ? "Grammar" : "Word Choice"}
          </div>
          <div className="mt-1 text-sm">
            <span className="font-medium">Original:</span>{" "}
            <span className="text-red-500">{activeSuggestion.original}</span>
          </div>
          <div className="mt-1 text-sm">
            <span className="font-medium">Suggestion:</span>{" "}
            <span className="text-green-500">
              {activeSuggestion.suggestion}
            </span>
          </div>
          <div className="mt-1 text-sm text-gray-600">
            {activeSuggestion.explanation}
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              onClick={() => applySuggestion(activeSuggestion)}
              className="apply-suggestion-btn flex-1"
            >
              <Check className="h-4 w-4 mr-1" />
              Apply
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => ignoreSuggestion(activeSuggestion)}
              className="ignore-suggestion-btn flex-1"
            >
              <X className="h-4 w-4 mr-1" />
              Ignore
            </Button>
          </div>
        </div>
      )}

      {/* Combined styles for marks and tooltips */}
      <style jsx global>{`
        /* Grammar and word choice marks */
        .grammar-issue {
          text-decoration: underline;
          text-decoration-color: #ef4444;
          text-decoration-style: wavy;
          cursor: pointer;
          background-color: rgba(239, 68, 68, 0.1);
        }
        .wordchoice-issue {
          text-decoration: underline;
          text-decoration-color: #3b82f6;
          text-decoration-style: wavy;
          cursor: pointer;
          background-color: rgba(59, 130, 246, 0.1);
        }

        /* Tooltip styles */
        .suggestion-tooltip::before {
          content: "";
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 0 8px 8px 8px;
          border-style: solid;
          border-color: transparent transparent #e5e7eb transparent;
        }

        .suggestion-tooltip {
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
