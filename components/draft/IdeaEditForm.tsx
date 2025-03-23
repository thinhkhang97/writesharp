import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface IdeaEditFormProps {
  editingIdeaText: string;
  setEditingIdeaText: (text: string) => void;
  handleSaveEdit: () => void;
  handleCancelEdit: () => void;
}

export function IdeaEditForm({
  editingIdeaText,
  setEditingIdeaText,
  handleSaveEdit,
  handleCancelEdit,
}: IdeaEditFormProps) {
  return (
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
  );
}
