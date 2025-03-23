"use client";

import { RichTextEditor } from "../ui/rich-text-editor";

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
        </div>
      </div>

      <div className="relative">
        <RichTextEditor
          value={content}
          onChange={setContent}
          characterCount={true}
        />
      </div>
    </div>
  );
}
