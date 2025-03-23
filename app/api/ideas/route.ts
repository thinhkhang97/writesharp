import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { existingIdeas, ideaIndex } = body;

    if (!existingIdeas || !Array.isArray(existingIdeas)) {
      return NextResponse.json(
        { error: 'Invalid request. Expected array of existingIdeas.' },
        { status: 400 }
      );
    }

    // Generate prompt based on existing ideas
    // In a production environment, you'd call an actual LLM API here (OpenAI, Anthropic, etc.)
    const prompt = generatePrompt(existingIdeas);

    // If ideaIndex is provided, return it along with the suggestion
    // Otherwise, just return the suggestion (for the input field guidance)
    const response = ideaIndex !== undefined
      ? { suggestion: prompt, ideaIndex }
      : { suggestion: prompt };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to generate prompt' },
      { status: 500 }
    );
  }
}

function generatePrompt(existingIdeas: string[]): string {
  // Simple prompt generation based on existing ideas
  // This is a basic implementation - in production, you'd use a more sophisticated approach
  
  // Check if any ideas are about habits
  if (existingIdeas.some(idea => idea.toLowerCase().includes('habit'))) {
    const habitPrompts = [
      "Ask yourself why people struggle to maintain new habits",
      "Consider what environmental factors support habit formation",
      "What metrics could track progress for this habit?",
      "How might this habit connect to identity formation?",
      "What obstacles prevent people from adopting this habit?"
    ];
    return habitPrompts[Math.floor(Math.random() * habitPrompts.length)];
  }
  
  // General prompts based on number of ideas
  if (existingIdeas.length === 0) {
    const startingPrompts = [
      "What problem are you trying to solve?",
      "Who is your target audience for this topic?",
      "What's a common misconception about this subject?",
      "What inspired your interest in this topic?",
      "What's the most surprising fact about this topic?"
    ];
    return startingPrompts[Math.floor(Math.random() * startingPrompts.length)];
  }
  
  if (existingIdeas.length >= 3) {
    const developmentPrompts = [
      "Consider adding a counterargument to one of your existing points",
      "How do these ideas connect with each other?",
      "What evidence would strengthen your most important point?",
      "Is there a real-world example that illustrates these concepts?",
      "What's a different perspective on this topic you haven't considered?"
    ];
    return developmentPrompts[Math.floor(Math.random() * developmentPrompts.length)];
  }
  
  // Default prompts
  const defaultPrompts = [
    "What specific aspect of this topic needs more exploration?",
    "How might someone disagree with these ideas?",
    "What's a practical application of these concepts?",
    "What historical context is relevant to this topic?",
    "How might these ideas evolve in the future?"
  ];
  return defaultPrompts[Math.floor(Math.random() * defaultPrompts.length)];
} 