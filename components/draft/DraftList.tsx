"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, Trash2, Eye, Clock, FileType, MoreVertical } from "lucide-react";

import { Draft } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteDraft } from "@/app/drafts/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {drafts.map((draft) => (
        <div
          key={draft.id}
          className="glass rounded-xl overflow-hidden border border-white/30 transition-all duration-200 hover:shadow-md group relative h-[300px] flex flex-col"
        >
          {/* Top header with title and actions */}
          <div className="px-5 pt-4 pb-3 flex items-start justify-between border-b border-white/10">
            <div className="flex-1 mr-2">
              <h3 className="text-base font-semibold text-gray-900 line-clamp-2 tracking-tight mb-1 group-hover:text-blue-600 transition-colors duration-200">
                {draft.title}
              </h3>
              <div className="flex items-center mt-1.5">
                <span
                  className={`px-2 py-0.5 text-xs leading-none font-medium rounded-full inline-flex items-center gap-1 ${
                    draft.status === "Feedback Ready"
                      ? "bg-green-100/90 text-green-800"
                      : "bg-amber-100/90 text-amber-800"
                  }`}
                >
                  {draft.status === "Feedback Ready"
                    ? "Ready for Feedback"
                    : "In Progress"}
                </span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50/30 rounded-full transition-colors duration-150"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[180px] p-2 backdrop-blur-md bg-white/90 border border-white/40"
                sideOffset={8}
              >
                <DropdownMenuItem
                  asChild
                  className="rounded-md text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50/70 focus:bg-blue-50/70 py-2"
                >
                  <Link
                    href={`/drafts/${draft.id}`}
                    className="cursor-pointer flex items-center"
                  >
                    <Eye className="mr-2.5 h-[15px] w-[15px]" />
                    <span>View Draft</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="rounded-md text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50/70 focus:bg-blue-50/70 py-2"
                >
                  <Link
                    href={`/drafts/${draft.id}/edit`}
                    className="cursor-pointer flex items-center"
                  >
                    <Edit className="mr-2.5 h-[15px] w-[15px]" />
                    <span>Edit Draft</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1.5 bg-gray-200/50" />
                <DropdownMenuItem
                  className="rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50/70 focus:text-red-700 focus:bg-red-50/70 py-2"
                  onClick={() => handleDeleteDraft(draft.id)}
                  disabled={isDeleting === draft.id}
                >
                  {isDeleting === draft.id ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin mr-2.5 h-[15px] w-[15px] text-red-600"
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
                      <Trash2 className="mr-2.5 h-[15px] w-[15px]" />
                      <span>Delete Draft</span>
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Main content area */}
          <div className="flex-1 p-5 flex flex-col overflow-hidden">
            <Link
              href={`/drafts/${draft.id}`}
              className="flex-1 flex flex-col group cursor-pointer focus:outline-none"
            >
              {draft.content && (
                <div className="relative flex-grow overflow-hidden">
                  <p className="text-sm text-gray-700 leading-relaxed font-light">
                    {draft.content.slice(0, 200)}...
                  </p>
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/80 to-transparent"></div>
                </div>
              )}
            </Link>

            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex items-center text-xs text-gray-600">
                <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate font-medium">
                  {formatDate(draft.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
