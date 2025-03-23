"use client";

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
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your content here..."
          className="w-full border rounded-lg p-4 min-h-[calc(100vh-22rem)] resize-y bg-white"
        />
        <div className="absolute top-3 right-3 text-xs text-gray-400">
          <p>{content.length} characters</p>
        </div>
      </div>
    </div>
  );
}
