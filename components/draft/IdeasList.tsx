"use client";

import {
  DndContext,
  closestCenter,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Idea } from "@/lib/types";
import { SortableIdeaItem } from "./SortableIdeaItem";
import { EmptyIdeasState } from "./EmptyIdeasState";

interface IdeasListProps {
  ideas: Idea[];
  editingIdeaOrder: number | null;
  editingIdeaText: string;
  setEditingIdeaText: (text: string) => void;
  handleSaveEdit: () => void;
  handleCancelEdit: () => void;
  handleEditIdea: (order: number) => void;
  handleRemoveIdea: (order: number) => void;
  setIdeas: (ideas: Idea[]) => void;
  sensors: ReturnType<typeof useSensors>;
  handleDragEnd: (event: DragEndEvent) => void;
}

export function IdeasList({
  ideas,
  editingIdeaOrder,
  editingIdeaText,
  setEditingIdeaText,
  handleSaveEdit,
  handleCancelEdit,
  handleEditIdea,
  handleRemoveIdea,
  setIdeas,
  sensors,
  handleDragEnd,
}: IdeasListProps) {
  // Sort ideas by order
  const sortedIdeas = [...ideas].sort((a, b) => a.order - b.order);

  if (ideas.length === 0) {
    return <EmptyIdeasState />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedIdeas.map((idea) => idea.order.toString())}
        strategy={verticalListSortingStrategy}
      >
        <ul className="space-y-4 pb-2">
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
  );
}
