import { redirect } from "next/navigation";

import DraftHeader from "@/components/draft/DraftHeader";
import DraftList from "@/components/draft/DraftList";
import { getDraftsByUserId } from "@/lib/draft-service";
import { createClient } from "@/utils/supabase/server";

export default async function DraftsPage() {
  // Initialize Supabase client
  const supabase = await createClient();
  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session, redirect to login
  if (!session) {
    redirect("/auth/login");
  }

  // Get user drafts
  const userId = session.user.id;
  const drafts = await getDraftsByUserId(userId);

  return (
    <div className="container mx-auto py-8">
      <DraftHeader />
      <DraftList initialDrafts={drafts} userId={userId} />
    </div>
  );
}
