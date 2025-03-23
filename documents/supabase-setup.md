# Setting Up Draft Management in Supabase

This document describes how to set up the Draft Management system in Supabase for WriteSharp.

## Database Schema

The Draft Management system uses a `drafts` table with the following schema:

- `id` (uuid, primary key) - Unique draft ID
- `user_id` (uuid, foreign key) - Links to User.id
- `title` (string) - Draft name, defaults to "Untitled - [date]"
- `content` (text) - Written text
- `foundation` (json) - Purpose, audience, topic
- `ideas` (json) - Idea list
- `status` (string) - "In Progress" or "Feedback Ready"
- `created_at` (timestamp) - Save date
- `updated_at` (timestamp) - Last edit

## Setting Up Locally

1. Start your local Supabase instance:

   ```
   supabase start
   ```

2. Apply the migration:

   ```
   supabase migration up
   ```

   This will create the `drafts` table with appropriate indexes and row-level security policies.

## Setting Up in Production

1. Push the migration to your Supabase project:

   ```
   supabase db push
   ```

   Or use the Supabase web interface to run the SQL script directly.

## Security

The migration sets up Row Level Security (RLS) with the following policies:

- Users can only view their own drafts
- Users can only insert drafts with their own user_id
- Users can only update their own drafts
- Users can only delete their own drafts

## Automatic Timestamps

The migration includes a trigger to automatically update the `updated_at` timestamp whenever a draft is modified.

## Integration with the App

The Draft Management system is integrated with the app through:

1. Server-side API functions in `lib/draft-service.ts`
2. UI components in `components/draft/`
3. Pages in `app/dashboard/drafts/`

## Testing

You can test the Draft Management system by:

1. Creating a new user account
2. Navigating to the Dashboard
3. Clicking on "View Drafts"
4. Creating and editing drafts
