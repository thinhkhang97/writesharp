import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface IdeaGuideItemProps {
  guide: { text: string; order: number };
  ideaOrder: number;
  onRemove: () => void;
}

export function IdeaGuideItem({
  guide,
  ideaOrder,
  onRemove,
}: IdeaGuideItemProps) {
  return (
    <div
      key={`${ideaOrder}-${guide.order}`}
      className="flex items-center justify-between p-3 pl-6 bg-blue-50 border-t"
    >
      <div className="flex items-center">
        <Sparkles className="h-3 w-3 mr-2 text-blue-500" />
        <span className="text-blue-700 font-medium">AI guide:</span>
        <span className="ml-2">{guide.text}</span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        Remove
      </Button>
    </div>
  );
}
