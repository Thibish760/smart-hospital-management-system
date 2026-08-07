import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, CalendarDays, DollarSign } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend,
} from 'recharts';
import { revenueData, appointmentData, patientGrowthData, doctors } from '../data/mockData';
import { formatCurrency } from '../lib/utils';

const doctorPerformance = doctors.slice(0, 6).map(d => ({
  name: d.name.replace('Dr. ', ''),
  patients: d.patientCount,
  rating: d.rating * 20,
  consultations: Math.floor(d.patientCount * 0.7),
}));

const occupancyData = [
  { dept: 'Cardiology', beds: 40, occupied: 28 },
  { dept: 'Pediatrics', beds: 50, occupied: 31 },
  { dept: 'Orthopedics', beds: 35, occupied: 24 },
  { dept: 'Neurology', beds: 30, occupied: 19 },
  { dept: 'Oncology', beds: 25, occupied: 18 },
  { dept: 'Emergency', beds: 20, occupied: 14 },
];

export function Reports() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="text-sm text-muted mt-1">August 2024 · MediFlow Main Campus</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="input-base w-36 py-2">
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Quarter</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {[
          { label: 'Monthly Revenue', value: formatCurrency(1850000), change: '+9.8%', icon: DollarSign, bg: 'bg-primary-light text-primary' },
          { label: 'Total Appointments', value: '1,247', change: '+12.3%', icon: CalendarDays, bg: 'bg-success-light text-success-dark' },
          { label: 'New Patients', value: '124', change: '+6.2%', icon: Users, bg: 'bg-amber-50 text-amber-700' },
          { label: 'Avg. Rating', value: '4.77 ★', change: '+0.12', icon: TrendingUp, bg: 'bg-violet-50 text-violet-700' },
        ].map(({ label, value, change, icon: Icon, bg }) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-bold text-heading mt-1">{value}</p>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon size={16} />
              </div>
            </div>
            <p className="text-xs font-semibold text-success-dark mt-2">↑ {change} vs last month</p>
          </div>
        ))}
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="card p-6">
          <div className="mb-5">
            <h2 className="section-title">Revenue Trend</h2>
            <p className="text-sm text-muted mt-0.5">Monthly revenue — Jan to Aug 2024</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="rg2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v / 100000).toFixed(1)}L`} />
              <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
              <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} fill="url(#rg2)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <div className="mb-5">
            <h2 className="section-title">Patient Growth</h2>
            <p className="text-sm text-muted mt-0.5">Cumulative registered patients</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={patientGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #E5E7EB' }} />
              <Line type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 3, fill: '#22C55E' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Doctor Performance */}
        <div className="card p-6 xl:col-span-2">
          <div className="mb-5">
            <h2 className="section-title">Doctor Performance</h2>
            <p className="text-sm text-muted mt-0.5">Patients handled & satisfaction rating</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={doctorPerformance} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #E5E7EB' }} />
              <Bar dataKey="patients" name="Patients" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="consultations" name="Consultations" fill="#DBEAFE" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bed Occupancy */}
        <div className="card p-6">
          <div className="mb-5">
            <h2 className="section-title">Bed Occupancy</h2>
            <p className="text-sm text-muted mt-0.5">By department</p>
          </div>
          <div className="space-y-3">
            {occupancyData.map(dept => {
              const pct = Math.round((dept.occupied / dept.beds) * 100);
              return (
                <div key={dept.dept}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-paragraph">{dept.dept}</span>
                    <span className="text-xs font-bold text-heading">{dept.occupied}/{dept.beds}</span>
                  </div>
                  <div className="h-2 bg-border-light rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-danger' : pct > 60 ? 'bg-warning' : 'bg-primary'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted mt-0.5 text-right">{pct}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Appointment Stats */}
      <div className="card p-6">
        <div className="mb-5">
          <h2 className="section-title">Weekly Appointment Statistics</h2>
          <p className="text-sm text-muted mt-0.5">Total vs Emergency appointments per day</p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={appointmentData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #E5E7EB' }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="value" name="Total" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="value2" name="Emergency" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
