import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
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
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: 10 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false}
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
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
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={appointmentData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} />
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
      <AreaChart data={patientGrowthData} margin={{ top: 5, right: 5, bottom: 0, left: 10 }}>
        <defs>
          <linearGradient id="patientGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22C55E" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={2}
          fill="url(#patientGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Department Pie Chart ──────────────────────────────────────────────────────
const DEPT_COLORS = ['#EF4444', '#8B5CF6', '#F59E0B', '#22C55E', '#3B82F6', '#EC4899', '#94A3B8'];

export function DepartmentChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={departmentDistribution}
          cx="40%"
          cy="50%"
          innerRadius={56}
          outerRadius={80}
          dataKey="value"
          paddingAngle={2}
          strokeWidth={0}
        >
          {departmentDistribution.map((_, index) => (
            <Cell key={`cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
          ))}
        </Pie>
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: 12, color: '#4B5563', fontWeight: 500 }}>{value}</span>
          )}
        />
        <Tooltip
          formatter={(value: any) => [`${value}%`, 'Share']}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
