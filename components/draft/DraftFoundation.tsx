"use client";

import { Input } from "@/components/ui/input";

interface DraftFoundationProps {
  purpose: string;
  setPurpose: (value: string) => void;
  audience: string;
  setAudience: (value: string) => void;
  topic: string;
  setTopic: (value: string) => void;
}

export default function DraftFoundation({
  purpose,
  setPurpose,
  audience,
  setAudience,
  topic,
  setTopic,
}: DraftFoundationProps) {
  return (
    <div className="bg-slate-50 p-6 rounded-lg">
      <h2 className="text-lg font-medium mb-4">Foundation</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="purpose" className="block text-sm font-medium mb-1">
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
          <label htmlFor="audience" className="block text-sm font-medium mb-1">
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
  );
}
