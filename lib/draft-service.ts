import { supabase } from './supabase'
import { Draft } from './types'

/**
 * Fetches all drafts for a user
 */
export async function getDraftsByUserId(userId: string): Promise<Draft[]> {
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

/**
 * Creates a new draft
 */
export async function createDraft(userId: string, data?: Partial<Draft>): Promise<Draft> {
  const now = new Date().toISOString()
  const defaultTitle = `Untitled - ${new Date().toLocaleDateString()}`
  
  const newDraft = {
    user_id: userId,
    title: data?.title || defaultTitle,
    content: data?.content || '',
    foundation: data?.foundation || { purpose: '', audience: '', topic: '' },
    ideas: data?.ideas || [],
    status: 'In Progress',
    created_at: now,
    updated_at: now
  }

  const { data: createdDraft, error } = await supabase
    .from('drafts')
    .insert([newDraft])
    .select()
    .single()

  if (error) {
    console.error('Error creating draft:', error)
    throw error
  }

  return createdDraft
}

/**
 * Updates an existing draft
 */
export async function updateDraft(draftId: string, data: Partial<Draft>): Promise<Draft> {
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
 * Deletes a draft
 */
export async function deleteDraft(draftId: string): Promise<void> {
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
 * Updates draft status
 */
export async function updateDraftStatus(draftId: string, status: 'In Progress' | 'Feedback Ready'): Promise<Draft> {
  return updateDraft(draftId, { status })
} 