export interface WritingSuggestion {
  type: "grammar" | "word-choice";
  position: { from: number; to: number };
  original: string;
  suggestion: string;
  explanation: string;
}

export interface TooltipPosition {
  top: number;
  left: number;
} 