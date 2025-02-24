
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EventsLineChartProps {
  data: Array<{
    month_year: string;
    photos_uploaded: number;
  }>;
}

export function EventsLineChart({ data }: EventsLineChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    month: new Date(item.month_year).toLocaleDateString('default', { month: 'short' })
  })).reverse();

  return (
    <Card className="hover:shadow-lg transition-all duration-300 h-full">
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-medium">Photos Uploaded</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                width={30}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Photos
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[0].value}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="photos_uploaded"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                className="transition-all duration-300"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
