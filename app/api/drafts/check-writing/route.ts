import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '../../../../lib/gemini';

interface WritingSuggestion {
  type: "grammar" | "word-choice";
  position: { from: number; to: number };
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

    // Create a prompt for Gemini to analyze the writing
    const prompt = `
    Analyze the following text for grammar errors and weak word choices:

    ${content}

    For each issue found, return a JSON object with the following format:
    {
      "suggestions": [
        {
          "type": "grammar" or "word-choice",
          "original": "<original text>",
          "suggestion": "<suggested correction>",
          "explanation": "<brief explanation why this is better>"
        },
        ...more suggestions
      ]
    }

    Grammar issues should be marked as "grammar" type and should include errors that muddle meaning.
    Word choice issues should be marked as "word-choice" type and should flag weak or unclear words.

    Only include actual issues - don't make up problems if the text is correct.
    Keep explanations concise and helpful (under 100 characters if possible).
    Limit to max 10 most important suggestions.
    `;

    const geminiResponse = await generateWithGemini(prompt);
    
    // Extract JSON from the response
    let suggestions: Omit<WritingSuggestion, 'position'>[] = [];
    
    try {
      // Find JSON in the response (it might include other text)
      const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        suggestions = parsedResponse.suggestions || [];
      } else {
        // If no JSON found, attempt to parse the entire response as JSON
        const parsedResponse = JSON.parse(geminiResponse);
        suggestions = parsedResponse.suggestions || [];
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      return NextResponse.json(
        { message: 'Failed to parse writing suggestions', error: parseError },
        { status: 500 }
      );
    }

    // Add position information for each suggestion by finding the text in the content
    const suggestionsWithPosition: WritingSuggestion[] = suggestions.map(suggestion => {
      const { original } = suggestion;
      
      // Find the position of this text in the content
      const from = content.indexOf(original);
      const to = from + original.length;
      
      // Only include valid positions (text was found in content)
      if (from !== -1) {
        return {
          ...suggestion,
          position: { from, to }
        };
      }
      
      // If we can't find the exact text, use a fuzzy match approach
      // This is a simple implementation, could be enhanced with better algorithms
      for (let i = 0; i < content.length - 3; i++) {
        // Try to find a close match (at least 3 characters)
        if (original.length >= 3) {
          const firstThreeChars = original.substring(0, 3);
          if (content.substring(i, i + 3) === firstThreeChars) {
            // Potential match found, check if rest of string is similar
            const potentialMatch = content.substring(i, i + original.length);
            if (similarityScore(potentialMatch, original) > 0.7) {
              return {
                ...suggestion,
                position: { from: i, to: i + original.length }
              };
            }
          }
        }
      }
      
      // If we still can't find it, return a default position
      // This is to ensure we don't break the client-side, but this suggestion
      // likely won't be properly highlighted
      return {
        ...suggestion,
        position: { from: 0, to: 0 }
      };
    }).filter(suggestion => {
      // Filter out suggestions where we couldn't find a valid position
      return suggestion.position.from !== suggestion.position.to;
    });

    return NextResponse.json({ suggestions: suggestionsWithPosition });
  } catch (error) {
    console.error('Error checking writing:', error);
    return NextResponse.json(
      { message: 'Failed to check writing', error },
      { status: 500 }
    );
  }
}

// Simple string similarity function
function similarityScore(a: string, b: string): number {
  if (a === b) return 1.0;
  if (a.length === 0 || b.length === 0) return 0.0;
  
  // Count matching characters
  let matches = 0;
  const maxLength = Math.max(a.length, b.length);
  
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] === b[i]) matches++;
  }
  
  return matches / maxLength;
} 