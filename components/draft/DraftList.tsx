"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, Trash2, Eye, AlertTriangle } from "lucide-react";

import { Draft } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteDraft } from "@/app/dashboard/drafts/actions";

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

  if (drafts.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-3" />
        <h3 className="text-lg font-medium mb-2">No drafts yet</h3>
        <p className="text-gray-500 mb-4">
          Start writing by creating your first draft!
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Title
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Last Updated
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {drafts.map((draft) => (
            <tr key={draft.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {draft.title}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    draft.status === "Feedback Ready"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {draft.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(draft.updated_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <Link
                  href={`/dashboard/drafts/${draft.id}`}
                  className="inline-block"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    View
                  </Button>
                </Link>
                <Link
                  href={`/dashboard/drafts/${draft.id}/edit`}
                  className="inline-block"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteDraft(draft.id)}
                  disabled={isDeleting === draft.id}
                >
                  <Trash2 className="h-3 w-3" />
                  {isDeleting === draft.id ? "Deleting..." : "Delete"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
