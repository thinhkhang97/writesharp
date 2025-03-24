"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, Trash2, Eye, Clock, FileType } from "lucide-react";

import { Draft } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteDraft } from "@/app/drafts/actions";

interface DraftListProps {
  initialDrafts: Draft[];
  userId: string;
}

export default function DraftList({ initialDrafts }: DraftListProps) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Draft[]>(initialDrafts);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteDraft = async (draftId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this draft? This action cannot be undone."
      )
    ) {
      try {
        setIsDeleting(draftId);
        await deleteDraft(draftId);

        // Update local state
        setDrafts(drafts.filter((draft) => draft.id !== draftId));

        // Refresh the page
        router.refresh();

        toast.success("Draft deleted successfully!");
      } catch (error) {
        console.error("Error deleting draft:", error);
        toast.error("Failed to delete draft. Please try again.");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    }
  };

  if (drafts.length === 0) {
    return (
      <div className="text-center py-16 px-4 glass rounded-xl border border-white/30 shadow-glass">
        <div className="bg-blue-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
          <FileType className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-medium mb-3">No drafts yet</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Start writing by creating your first draft. Your writing journey
          begins here!
        </p>
        <Button
          onClick={() => router.refresh()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-opacity"
        >
          Create Your First Draft
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {drafts.map((draft) => (
        <div
          key={draft.id}
          className="glass rounded-xl p-5 transition-all duration-200 hover:shadow-glass-lg group"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {draft.title}
                </h3>
                <span
                  className={`px-2 py-1 text-xs leading-none font-medium rounded-full flex items-center gap-1 ${
                    draft.status === "Feedback Ready"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {draft.status === "Feedback Ready"
                    ? "Ready for Feedback"
                    : "In Progress"}
                </span>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                <span>Updated {formatDate(draft.updated_at)}</span>
              </div>
              {draft.content && (
                <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                  {draft.content.slice(0, 150)}...
                </p>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <Link href={`/drafts/${draft.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                >
                  <Eye className="h-3 w-3" />
                  View
                </Button>
              </Link>
              <Link href={`/drafts/${draft.id}/edit`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-colors duration-200"
                onClick={() => handleDeleteDraft(draft.id)}
                disabled={isDeleting === draft.id}
              >
                {isDeleting === draft.id ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-1 h-3 w-3 text-red-600"
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
                    <span>Deleting...</span>
                  </span>
                ) : (
                  <>
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
