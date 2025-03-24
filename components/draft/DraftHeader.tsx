"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createDraft } from "@/app/dashboard/drafts/actions";

export interface DraftHeaderProps {
  userId: string;
}

export default function DraftHeader({ userId }: DraftHeaderProps) {
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

export interface DraftEditHeaderProps {
  draftId: string;
  title: string;
  onSave: () => void;
  isSaving: boolean;
  lastSaved: Date | null;
}

export function DraftEditHeader({
  draftId,
  title,
  onSave,
  isSaving,
  lastSaved,
}: DraftEditHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/drafts/${draftId}`}>
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Draft
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Edit Draft: {title}</h1>
      </div>
      <div className="flex items-center gap-3">
        {/* Last saved indicator */}
        <div className="text-sm text-muted-foreground">
          {lastSaved ? (
            <span>
              Last saved{" "}
              {new Date(lastSaved).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          ) : (
            "Not saved yet"
          )}
        </div>

        {/* Manual save button */}
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
