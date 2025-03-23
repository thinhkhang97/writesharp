import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '../../../../lib/gemini';

interface WritingSuggestion {
  type: "grammar" | "word-choice";
  original: string;
  suggestion: string;
  explanation: string;
}

// Helper function to decode HTML entities that might be in the attributes
function decodeHtmlEntities(text: string): string {
  const entities = {
    '&quot;': '"',
    '&apos;': "'", 
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&'
  };
  
  return text.replace(/(&quot;|&apos;|&lt;|&gt;|&amp;)/g, match => entities[match as keyof typeof entities]);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { message: 'Content is required' },
        { status: 400 }
      );
    }

    // Create a prompt for Gemini to analyze the writing and return tagged content
    const prompt = `
    Analyze the following HTML content for grammar errors and weak word choices:

    ${content}

    Return the EXACT same HTML content but wrap each issue with these tags:
    - For grammar issues: <grammar suggestion="suggested correction" explanation="brief explanation">original text</grammar>
    - For word choice issues: <wordchoice suggestion="suggested word/phrase" explanation="brief explanation">original text</wordchoice>

    Important requirements:
    1. Only add tags around actual issues - don't make up problems if the text is correct.
    2. Keep explanations concise and helpful (under 100 characters if possible).
    3. Limit to max 10 most important suggestions.
    4. Preserve ALL line breaks and HTML structure exactly as they appear in the original content.
    5. The output should be the EXACT same HTML content with these tags inserted - don't change anything else.
    6. Make sure all attribute values in the suggestion and explanation are properly escaped for HTML (e.g., quotes).
    7. DO NOT create overlapping suggestions - each part of the text should be in at most one suggestion.
    8. If a sentence has multiple issues, prioritize fixing the entire sentence rather than individual words.
    9. For grammatically incorrect sentences, wrap the entire sentence and provide a fully corrected version.
    10. If a word is misspelled within an incorrect sentence, prioritize the sentence-level correction.
    `;

    const geminiResponse = await generateWithGemini(prompt, {});
    
    // Clean up the response by removing any extra markdown code blocks
    let cleanResponse = geminiResponse;
    // Remove markdown code blocks if present
    if (cleanResponse.startsWith("```html")) {
      cleanResponse = cleanResponse.replace(/^```html\n/, "");
    }
    if (cleanResponse.endsWith("```")) {
      cleanResponse = cleanResponse.replace(/```$/, "");
    }
    
    // Extract suggestions from the tagged content for UI highlighting
    // Using a robust regex that handles potential line breaks and special characters in attributes
    const suggestionRegex = /<(grammar|wordchoice) suggestion="(.*?)" explanation="(.*?)">([\s\S]*?)<\/(grammar|wordchoice)>/g;
    const suggestions: WritingSuggestion[] = [];
    let match;
    
    while ((match = suggestionRegex.exec(cleanResponse)) !== null) {
      const [, type, suggestion, explanation, original] = match;
      
      suggestions.push({
        type: type === 'grammar' ? 'grammar' : 'word-choice',
        original,
        suggestion: decodeHtmlEntities(suggestion),
        explanation: decodeHtmlEntities(explanation)
      });
    }

    return NextResponse.json({ 
      markedContent: cleanResponse,
      suggestions
    });
  } catch (error) {
    console.error('Error checking writing:', error);
    return NextResponse.json(
      { message: 'Failed to check writing', error },
      { status: 500 }
    );
  }
}
