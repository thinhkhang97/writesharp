"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Pencil, GripVertical } from "lucide-react";
import { Idea } from "@/lib/types";
import { updateIdeas } from "@/app/dashboard/drafts/actions";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

// SortableItem component for drag and drop
function SortableIdeaItem({
  idea,
  index,
  editingIdeaOrder,
  editingIdeaText,
  setEditingIdeaText,
  handleSaveEdit,
  handleCancelEdit,
  handleEditIdea,
  handleRemoveIdea,
  ideas,
  setIdeas,
}: {
  idea: Idea;
  index: number;
  editingIdeaOrder: number | null;
  editingIdeaText: string;
  setEditingIdeaText: (text: string) => void;
  handleSaveEdit: () => void;
  handleCancelEdit: () => void;
  handleEditIdea: (order: number) => void;
  handleRemoveIdea: (order: number) => void;
  ideas: Idea[];
  setIdeas: (ideas: Idea[]) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: idea.order.toString(),
  });

  // Fixed transform that prevents scaling
  const fixedTransform = {
    x: transform?.x ?? 0,
    y: transform?.y ?? 0,
    scaleX: 1,
    scaleY: 1,
  };

  const style = {
    transform: CSS.Transform.toString(fixedTransform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    backgroundColor: isDragging ? "#f5f7fa" : undefined,
    boxShadow: isDragging ? "0 0 10px rgba(0, 0, 0, 0.1)" : undefined,
    zIndex: isDragging ? 999 : undefined,
  };

  return (
    <li
      key={idea.order}
      className={`p-0 ${isDragging ? "rounded-md" : ""}`}
      ref={setNodeRef}
      style={style}
    >
      {/* Editing State */}
      {editingIdeaOrder === idea.order ? (
        <div className="flex items-center p-3">
          <Input
            value={editingIdeaText}
            onChange={(e) => setEditingIdeaText(e.target.value)}
            className="flex-grow mr-2"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSaveEdit();
              } else if (e.key === "Escape") {
                handleCancelEdit();
              }
            }}
          />
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={handleSaveEdit}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        /* Normal Display State */
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center">
            <div
              className="px-2 mr-2 cursor-move touch-none"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </div>
            <span className="transform-none">{idea.text}</span>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditIdea(idea.order)}
              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            >
              <Pencil className="h-3 w-3 mr-1" /> Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveIdea(idea.order)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              Remove
            </Button>
          </div>
        </div>
      )}

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
                  <span className="text-blue-700 font-medium">AI guide:</span>
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
                        idea.aiGuides?.filter((g) => g.order !== guide.order) ||
                        [],
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
  );
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

  // Sort ideas by order to maintain consistent order
  const sortedIdeas = [...ideas].sort((a, b) => a.order - b.order);

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedIdeas.map((idea) => idea.order.toString())}
            strategy={verticalListSortingStrategy}
          >
            <ul className="border rounded-lg divide-y bg-white">
              {sortedIdeas.map((idea, index) => (
                <SortableIdeaItem
                  key={idea.order}
                  idea={idea}
                  index={index}
                  editingIdeaOrder={editingIdeaOrder}
                  editingIdeaText={editingIdeaText}
                  setEditingIdeaText={setEditingIdeaText}
                  handleSaveEdit={handleSaveEdit}
                  handleCancelEdit={handleCancelEdit}
                  handleEditIdea={handleEditIdea}
                  handleRemoveIdea={handleRemoveIdea}
                  ideas={ideas}
                  setIdeas={setIdeas}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : (
        <p className="text-gray-500 italic text-center py-4 bg-white rounded-lg border">
          No ideas yet. Add some using the form above, or click the magic button
          for inspiration.
        </p>
      )}
    </div>
  );
}
