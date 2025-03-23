"use client";

import { ArrowLeftCircle, ArrowRightCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DraftNavigationProps {
  currentStep: number;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function DraftNavigation({
  currentStep,
  onPrevStep,
  onNextStep,
  onSave,
  isSaving,
}: DraftNavigationProps) {
  return (
    <div className="flex justify-between pt-4">
      <Button
        variant="outline"
        onClick={onPrevStep}
        disabled={currentStep === 1}
        className="flex items-center gap-2"
      >
        <ArrowLeftCircle className="h-4 w-4" />
        Previous Step
      </Button>
      {currentStep < 3 ? (
        <Button onClick={onNextStep} className="flex items-center gap-2">
          Next Step
          <ArrowRightCircle className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Draft"}
        </Button>
      )}
    </div>
  );
}
