'use server'

import { createClient } from '@/utils/supabase/server'
import { Draft, Idea } from '@/lib/types'
import { revalidatePath } from 'next/cache'

/**
 * Creates a new draft (server action)
 */
export async function createDraft(userId: string): Promise<Draft> {
  // Initialize authenticated Supabase client
  const supabase = await createClient()

  const now = new Date().toISOString()
  const defaultTitle = `Untitled - ${new Date().toLocaleDateString()}`
  
  const newDraft = {
    user_id: userId,
    title: defaultTitle,
    content: '',
    foundation: { purpose: '', audience: '', topic: '' },
    ideas: [],
    status: 'In Progress',
    created_at: now,
    updated_at: now
  }

  const { data, error } = await supabase
    .from('drafts')
    .insert([newDraft])
    .select()
    .single()

  if (error) {
    console.error('Error creating draft:', error)
    throw error
  }

  // Revalidate drafts page
  revalidatePath('/drafts')
  
  return data
}

/**
 * Fetches all drafts for a user
 */
export async function getDraftsByUserId(userId: string): Promise<Draft[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('drafts')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching drafts:', error)
    throw error
  }

  return data || []
}

/**
 * Fetches a single draft by ID
 */
export async function getDraftById(draftId: string): Promise<Draft | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('drafts')
    .select('*')
    .eq('id', draftId)
    .single()

  if (error) {
    console.error('Error fetching draft:', error)
    throw error
  }

  return data
}

export async function updateDraft(draftId: string, data: Partial<Draft>): Promise<Draft> {
  const supabase = await createClient()
  const { data: updatedDraft, error } = await supabase
    .from('drafts')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', draftId)
    .select()
    .single()

  if (error) {
    console.error('Error updating draft:', error)
    throw error
  }

  return updatedDraft
}


/**
 * Updates draft status
 */
export async function updateDraftStatus(draftId: string, status: 'In Progress' | 'Feedback Ready'): Promise<Draft> {
  const updatedDraft = await updateDraft(draftId, { status })
  
  // If status is 'Feedback Ready', trigger the evaluation
  if (status === 'Feedback Ready') {
    await triggerEvaluation(draftId)
  }
  
  return updatedDraft
} 

/**
 * Deletes a draft
 */
export async function deleteDraft(draftId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('drafts')
    .delete()
    .eq('id', draftId)

  if (error) {
    console.error('Error deleting draft:', error)
    throw error
  }
}

/**
 * Updates ideas for a draft
 */
export async function updateIdeas(draftId: string, ideas: Idea[]): Promise<Draft> {
  return updateDraft(draftId, { ideas })
}

/**
 * Triggers the evaluation of a draft
 */
export async function triggerEvaluation(draftId: string): Promise<void> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/evaluate-draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ draftId }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error evaluating draft:', errorData)
    }
  } catch (error) {
    console.error('Error triggering evaluation:', error)
  }
}

/**
 * Saves a draft and triggers evaluation
 */
export async function saveDraftWithEvaluation(draftId: string, data: Partial<Draft>): Promise<Draft> {
  const updatedDraft = await updateDraft(draftId, data)
  
  // If content is provided and not empty, trigger evaluation
  if (data.content && data.content.trim().length > 0) {
    await triggerEvaluation(draftId)
  }
  
  return updatedDraft
}