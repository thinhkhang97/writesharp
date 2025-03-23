import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";
import { AIGuide } from "./AIGuide";

interface NewIdeaFormProps {
  newIdea: string;
  setNewIdea: (idea: string) => void;
  handleAddIdea: () => void;
  handleMagicGuide: () => void;
  isLoadingGuide: boolean;
  currentGuide: string | null;
  setCurrentGuide: (guide: string | null) => void;
}

export function NewIdeaForm({
  newIdea,
  setNewIdea,
  handleAddIdea,
  handleMagicGuide,
  isLoadingGuide,
  currentGuide,
  setCurrentGuide,
}: NewIdeaFormProps) {
  return (
    <div className="mb-4">
      {currentGuide && (
        <AIGuide guide={currentGuide} onRemove={() => setCurrentGuide(null)} />
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
  );
}
