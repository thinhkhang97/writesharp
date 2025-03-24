"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, ArrowLeft, Save, FileText } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createDraft } from "@/app/drafts/actions";

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
      router.push(`/drafts/${draft.id}`);

      toast.success("New draft created!");
    } catch (error) {
      console.error("Error creating draft:", error);
      toast.error("Failed to create new draft. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
      <div className="flex items-center space-x-3">
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          My Drafts
        </h1>
      </div>
      <Button
        onClick={handleCreateDraft}
        disabled={isCreating}
        className="flex items-center gap-2 shadow-md transition-all duration-200 hover:shadow-lg bg-gradient-to-r from-blue-600 to-purple-600"
      >
        <PlusCircle className="h-4 w-4" />
        {isCreating ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Creating...
          </span>
        ) : (
          "New Draft"
        )}
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
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg glass">
      <div className="flex items-center gap-4">
        <Link href={`/drafts/${draftId}`}>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Draft
          </Button>
        </Link>
        <h1 className="text-xl font-semibold truncate max-w-[300px]">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        {/* Last saved indicator */}
        <div className="text-sm text-muted-foreground bg-white/20 px-3 py-1 rounded-full">
          {lastSaved ? (
            <span>
              Saved at{" "}
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
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500"
        >
          {isSaving ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </span>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
