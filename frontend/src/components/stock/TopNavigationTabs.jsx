import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Activity, History, Settings } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/operations', label: 'Operations', icon: Activity },
  { path: '/stock', label: 'Products', icon: Package },
  { path: '/move-history', label: 'Move History', icon: History },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function TopNavigationTabs() {
  return (
    <nav className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
      <div className="flex items-center gap-1 px-4 lg:px-6 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

