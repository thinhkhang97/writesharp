import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '../../../../lib/gemini';

interface WritingSuggestion {
  type: "grammar" | "word-choice";
  original: string;
  suggestion: string;
  explanation: string;
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
    Analyze the following text for grammar errors and weak word choices:

    ${content}

    Return the EXACT same text but wrap each issue with XML-like tags:
    - For grammar issues: <grammar suggestion="suggested correction" explanation="brief explanation">original text</grammar>
    - For word choice issues: <wordchoice suggestion="suggested word/phrase" explanation="brief explanation">original text</wordchoice>

    Important requirements:
    1. Only add tags around actual issues - don't make up problems if the text is correct.
    2. Keep explanations concise and helpful (under 100 characters if possible).
    3. Limit to max 10 most important suggestions.
    4. Preserve ALL line breaks exactly as they appear in the original text.
    5. The output should be the EXACT same text with these tags inserted - don't change anything else.
    `;

    const geminiResponse = await generateWithGemini(prompt, {});
    
    // Extract suggestions from the tagged content for UI highlighting
    // Using a more robust regex that handles potential line breaks and special characters in attributes
    const suggestionRegex = /<(grammar|wordchoice) suggestion="(.*?)" explanation="(.*?)">([\s\S]*?)<\/(grammar|wordchoice)>/g;
    const suggestions: WritingSuggestion[] = [];
    let match;
    
    while ((match = suggestionRegex.exec(geminiResponse)) !== null) {
      const [, type, suggestion, explanation, original] = match;
      
      suggestions.push({
        type: type === 'grammar' ? 'grammar' : 'word-choice',
        original,
        suggestion,
        explanation
      });
    }

    return NextResponse.json({ 
      taggedContent: geminiResponse,
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
