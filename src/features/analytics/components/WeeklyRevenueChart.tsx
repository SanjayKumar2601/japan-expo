import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatYen } from '@/utils/format';

export function WeeklyRevenueChart({ data }: { data: { day: string; revenue: number }[] }) {
  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>Weekly Revenue</CardTitle>
      </CardHeader>
      <div className="h-56 w-full">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#ECECEC" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#777777' }} />
            <Tooltip
              cursor={{ fill: 'rgba(255,107,0,0.06)' }}
              formatter={(value) => formatYen(Number(value ?? 0))}
              contentStyle={{ borderRadius: 16, border: '1px solid #ECECEC', fontSize: 13 }}
            />
            <Bar dataKey="revenue" fill="#FF6B00" radius={[8, 8, 0, 0]} animationDuration={900} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
