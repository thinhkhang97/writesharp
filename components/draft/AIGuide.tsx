import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface AIGuideProps {
  guide: string;
  onRemove: () => void;
}

export function AIGuide({ guide, onRemove }: AIGuideProps) {
  return (
    <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start">
      <Sparkles className="h-4 w-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
      <div>
        <div className="text-blue-700 font-medium">AI Guide:</div>
        <div>{guide}</div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="ml-auto text-gray-500"
        onClick={onRemove}
      >
        ✕
      </Button>
    </div>
  );
}
