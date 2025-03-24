import { NextRequest, NextResponse } from 'next/server';
import { generateWritingReview } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { content, foundation, ideas } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      );
    }

    // Foundation and ideas are optional but should be strings if provided
    if (foundation && typeof foundation !== 'string') {
      return NextResponse.json(
        { error: 'Foundation must be a string if provided' },
        { status: 400 }
      );
    }

    if (ideas && typeof ideas !== 'string') {
      return NextResponse.json(
        { error: 'Ideas must be a string if provided' },
        { status: 400 }
      );
    }

    const reviewFeedback = await generateWritingReview(content, foundation, ideas);

    return NextResponse.json(reviewFeedback);
  } catch (error) {
    console.error('Error reviewing draft:', error);
    return NextResponse.json(
      { error: 'Failed to review draft content' },
      { status: 500 }
    );
  }
} 