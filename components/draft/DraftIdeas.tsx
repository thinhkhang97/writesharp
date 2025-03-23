"use client";

import { useState, useEffect } from "react";
import { Idea } from "@/lib/types";
import { updateIdeas } from "@/app/dashboard/drafts/actions";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { NewIdeaForm } from "./NewIdeaForm";
import { IdeasList } from "./IdeasList";

interface DraftIdeasProps {
  ideas: Idea[];
  setIdeas: (ideas: Idea[]) => void;
  draftId: string;
  foundation?: {
    topic?: string;
    audience?: string;
    purpose?: string;
  };
}

export default function DraftIdeas({
  ideas,
  setIdeas,
  draftId,
  foundation,
}: DraftIdeasProps) {
  const [newIdea, setNewIdea] = useState("");
  const [isLoadingGuide, setIsLoadingGuide] = useState(false);
  const [currentGuide, setCurrentGuide] = useState<string | null>(null);
  const [editingIdeaOrder, setEditingIdeaOrder] = useState<number | null>(null);
  const [editingIdeaText, setEditingIdeaText] = useState("");

  // Setup DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end event for reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeId = parseInt(active.id.toString());
      const overId = parseInt(over.id.toString());

      // Find the indices in the sorted ideas array
      const sortedIdeas = [...ideas].sort((a, b) => a.order - b.order);
      const activeIndex = sortedIdeas.findIndex(
        (idea) => idea.order === activeId
      );
      const overIndex = sortedIdeas.findIndex((idea) => idea.order === overId);

      if (activeIndex !== -1 && overIndex !== -1) {
        // Reorder the sortedIdeas array
        const newSortedIdeas = arrayMove(sortedIdeas, activeIndex, overIndex);

        // Reassign order values to maintain sequential ordering
        const reorderedIdeas = newSortedIdeas.map((idea, idx) => ({
          ...idea,
          order: idx + 1,
        }));

        setIdeas(reorderedIdeas);
      }
    }
  };

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

  const handleEditIdea = (order: number) => {
    const ideaToEdit = ideas.find((idea) => idea.order === order);
    if (ideaToEdit) {
      setEditingIdeaOrder(order);
      setEditingIdeaText(ideaToEdit.text);
    }
  };

  const handleSaveEdit = () => {
    if (!editingIdeaOrder || !editingIdeaText.trim()) {
      setEditingIdeaOrder(null);
      return;
    }

    const updatedIdeas = ideas.map((idea) => {
      if (idea.order === editingIdeaOrder) {
        return { ...idea, text: editingIdeaText.trim() };
      }
      return idea;
    });

    setIdeas(updatedIdeas);
    setEditingIdeaOrder(null);
    setEditingIdeaText("");
  };

  const handleCancelEdit = () => {
    setEditingIdeaOrder(null);
    setEditingIdeaText("");
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
          foundation: foundation, // Include foundation information if available
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

      <NewIdeaForm
        newIdea={newIdea}
        setNewIdea={setNewIdea}
        handleAddIdea={handleAddIdea}
        handleMagicGuide={handleMagicGuide}
        isLoadingGuide={isLoadingGuide}
        currentGuide={currentGuide}
        setCurrentGuide={setCurrentGuide}
      />

      <IdeasList
        ideas={ideas}
        editingIdeaOrder={editingIdeaOrder}
        editingIdeaText={editingIdeaText}
        setEditingIdeaText={setEditingIdeaText}
        handleSaveEdit={handleSaveEdit}
        handleCancelEdit={handleCancelEdit}
        handleEditIdea={handleEditIdea}
        handleRemoveIdea={handleRemoveIdea}
        setIdeas={setIdeas}
        sensors={sensors}
        handleDragEnd={handleDragEnd}
      />
    </div>
  );
}
