import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Activity, History, Settings, Search } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/operations', label: 'Operations', icon: Activity },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/move-history', label: 'Move History', icon: History },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function TopNav() {
  return (
    <nav className="w-full border-b border-white/10 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
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

        {/* Right Side - User Avatar */}
        <div className="flex items-center gap-3 ml-4">
          <div className="h-8 w-8 rounded-md border border-white/10 bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-medium">
            A
          </div>
        </div>
      </div>
    </nav>
  );
}

