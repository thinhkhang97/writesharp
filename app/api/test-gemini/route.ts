import { NextResponse } from 'next/server';
import { testGeminiConnection } from '@/lib/gemini';
import { NextRequest } from 'next/server';

// Test basic connection
export async function GET() {
  try {
    const result = await testGeminiConnection();
    
    if (result.success) {
      return NextResponse.json({ 
        status: 'success', 
        message: 'Gemini API is properly configured', 
        details: result.message 
      });
    } else {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Failed to connect to Gemini API', 
        details: result.message 
      }, { status: 500 });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ 
      status: 'error', 
      message: 'An unexpected error occurred', 
      details: errorMessage 
    }, { status: 500 });
  }
}

// Test ideas API with foundation information
export async function POST(request: NextRequest) {
  try {
    // Create a sample request to the ideas API
    const response = await fetch(`${request.nextUrl.origin}/api/ideas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        existingIdeas: ["The importance of daily exercise", "How exercise affects mental health"],
        foundation: {
          topic: "Health and Wellness",
          audience: "Young adults (18-30)",
          purpose: "Educational blog post"
        }
      })
    });

    const data = await response.json();
    
    return NextResponse.json({
      status: 'success',
      message: 'Test of ideas API with foundation information',
      result: data
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to test ideas API', 
      details: errorMessage 
    }, { status: 500 });
  }
} 