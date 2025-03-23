"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getDraftById, updateDraft, updateDraftStatus } from "../../actions";

export default function DraftEditPage() {
  const router = useRouter();
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [purpose, setPurpose] = useState("");
  const [audience, setAudience] = useState("");
  const [topic, setTopic] = useState("");
  const [ideas, setIdeas] = useState<Array<{ text: string; order: number }>>(
    []
  );
  const [newIdea, setNewIdea] = useState("");
  const [status, setStatus] = useState<"In Progress" | "Feedback Ready">(
    "In Progress"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch draft data
  useEffect(() => {
    async function fetchDraft() {
      try {
        setIsLoading(true);
        const draftData = await getDraftById(id as string);

        if (!draftData) {
          toast.error("Draft not found");
          router.push("/dashboard/drafts");
          return;
        }

        setTitle(draftData.title);
        setContent(draftData.content);
        setStatus(draftData.status);

        // Set foundation fields if they exist
        if (draftData.foundation) {
          setPurpose(draftData.foundation.purpose || "");
          setAudience(draftData.foundation.audience || "");
          setTopic(draftData.foundation.topic || "");
        }

        // Set ideas if they exist
        if (draftData.ideas && Array.isArray(draftData.ideas)) {
          setIdeas(draftData.ideas);
        }
      } catch (error) {
        console.error("Error fetching draft:", error);
        toast.error("Failed to load draft");
        router.push("/dashboard/drafts");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDraft();
  }, [id, router]);

  const handleAddIdea = () => {
    if (!newIdea.trim()) return;

    setIdeas([
      ...ideas,
      {
        text: newIdea.trim(),
        order: ideas.length
          ? Math.max(...ideas.map((idea) => idea.order)) + 1
          : 1,
      },
    ]);
    setNewIdea("");
  };

  const handleRemoveIdea = (orderToRemove: number) => {
    setIdeas(ideas.filter((idea) => idea.order !== orderToRemove));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      await updateDraft(id as string, {
        title,
        content,
        foundation: {
          purpose,
          audience,
          topic,
        },
        ideas,
        status,
      });

      toast.success("Draft saved successfully!");
      router.push(`/dashboard/drafts/${id}`);
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (
    newStatus: "In Progress" | "Feedback Ready"
  ) => {
    try {
      setStatus(newStatus);
      await updateDraftStatus(id as string, newStatus);
      toast.success(`Draft status changed to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center">Loading draft...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/drafts/${id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Draft
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Edit Draft</h1>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Draft title"
            className="w-full"
          />
        </div>

        <div className="bg-slate-50 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Foundation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="purpose"
                className="block text-sm font-medium mb-1"
              >
                Purpose
              </label>
              <Input
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Why are you writing this?"
              />
            </div>
            <div>
              <label
                htmlFor="audience"
                className="block text-sm font-medium mb-1"
              >
                Audience
              </label>
              <Input
                id="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="Who are you writing for?"
              />
            </div>
            <div>
              <label htmlFor="topic" className="block text-sm font-medium mb-1">
                Topic
              </label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What are you writing about?"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-2">Ideas</h2>
          <div className="flex items-center mb-2">
            <Input
              value={newIdea}
              onChange={(e) => setNewIdea(e.target.value)}
              placeholder="Add a new idea"
              className="flex-grow mr-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddIdea();
                }
              }}
            />
            <Button onClick={handleAddIdea}>Add</Button>
          </div>

          {ideas.length > 0 ? (
            <ul className="border rounded-lg divide-y">
              {ideas
                .sort((a, b) => a.order - b.order)
                .map((idea) => (
                  <li
                    key={idea.order}
                    className="flex items-center justify-between p-3"
                  >
                    <span>{idea.text}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveIdea(idea.order)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">
              No ideas yet. Add some using the form above.
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium">Content</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Status:</span>
              <div className="flex border rounded-md overflow-hidden">
                <button
                  className={`px-3 py-1 text-sm ${
                    status === "In Progress"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-white text-gray-500"
                  }`}
                  onClick={() => handleStatusChange("In Progress")}
                >
                  In Progress
                </button>
                <button
                  className={`px-3 py-1 text-sm ${
                    status === "Feedback Ready"
                      ? "bg-green-100 text-green-800"
                      : "bg-white text-gray-500"
                  }`}
                  onClick={() => handleStatusChange("Feedback Ready")}
                >
                  Feedback Ready
                </button>
              </div>
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your content here..."
            className="w-full border rounded-lg p-4 min-h-[300px] resize-y"
          />
        </div>
      </div>
    </div>
  );
}
