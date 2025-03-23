"use client";

import { Idea } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lightbulb } from "lucide-react";

interface DraftSidebarProps {
  foundation: {
    topic: string;
    audience: string;
    purpose: string;
  };
  ideas: Idea[];
}

export default function DraftSidebar({ foundation, ideas }: DraftSidebarProps) {
  return (
    <div className="w-80 bg-slate-50 border-l border-slate-200 rounded-lg overflow-hidden h-[calc(100vh-16rem)] sticky top-24">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-medium mb-2">Foundation</h2>
        <div className="space-y-2 text-sm">
          {foundation.topic && (
            <div>
              <span className="font-medium text-slate-700">Topic:</span>{" "}
              <span className="text-slate-600">{foundation.topic}</span>
            </div>
          )}
          {foundation.audience && (
            <div>
              <span className="font-medium text-slate-700">Audience:</span>{" "}
              <span className="text-slate-600">{foundation.audience}</span>
            </div>
          )}
          {foundation.purpose && (
            <div>
              <span className="font-medium text-slate-700">Purpose:</span>{" "}
              <span className="text-slate-600">{foundation.purpose}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-amber-50 border-b border-amber-100">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-amber-700">
              Writing Guide
            </h3>
            <p className="text-xs text-amber-600 mt-1">
              Refer to your foundation and ideas while writing to maintain focus
              on your original goals.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-medium mb-2">Ideas</h2>
      </div>

      <ScrollArea className="h-[calc(100%-18rem)]">
        <ul className="p-4 space-y-3">
          {ideas.length > 0 ? (
            ideas
              .sort((a, b) => a.order - b.order)
              .map((idea) => (
                <li
                  key={idea.order}
                  className="bg-white p-3 rounded-md border shadow-sm"
                >
                  <p className="text-sm text-slate-700">{idea.text}</p>
                  {idea.aiGuides && idea.aiGuides.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 italic">
                      {idea.aiGuides[0].text}
                    </div>
                  )}
                </li>
              ))
          ) : (
            <p className="text-sm text-slate-500 italic">No ideas added yet</p>
          )}
        </ul>
      </ScrollArea>
    </div>
  );
}
