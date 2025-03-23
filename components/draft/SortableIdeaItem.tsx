"use client";

import { Button } from "@/components/ui/button";
import { Pencil, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Idea } from "@/lib/types";
import { IdeaEditForm } from "./IdeaEditForm";
import { IdeaGuideItem } from "./IdeaGuideItem";

interface SortableIdeaItemProps {
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
}

export function SortableIdeaItem({
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
}: SortableIdeaItemProps) {
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
        <IdeaEditForm
          editingIdeaText={editingIdeaText}
          setEditingIdeaText={setEditingIdeaText}
          handleSaveEdit={handleSaveEdit}
          handleCancelEdit={handleCancelEdit}
        />
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
              <IdeaGuideItem
                key={`${idea.order}-${guide.order}`}
                guide={guide}
                ideaOrder={idea.order}
                onRemove={() => {
                  const updatedIdeas = [...ideas];
                  updatedIdeas[index] = {
                    ...idea,
                    aiGuides:
                      idea.aiGuides?.filter((g) => g.order !== guide.order) ||
                      [],
                  };
                  setIdeas(updatedIdeas);
                }}
              />
            ))}
        </div>
      )}
    </li>
  );
}
