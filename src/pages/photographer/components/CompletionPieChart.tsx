
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface CompletionPieChartProps {
  data: Array<{
    month_year: string;
    completion_rate: number;
  }>;
}

export function CompletionPieChart({ data }: CompletionPieChartProps) {
  const latestData = data[0];
  const pieData = [
    { name: "Completed", value: latestData?.completion_rate || 0 },
    { name: "Remaining", value: 100 - (latestData?.completion_rate || 0) },
  ];

  const COLORS = ["hsl(var(--primary))", "hsl(var(--muted))"];

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-4">
        <CardTitle className="text-lg">Completion Rate</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="h-[200px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index]}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Pie>
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => (
                  <span className="text-xs text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
}
