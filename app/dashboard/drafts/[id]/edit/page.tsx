"use client";

import { Input } from "@/components/ui/input";
import { Idea } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  getDraftById,
  updateDraft,
  updateDraftStatus,
  saveDraftWithEvaluation,
} from "../../actions";

// Import components
import DraftContent from "@/components/draft/DraftContent";
import DraftFoundation from "@/components/draft/DraftFoundation";
import { DraftEditHeader } from "@/components/draft/DraftHeader";
import DraftIdeas from "@/components/draft/DraftIdeas";
import DraftNavigation from "@/components/draft/DraftNavigation";
import DraftSidebar from "@/components/draft/DraftSidebar";
import DraftStepBar from "@/components/draft/DraftStepBar";

export default function DraftEditPage() {
  const router = useRouter();
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [purpose, setPurpose] = useState("");
  const [audience, setAudience] = useState("");
  const [topic, setTopic] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [status, setStatus] = useState<"In Progress" | "Feedback Ready">(
    "In Progress"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch draft data
  useEffect(() => {
    async function fetchDraft() {
      try {
        setIsLoading(true);
        const draftData = await getDraftById(id as string);

        if (!draftData) {
          toast.error("Draft not found");
          router.push("/dashboard/drafts");
          return;
        }

        setTitle(draftData.title);
        setContent(draftData.content);
        setStatus(draftData.status);

        // Set foundation fields if they exist
        if (draftData.foundation) {
          setPurpose(draftData.foundation.purpose || "");
          setAudience(draftData.foundation.audience || "");
          setTopic(draftData.foundation.topic || "");
        }

        // Set ideas if they exist
        if (draftData.ideas && Array.isArray(draftData.ideas)) {
          setIdeas(draftData.ideas);
        }

        // Set last saved time to now since we just loaded the data
        setLastSaved(new Date());
      } catch (error) {
        console.error("Error fetching draft:", error);
        toast.error("Failed to load draft");
        router.push("/dashboard/drafts");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDraft();
  }, [id, router]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const updatedDraft = await saveDraftWithEvaluation(id as string, {
        title,
        content,
        foundation: {
          purpose,
          audience,
          topic,
        },
        ideas,
        status,
      });

      setLastSaved(new Date());
      toast.success("Draft saved and skills updated!");
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  // Create debounced auto-save function using Lodash's debounce
  const debouncedSave = useCallback(() => {
    if (!id) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        await updateDraft(id as string, {
          title,
          content,
          foundation: {
            purpose,
            audience,
            topic,
          },
          ideas,
          status,
        });
        setLastSaved(new Date());
        // Silent auto-save - no toast notification
      } catch (error) {
        console.error("Error auto-saving draft:", error);
        // Only show error notifications, not success
        toast.error("Failed to auto-save", { duration: 2000 });
      } finally {
        setIsSaving(false);
      }
    }, 1000);
  }, [id, title, content, purpose, audience, topic, ideas, status]);

  // Trigger auto-save when form values change
  useEffect(() => {
    // Start auto-save when content changes
    debouncedSave();

    // Clean up the debounce on unmount
    return () => {
      // The debounce function already handles cleanup internally
    };
  }, [title, content, purpose, audience, topic, ideas, status, debouncedSave]);

  const handleStatusChange = async (
    newStatus: "In Progress" | "Feedback Ready"
  ) => {
    try {
      setStatus(newStatus);
      await updateDraftStatus(id as string, newStatus);
      setLastSaved(new Date());
      toast.success(`Draft status changed to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center">Loading draft...</p>
      </div>
    );
  }

  return (
    <div
      className={`mx-auto py-8 ${
        currentStep === 3 ? "container-lg max-w-7xl" : "container"
      }`}
    >
      {/* Draft Edit Header */}
      <DraftEditHeader
        draftId={id as string}
        title={title}
        onSave={handleSave}
        isSaving={isSaving}
        lastSaved={lastSaved}
      />

      {/* Step Bar */}
      <DraftStepBar currentStep={currentStep} onStepChange={setCurrentStep} />

      {/* Conditional flex layout for step 3 */}
      <div className={currentStep === 3 ? "flex gap-6" : ""}>
        <div className={`space-y-6 ${currentStep === 3 ? "flex-1" : ""}`}>
          {/* Title is shown on all steps */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Draft title"
              className="w-full"
            />
          </div>

          {/* Step 1: Foundation */}
          {currentStep === 1 && (
            <DraftFoundation
              purpose={purpose}
              setPurpose={setPurpose}
              audience={audience}
              setAudience={setAudience}
              topic={topic}
              setTopic={setTopic}
            />
          )}

          {/* Step 2: Ideas */}
          {currentStep === 2 && (
            <DraftIdeas
              ideas={ideas}
              setIdeas={setIdeas}
              draftId={id as string}
              foundation={{
                topic,
                audience,
                purpose,
              }}
            />
          )}

          {/* Step 3: Content */}
          {currentStep === 3 && (
            <DraftContent
              content={content}
              setContent={setContent}
              status={status}
              onStatusChange={handleStatusChange}
            />
          )}

          {/* Step Navigation */}
          <DraftNavigation
            currentStep={currentStep}
            onPrevStep={() => setCurrentStep(Math.max(1, currentStep - 1))}
            onNextStep={() => setCurrentStep(Math.min(3, currentStep + 1))}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </div>

        {/* Right sidebar for step 3 */}
        {currentStep === 3 && (
          <DraftSidebar
            foundation={{
              topic,
              audience,
              purpose,
            }}
            ideas={ideas}
          />
        )}
      </div>
    </div>
  );
}
