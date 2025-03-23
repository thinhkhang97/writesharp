import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { existingIdeas, ideaIndex, foundation } = body;

    if (!existingIdeas || !Array.isArray(existingIdeas)) {
      return NextResponse.json(
        { error: 'Invalid request. Expected array of existingIdeas.' },
        { status: 400 }
      );
    }

    // Generate a prompt for Gemini based on existing ideas and foundation info
    const promptForGemini = createPromptForGemini(existingIdeas, foundation);
    
    // Call Gemini API to generate the suggestion
    const suggestion = await generateWithGemini(promptForGemini);

    // If ideaIndex is provided, return it along with the suggestion
    // Otherwise, just return the suggestion (for the input field guidance)
    const response = ideaIndex !== undefined
      ? { suggestion, ideaIndex }
      : { suggestion };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating suggestion with Gemini:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestion' },
      { status: 500 }
    );
  }
}

interface FoundationInfo {
  topic?: string;
  audience?: string;
  purpose?: string;
}

function createPromptForGemini(existingIdeas: string[], foundation?: FoundationInfo): string {
  let prompt = "You are a creative writing assistant. ";
  
  // Add foundation information if available
  if (foundation) {
    prompt += "Here's some information about what the user is writing:\n\n";
    
    if (foundation.topic) {
      prompt += `Topic: ${foundation.topic}\n`;
    }
    
    if (foundation.audience) {
      prompt += `Target audience: ${foundation.audience}\n`;
    }
    
    if (foundation.purpose) {
      prompt += `Purpose: ${foundation.purpose}\n`;
    }
    
    prompt += "\n";
  }
  
  if (existingIdeas.length === 0) {
    prompt += "The user is starting to brainstorm ideas for a piece of writing. Provide a thought-provoking question to help them get started. Keep it concise (20 words or less).";
  } else {
    prompt += `The user is brainstorming ideas and has already written the following points:\n\n${existingIdeas.map((idea, i) => `${i+1}. ${idea}`).join('\n')}\n\nBased on these ideas, provide a thought-provoking question or suggestion to help them develop their thinking further. Keep it concise (20 words or less).`;
  }
  
  return prompt;
} 