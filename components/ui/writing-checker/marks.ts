import { Mark } from "@tiptap/core";

// Define custom marks for grammar and word choice issues
export const GrammarMark = Mark.create({
  name: "grammar",
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  addAttributes() {
    return {
      suggestion: {
        default: null,
      },
      explanation: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [{ tag: "grammar" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      {
        ...HTMLAttributes,
        class: "grammar-issue",
        "data-suggestion": HTMLAttributes.suggestion,
        "data-explanation": HTMLAttributes.explanation,
      },
      0,
    ];
  },
});

export const WordChoiceMark = Mark.create({
  name: "wordchoice",
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  addAttributes() {
    return {
      suggestion: {
        default: null,
      },
      explanation: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [{ tag: "wordchoice" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      {
        ...HTMLAttributes,
        class: "wordchoice-issue",
        "data-suggestion": HTMLAttributes.suggestion,
        "data-explanation": HTMLAttributes.explanation,
      },
      0,
    ];
  },
}); 