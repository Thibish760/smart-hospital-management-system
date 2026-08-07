import { Building2, Users, BedDouble, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { departments } from '../data/mockData';

export function Departments() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="text-sm text-muted mt-1">{departments.length} active departments</p>
        </div>
        <button className="btn-primary">
          <Building2 size={15} />
          Add Department
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Departments', value: departments.length, icon: Building2, color: 'text-primary bg-primary-light' },
          { label: 'Total Doctors', value: departments.reduce((s, d) => s + d.doctorCount, 0), icon: Users, color: 'text-emerald-700 bg-emerald-50' },
          { label: 'Total Beds', value: departments.reduce((s, d) => s + d.bedCount, 0), icon: BedDouble, color: 'text-amber-700 bg-amber-50' },
          { label: 'Beds Occupied', value: departments.reduce((s, d) => s + d.bedsOccupied, 0), icon: Activity, color: 'text-rose-700 bg-rose-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={16} />
            </div>
            <p className="text-2xl font-bold text-heading">{value}</p>
            <p className="text-xs text-muted font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {departments.map((dept, i) => {
          const occupancy = Math.round((dept.bedsOccupied / dept.bedCount) * 100);
          return (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-5 hover:shadow-card-hover transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: dept.color }}
                  >
                    {dept.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-heading">{dept.name}</p>
                    <p className="text-xs text-muted">{dept.head}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-background rounded-xl">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Users size={12} className="text-muted" />
                    <p className="text-xs text-muted">Doctors</p>
                  </div>
                  <p className="text-lg font-bold text-heading">{dept.doctorCount}</p>
                </div>
                <div className="p-3 bg-background rounded-xl">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <BedDouble size={12} className="text-muted" />
                    <p className="text-xs text-muted">Beds</p>
                  </div>
                  <p className="text-lg font-bold text-heading">{dept.bedCount}</p>
                </div>
              </div>

              {/* Occupancy */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-muted">Bed Occupancy</span>
                  <span className={`text-xs font-bold ${occupancy > 80 ? 'text-danger' : occupancy > 60 ? 'text-warning-dark' : 'text-success-dark'}`}>
                    {dept.bedsOccupied}/{dept.bedCount} ({occupancy}%)
                  </span>
                </div>
                <div className="h-2 bg-border-light rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${occupancy}%`,
                      backgroundColor: occupancy > 80 ? '#EF4444' : occupancy > 60 ? '#F59E0B' : dept.color,
                    }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
