export interface WritingSuggestion {
  type: "grammar" | "word-choice";
  original: string;
  suggestion: string;
  explanation: string;
}

export interface TooltipPosition {
  x: number;
  y: number;
} 