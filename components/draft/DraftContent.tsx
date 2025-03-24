"use client";

import { WritingReviewFeedback } from "@/lib/gemini";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { WritingChecker } from "../ui/writing-checker";

interface DraftContentProps {
  content: string;
  setContent: (content: string) => void;
  status: "In Progress" | "Feedback Ready";
  onStatusChange: (status: "In Progress" | "Feedback Ready") => void;
}

export default function DraftContent({
  content,
  setContent,
  status,
  onStatusChange,
}: DraftContentProps) {
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewFeedback, setReviewFeedback] =
    useState<WritingReviewFeedback | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [foundation, setFoundation] = useState("");
  const [ideas, setIdeas] = useState("");
  const [showReviewOptions, setShowReviewOptions] = useState(false);

  const handleReview = async () => {
    if (!content.trim()) return;

    setIsReviewing(true);
    setReviewError(null);

    try {
      const response = await fetch("/api/drafts/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          foundation: foundation.trim() || undefined,
          ideas: ideas.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get review");
      }

      const data = await response.json();
      setReviewFeedback(data);
    } catch (error) {
      console.error("Error getting review:", error);
      setReviewError(
        error instanceof Error ? error.message : "Failed to get review"
      );
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="bg-slate-50 p-6 rounded-lg">
      <div className="flex items-center justify-between mb-4">
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
              onClick={() => onStatusChange("In Progress")}
            >
              In Progress
            </button>
            <button
              className={`px-3 py-1 text-sm ${
                status === "Feedback Ready"
                  ? "bg-green-100 text-green-800"
                  : "bg-white text-gray-500"
              }`}
              onClick={() => onStatusChange("Feedback Ready")}
            >
              Feedback Ready
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReviewOptions(!showReviewOptions)}
            className="ml-2"
          >
            {showReviewOptions ? "Hide Options" : "Review Options"}
          </Button>
          <Button
            onClick={handleReview}
            disabled={isReviewing || !content.trim()}
            className="ml-2"
          >
            {isReviewing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reviewing...
              </>
            ) : (
              "Review"
            )}
          </Button>
        </div>
      </div>

      {showReviewOptions && (
        <div className="mb-4 space-y-3 bg-white p-4 rounded-md border">
          <div>
            <label
              htmlFor="foundation"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Foundation/Context
            </label>
            <Textarea
              id="foundation"
              placeholder="Enter the foundation or context of your writing (optional)"
              value={foundation}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFoundation(e.target.value)
              }
              className="min-h-[80px]"
            />
          </div>
          <div>
            <label
              htmlFor="ideas"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Key Ideas
            </label>
            <Textarea
              id="ideas"
              placeholder="Enter key ideas to focus on in the review (optional)"
              value={ideas}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setIdeas(e.target.value)
              }
              className="min-h-[80px]"
            />
          </div>
        </div>
      )}

      <div className="relative">
        <WritingChecker value={content} onChange={setContent} />
      </div>

      {reviewError && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <p className="text-sm font-medium">
            Error getting review: {reviewError}
          </p>
        </div>
      )}

      {reviewFeedback && !reviewError && (
        <div className="mt-6 space-y-4 bg-white p-4 rounded-md border">
          <h3 className="font-medium text-lg">Review Feedback</h3>
          <p className="text-sm">Score: {reviewFeedback.score}</p>
          <div>
            <h4 className="font-medium text-green-700">
              Strengths (What You Nailed):
            </h4>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              {reviewFeedback.strengths.points.map((point, index) => (
                <li key={`strength-${index}`} className="text-sm">
                  {point}
                </li>
              ))}
            </ul>
            <p className="text-sm mt-2 italic">
              {reviewFeedback.strengths.summary}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-amber-700">
              Weaknesses (Need to Improve):
            </h4>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              {reviewFeedback.weaknesses.points.map((point, index) => (
                <li key={`weakness-${index}`} className="text-sm">
                  {point}
                </li>
              ))}
            </ul>
            <p className="text-sm mt-2 italic">
              {reviewFeedback.weaknesses.summary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
