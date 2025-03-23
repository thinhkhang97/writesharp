"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Idea {
  text: string;
  order: number;
}

interface DraftIdeasProps {
  ideas: Idea[];
  setIdeas: (ideas: Idea[]) => void;
}

export default function DraftIdeas({ ideas, setIdeas }: DraftIdeasProps) {
  const [newIdea, setNewIdea] = useState("");

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

  return (
    <div className="bg-slate-50 p-6 rounded-lg">
      <h2 className="text-lg font-medium mb-4">Ideas</h2>
      <div className="flex items-center mb-4">
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
        <ul className="border rounded-lg divide-y bg-white">
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
        <p className="text-gray-500 italic text-center py-4 bg-white rounded-lg border">
          No ideas yet. Add some using the form above.
        </p>
      )}
    </div>
  );
}
