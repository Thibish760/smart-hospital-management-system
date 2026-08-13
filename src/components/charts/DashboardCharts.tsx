import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import { revenueData, appointmentData, patientGrowthData, departmentDistribution } from '../../data/mockData';
import { formatCurrency } from '../../lib/utils';

// ─── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, isCurrency }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-heading text-white text-xs rounded-xl px-3 py-2 shadow-lg">
        <p className="font-semibold text-white/70 mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="font-bold" style={{ color: entry.color }}>
            {isCurrency ? formatCurrency(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

// ─── Revenue Chart ────────────────────────────────────────────────────────────
export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={revenueData} margin={{ top: 5, right: 4, bottom: 0, left: -8 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          width={40}
        />
        <Tooltip content={<CustomTooltip isCurrency />} />
        <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2}
          fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Appointment Chart ─────────────────────────────────────────────────────────
export function AppointmentChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={appointmentData} margin={{ top: 5, right: 4, bottom: 0, left: -8 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          width={30}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" name="Total" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="value2" name="Emergency" fill="#DBEAFE" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Patient Growth Chart ──────────────────────────────────────────────────────
export function PatientGrowthChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={patientGrowthData} margin={{ top: 5, right: 4, bottom: 0, left: -8 }}>
        <defs>
          <linearGradient id="patientGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22C55E" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          width={30}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={2}
          fill="url(#patientGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Department Pie Chart ──────────────────────────────────────────────────────
const DEPT_COLORS = ['#EF4444', '#EC4899', '#8B5CF6', '#3B82F6', '#F59E0B', '#94A3B8', '#22C55E'];

export function DepartmentChart() {
  return (
    <div className="w-full">
      {/* Pie chart: responsive container */}
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={departmentDistribution}
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={72}
            dataKey="value"
            paddingAngle={2}
            strokeWidth={0}
          >
            {departmentDistribution.map((_, index) => (
              <Cell key={`cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any) => [`${value}%`, 'Share']}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend: always below chart, 2-column grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2 px-1">
        {departmentDistribution.map((dept, index) => (
          <div key={dept.name} className="flex items-center gap-1.5 min-w-0">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: DEPT_COLORS[index % DEPT_COLORS.length] }}
            />
            <span className="text-xs text-paragraph truncate font-medium">{dept.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
