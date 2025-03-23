"use client";

import React from "react";
import { WritingSuggestion, TooltipPosition } from "./types";

interface BadgeProps {
  variant: "default" | "destructive";
  className?: string;
  children: React.ReactNode;
}

function Badge({ variant, className, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        variant === "destructive"
          ? "bg-red-100 text-red-800"
          : "bg-blue-100 text-blue-800"
      } ${className || ""}`}
    >
      {children}
    </span>
  );
}

interface SuggestionTooltipProps {
  suggestion: WritingSuggestion | null;
  position: TooltipPosition;
  applySuggestion: () => void;
  ignoreSuggestion: () => void;
}

export function SuggestionTooltip({
  suggestion,
  position,
  applySuggestion,
  ignoreSuggestion,
}: SuggestionTooltipProps) {
  if (!suggestion) return null;

  return (
    <div
      className="suggestion-tooltip bg-white rounded-lg border border-gray-200 p-3 w-[300px]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <Badge
          variant={suggestion.type === "grammar" ? "destructive" : "default"}
          className="capitalize"
        >
          {suggestion.type}
        </Badge>
      </div>

      <div className="mb-3">
        <div className="flex gap-2 items-center mb-1">
          <span className="text-sm font-medium text-gray-600">Original:</span>
          <span className="text-sm font-normal">{suggestion.original}</span>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium text-gray-600">Suggestion:</span>
          <span className="text-sm font-medium text-blue-600">
            {suggestion.suggestion}
          </span>
        </div>
      </div>

      {suggestion.explanation && (
        <div className="mb-3">
          <p className="text-xs text-gray-600">{suggestion.explanation}</p>
        </div>
      )}

      <div className="flex justify-between gap-2 mt-2">
        <button
          className="apply-suggestion-btn flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          onClick={applySuggestion}
        >
          Apply
        </button>
        <button
          className="ignore-suggestion-btn flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          onClick={ignoreSuggestion}
        >
          Ignore
        </button>
      </div>
    </div>
  );
}
