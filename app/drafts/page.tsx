import { redirect } from "next/navigation";

import DraftHeader from "@/components/draft/DraftHeader";
import DraftList from "@/components/draft/DraftList";
import { createClient } from "@/utils/supabase/server";
import { getDraftsByUserId } from "./actions";

export default async function DraftsPage() {
  // Initialize Supabase client
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user drafts
  const userId = user.id;
  const drafts = await getDraftsByUserId(userId);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 md:px-8 page-transitions">
      <DraftHeader userId={userId} />
      <DraftList initialDrafts={drafts} userId={userId} />
    </div>
  );
}
