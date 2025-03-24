import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getDraftById } from "../actions";

interface DraftDetailPageProps {
  params: {
    id: string;
  };
}

export default async function DraftDetailPage({
  params,
}: DraftDetailPageProps) {
  const { id } = await params;
  try {
    const draft = await getDraftById(id);

    // If draft not found, 404
    if (!draft) {
      notFound();
    }

    return (
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/drafts">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Drafts
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold">{draft.title}</h1>
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                draft.status === "Feedback Ready"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {draft.status}
            </span>
          </div>
          <Link href={`/drafts/${draft.id}/edit`}>
            <Button className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Draft
            </Button>
          </Link>
        </div>

        {draft.foundation && draft.foundation.purpose && (
          <div className="mb-6 bg-slate-50 p-4 rounded-lg">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Purpose</h3>
                <p className="mt-1">{draft.foundation.purpose}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Audience</h3>
                <p className="mt-1">{draft.foundation.audience}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Topic</h3>
                <p className="mt-1">{draft.foundation.topic}</p>
              </div>
            </div>
          </div>
        )}

        {draft.ideas && draft.ideas.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Ideas</h2>
            <ul className="list-disc pl-6 space-y-1">
              {draft.ideas
                .sort((a, b) => a.order - b.order)
                .map((idea) => (
                  <li key={idea.order}>{idea.text}</li>
                ))}
            </ul>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Content</h2>
          <div className="bg-white border rounded-lg p-4 whitespace-pre-wrap">
            {draft.content || (
              <p className="text-gray-400 italic">
                No content yet. Click "Edit Draft" to start writing.
              </p>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-500 mt-8">
          <p>Created: {new Date(draft.created_at).toLocaleString()}</p>
          <p>Last updated: {new Date(draft.updated_at).toLocaleString()}</p>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching draft:", error);
    redirect("/drafts");
  }
}
