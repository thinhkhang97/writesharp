import { createClient } from "@/utils/supabase/server";
import { SkillEvaluation, WriterProfile } from "@/lib/types";
import { calculateWriterProfile } from "@/lib/skillEvaluator";
import { redirect } from "next/navigation";
import SkillChart from "@/components/skills/SkillChart";
import ProfileSummary from "@/components/skills/ProfileSummary";
import ProgressGraph from "@/components/skills/ProgressGraph";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SkillsPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Get the writer profile
  const { data: profileData, error: profileError } = await supabase
    .from("writer_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    console.error("Error fetching writer profile:", profileError);
  }

  // Get recent evaluations from drafts
  const { data: drafts, error: draftsError } = await supabase
    .from("drafts")
    .select("evaluation, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(10);

  if (draftsError) {
    console.error("Error fetching drafts:", draftsError);
  }

  // Extract evaluations from drafts
  const draftEvaluations = (drafts || [])
    .filter((draft) => draft.evaluation)
    .map((draft) => draft.evaluation as SkillEvaluation);

  // Combine evaluations from profile and drafts
  const allEvaluations = [
    ...(profileData?.evaluations || []),
    ...draftEvaluations,
  ]
    // Remove duplicates by timestamp
    .filter(
      (evaluation, index, self) =>
        index === self.findIndex((e) => e.timestamp === evaluation.timestamp)
    )
    // Sort by timestamp (newest first)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  // Calculate the writer profile
  const writerProfile: WriterProfile = calculateWriterProfile(allEvaluations);

  // Get latest evaluation for the radar chart
  const latestEvaluation = allEvaluations[0];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Your Writing Skills</h1>

      {allEvaluations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center py-8">
              You haven&apos;t submitted any drafts for evaluation yet. Submit a
              draft by marking it as &quot;Feedback Ready&quot; to see your
              skills profile.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Writer Profile Summary */}
          <ProfileSummary profile={writerProfile} />

          {/* Latest Evaluation Chart */}
          {latestEvaluation && (
            <Card>
              <CardHeader>
                <CardTitle>Latest Draft Scores</CardTitle>
                <CardDescription>
                  Evaluation from{" "}
                  {new Date(latestEvaluation.timestamp).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SkillChart evaluation={latestEvaluation} />
              </CardContent>
            </Card>
          )}

          {/* Progress Over Time */}
          {writerProfile.history.length > 1 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
                <CardDescription>
                  How your writing skills have evolved over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ProgressGraph history={writerProfile.history} />
              </CardContent>
            </Card>
          )}

          {/* Writing Tips Based on Scores */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personalized Writing Tips</CardTitle>
              <CardDescription>
                Based on your recent evaluations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {latestEvaluation && (
                  <>
                    {latestEvaluation.scores.clarity < 6 && (
                      <div>
                        <h3 className="font-semibold">
                          Clarity: {latestEvaluation.scores.clarity}/10
                        </h3>
                        <p>
                          Try using more specific terms instead of vague words
                          like &quot;thing&quot; or &quot;stuff&quot;. Define
                          technical concepts clearly.
                        </p>
                      </div>
                    )}

                    {latestEvaluation.scores.logic < 6 && (
                      <div>
                        <h3 className="font-semibold">
                          Logic: {latestEvaluation.scores.logic}/10
                        </h3>
                        <p>
                          Connect your ideas with transition words like
                          &quot;therefore&quot;, &quot;because&quot;, or
                          &quot;as a result&quot; to show relationships between
                          thoughts.
                        </p>
                      </div>
                    )}

                    {latestEvaluation.scores.expression < 6 && (
                      <div>
                        <h3 className="font-semibold">
                          Expression: {latestEvaluation.scores.expression}/10
                        </h3>
                        <p>
                          Vary your vocabulary more. Replace generic verbs like
                          &quot;is&quot; and &quot;get&quot; with more specific
                          alternatives.
                        </p>
                      </div>
                    )}

                    {latestEvaluation.scores.structure < 6 && (
                      <div>
                        <h3 className="font-semibold">
                          Structure: {latestEvaluation.scores.structure}/10
                        </h3>
                        <p>
                          Ensure your writing has a clear introduction, body
                          with supporting points, and conclusion to summarize
                          key insights.
                        </p>
                      </div>
                    )}

                    {latestEvaluation.scores.grammar < 6 && (
                      <div>
                        <h3 className="font-semibold">
                          Grammar/Words: {latestEvaluation.scores.grammar}/10
                        </h3>
                        <p>
                          Proofread your work carefully for common errors like
                          run-on sentences and missing punctuation.
                        </p>
                      </div>
                    )}

                    {Object.values(latestEvaluation.scores).every(
                      (score) => score >= 6
                    ) && (
                      <div>
                        <h3 className="font-semibold">Great work!</h3>
                        <p>
                          Your writing is solid across all metrics. Focus on
                          increasing your vocabulary variety to reach expert
                          level.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
