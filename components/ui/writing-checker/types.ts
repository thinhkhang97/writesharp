export interface WritingSuggestion {
  type: "grammar" | "word-choice";
  original: string;
  suggestion: string;
  explanation: string;
}

export interface TooltipPosition {
  top: number;
  left: number;
} 