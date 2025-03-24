import { evaluateDraft } from '@/lib/skillEvaluator';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { draftId } = body;

    if (!draftId) {
      return NextResponse.json(
        { error: 'Draft ID is required' },
        { status: 400 }
      );
    }

    // Get the draft data from Supabase
    const { data: draft, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('id', draftId)
      .single();

    if (error || !draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    // Evaluate the draft
    const evaluation = await evaluateDraft(draft.content, draft.foundation);

    // Update the draft with the evaluation
    const { error: updateError } = await supabase
      .from('drafts')
      .update({ evaluation })
      .eq('id', draftId);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update draft with evaluation' },
        { status: 500 }
      );
    }

    // Save the evaluation to the writer_profiles table
    await saveToWriterProfile(supabase, draft.user_id, evaluation);

    return NextResponse.json({ success: true, evaluation });
  } catch (error) {
    console.error('Error evaluating draft:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function saveToWriterProfile(supabase: any, userId: string, evaluation: any) {
  try {
    // Get existing evaluations for this user
    const { data: profile, error: profileError } = await supabase
      .from('writer_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 is "no rows found" error, which is fine for new users
      console.error('Error fetching writer profile:', profileError);
      return;
    }

    // If profile exists, update it, otherwise create a new one
    const evaluations = profile?.evaluations || [];
    evaluations.push(evaluation);

    // Keep only the most recent 10 evaluations
    const recentEvaluations = evaluations.slice(-10);

    if (profile) {
      await supabase
        .from('writer_profiles')
        .update({ 
          evaluations: recentEvaluations,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      await supabase
        .from('writer_profiles')
        .insert({
          user_id: userId,
          evaluations: [evaluation],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Error saving to writer profile:', error);
  }
} 