"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";
import { Idea } from "@/lib/types";
import { updateIdeas } from "@/app/dashboard/drafts/actions";

interface DraftIdeasProps {
  ideas: Idea[];
  setIdeas: (ideas: Idea[]) => void;
  draftId: string;
}

export default function DraftIdeas({
  ideas,
  setIdeas,
  draftId,
}: DraftIdeasProps) {
  const [newIdea, setNewIdea] = useState("");
  const [isLoadingGuide, setIsLoadingGuide] = useState(false);
  const [currentGuide, setCurrentGuide] = useState<string | null>(null);

  // When ideas change, persist to the database
  useEffect(() => {
    const saveToDatabase = async () => {
      try {
        await updateIdeas(draftId, ideas);
      } catch (error) {
        console.error("Error saving ideas:", error);
      }
    };

    // Only save when we have ideas and not during initial load
    if (ideas.length > 0) {
      saveToDatabase();
    }
  }, [ideas, draftId]);

  const handleAddIdea = () => {
    if (!newIdea.trim()) return;

    // Create the new idea object
    const newIdeaObj: Idea = {
      text: newIdea.trim(),
      order: ideas.length
        ? Math.max(...ideas.map((idea) => idea.order)) + 1
        : 1,
      aiGuides: currentGuide
        ? [
            {
              text: currentGuide,
              order: 1,
            },
          ]
        : [],
    };

    // Add to ideas array
    setIdeas([...ideas, newIdeaObj]);
    setNewIdea("");
    setCurrentGuide(null); // Clear the current guide after adding
  };

  const handleRemoveIdea = (orderToRemove: number) => {
    // Update ideas
    const updatedIdeas = ideas.filter((idea) => idea.order !== orderToRemove);
    setIdeas(updatedIdeas);
  };

  // This generates a guide before the user adds an idea
  const handleMagicGuide = async () => {
    setIsLoadingGuide(true);
    try {
      // Get all idea texts for context
      const ideaTexts = ideas.map((idea) => idea.text);

      // Call our API endpoint to generate a prompt
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          existingIdeas: ideaTexts,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate AI guide");
      }

      const data = await response.json();
      // Set the current guide to display above the input
      setCurrentGuide(data.suggestion);
    } catch (error) {
      console.error("Error generating AI guide:", error);
    } finally {
      setIsLoadingGuide(false);
    }
  };

  return (
    <div className="bg-slate-50 p-6 rounded-lg">
      <h2 className="text-lg font-medium mb-4">Ideas</h2>

      {/* Input area with AI guide above it */}
      <div className="mb-4">
        {currentGuide && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start">
            <Sparkles className="h-4 w-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-blue-700 font-medium">AI Guide:</div>
              <div>{currentGuide}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-gray-500"
              onClick={() => setCurrentGuide(null)}
            >
              ✕
            </Button>
          </div>
        )}

        <div className="flex items-center">
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
          <Button onClick={handleAddIdea} className="mr-2">
            Add
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleMagicGuide}
            disabled={isLoadingGuide}
            title="Get AI guidance for a new idea"
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {ideas.length > 0 ? (
        <ul className="border rounded-lg divide-y bg-white">
          {ideas
            .sort((a, b) => a.order - b.order)
            .map((idea, index) => (
              <li key={idea.order} className="p-0">
                {/* Idea */}
                <div className="flex items-center justify-between p-3">
                  <span>{idea.text}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveIdea(idea.order)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>

                {/* AI Guides for this idea */}
                {idea.aiGuides && idea.aiGuides.length > 0 && (
                  <div className="divide-y">
                    {idea.aiGuides
                      .sort((a, b) => a.order - b.order)
                      .map((guide) => (
                        <div
                          key={`${idea.order}-${guide.order}`}
                          className="flex items-center justify-between p-3 pl-6 bg-blue-50 border-t"
                        >
                          <div className="flex items-center">
                            <Sparkles className="h-3 w-3 mr-2 text-blue-500" />
                            <span className="text-blue-700 font-medium">
                              AI guide:
                            </span>
                            <span className="ml-2">{guide.text}</span>
                          </div>

                          {/* Remove guide button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updatedIdeas = [...ideas];
                              updatedIdeas[index] = {
                                ...idea,
                                aiGuides:
                                  idea.aiGuides?.filter(
                                    (g) => g.order !== guide.order
                                  ) || [],
                              };
                              setIdeas(updatedIdeas);
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </li>
            ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic text-center py-4 bg-white rounded-lg border">
          No ideas yet. Add some using the form above, or click the magic button
          for inspiration.
        </p>
      )}
    </div>
  );
}
