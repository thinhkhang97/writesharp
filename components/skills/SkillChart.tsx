"use client";

import { SkillEvaluation } from "@/lib/types";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

interface SkillChartProps {
  evaluation: SkillEvaluation;
}

export default function SkillChart({ evaluation }: SkillChartProps) {
  // Transform scores into data for the radar chart
  const data = [
    {
      subject: "Clarity",
      A: evaluation.scores.clarity,
      fullMark: 10,
    },
    {
      subject: "Logic",
      A: evaluation.scores.logic,
      fullMark: 10,
    },
    {
      subject: "Expression",
      A: evaluation.scores.expression,
      fullMark: 10,
    },
    {
      subject: "Structure",
      A: evaluation.scores.structure,
      fullMark: 10,
    },
    {
      subject: "Grammar",
      A: evaluation.scores.grammar,
      fullMark: 10,
    },
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={90} domain={[0, 10]} />
          <Radar
            name="Skills"
            dataKey="A"
            stroke="#2ECC71"
            fill="#2ECC71"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
