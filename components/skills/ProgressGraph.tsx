"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface ProgressGraphProps {
  history: {
    timestamp: string;
    reasonerScore: number;
    polisherScore: number;
  }[];
}

export default function ProgressGraph({ history }: ProgressGraphProps) {
  // Sort the history by timestamp (oldest first) for the graph
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Format the data for the chart
  const data = sortedHistory.map((entry) => {
    // Format date to display only month/day
    const date = new Date(entry.timestamp);
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;

    return {
      date: formattedDate,
      reasoner: entry.reasonerScore,
      polisher: entry.polisherScore,
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 10]} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="reasoner"
          name="Reasoner Skills"
          stroke="#2ECC71"
          activeDot={{ r: 8 }}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="polisher"
          name="Polisher Skills"
          stroke="#3498DB"
          activeDot={{ r: 8 }}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
