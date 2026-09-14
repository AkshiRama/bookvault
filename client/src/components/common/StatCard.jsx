import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'indigo', subtitle, trend }) => {
  const colorSchemes = {
    indigo: { bg: 'bg-indigo-50 text-indigo-600', ring: 'focus-within:ring-indigo-500' },
    emerald: { bg: 'bg-emerald-50 text-emerald-600', ring: 'focus-within:ring-emerald-500' },
    amber: { bg: 'bg-amber-50 text-amber-600', ring: 'focus-within:ring-amber-500' },
    rose: { bg: 'bg-rose-50 text-rose-600', ring: 'focus-within:ring-rose-500' },
    sky: { bg: 'bg-sky-50 text-sky-600', ring: 'focus-within:ring-sky-500' },
    purple: { bg: 'bg-purple-50 text-purple-600', ring: 'focus-within:ring-purple-500' },
  };

  const scheme = colorSchemes[color] || colorSchemes.indigo;

  return (
    <div className="relative overflow-hidden bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{title}</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
              {trend && <span className="font-medium text-emerald-600">{trend}</span>}
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${scheme.bg} group-hover:scale-110 transition-transform`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-100 to-transparent group-hover:via-brand-500/20 transition-all" />
    </div>
  );
};
