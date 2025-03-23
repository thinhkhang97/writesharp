"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createDraft } from "@/app/dashboard/drafts/actions";

export default function DraftHeader({ userId }: { userId: string }) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateDraft = async () => {
    try {
      setIsCreating(true);

      if (!userId) {
        toast.error("You must be logged in to create a draft.");
        return;
      }

      // Create new draft using server action
      const draft = await createDraft(userId);

      // Navigate to the new draft
      router.push(`/dashboard/drafts/${draft.id}`);

      toast.success("New draft created!");
    } catch (error) {
      console.error("Error creating draft:", error);
      toast.error("Failed to create new draft. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold">My Drafts</h1>
      <Button
        onClick={handleCreateDraft}
        disabled={isCreating}
        className="flex items-center gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        {isCreating ? "Creating..." : "New Draft"}
      </Button>
    </div>
  );
}
