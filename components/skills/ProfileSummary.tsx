"use client";

import { WriterProfile } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProfileSummaryProps {
  profile: WriterProfile;
}

export default function ProfileSummary({ profile }: ProfileSummaryProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "text-yellow-500";
      case "Solid":
        return "text-green-500";
      case "Advanced":
        return "text-blue-500";
      case "Expert":
        return "text-purple-500";
      default:
        return "text-gray-500";
    }
  };

  const getReasonerLabel = (score: number) => {
    if (score >= 8.5) return "Expert";
    if (score >= 7) return "Advanced";
    if (score >= 5) return "Solid";
    return "Beginner";
  };

  const getPolisherLabel = (score: number) => {
    if (score >= 8.5) return "Expert";
    if (score >= 7) return "Advanced";
    if (score >= 5) return "Solid";
    return "Beginner";
  };

  const reasonerLabel = getReasonerLabel(profile.reasonerScore);
  const polisherLabel = getPolisherLabel(profile.polisherScore);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Writer Profile</CardTitle>
        <CardDescription>Based on your recent drafts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div
            className={`text-center p-4 rounded-md bg-green-50 border border-green-100 ${getLevelColor(
              profile.level
            )}`}
          >
            <span className="text-2xl font-bold">{profile.level} Writer</span>
            <div className="text-sm text-gray-500 mt-1">
              {profile.history.length > 0
                ? `Based on ${profile.history.length} draft${
                    profile.history.length > 1 ? "s" : ""
                  }`
                : "No evaluation history yet"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-md p-4 text-center">
              <div className="text-sm text-gray-500">Reasoner</div>
              <div className="text-xl font-bold">
                {profile.reasonerScore}/10
              </div>
              <div className="text-xs text-gray-500">{reasonerLabel}</div>
            </div>
            <div className="border rounded-md p-4 text-center">
              <div className="text-sm text-gray-500">Polisher</div>
              <div className="text-xl font-bold">
                {profile.polisherScore}/10
              </div>
              <div className="text-xs text-gray-500">{polisherLabel}</div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Quick Take</h3>
            <p className="text-sm text-gray-600">
              {profile.reasonerScore > profile.polisherScore
                ? "Your reasoning skills are stronger than your polishing. Focus on improving grammar and structure."
                : profile.polisherScore > profile.reasonerScore
                ? "Your polishing skills are stronger than your reasoning. Work on improving clarity and logical flow."
                : "Your reasoning and polishing skills are balanced. Keep improving both areas."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
