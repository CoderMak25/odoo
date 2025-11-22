import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Download, Upload, X } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/receipts', label: 'Receipts', icon: Download },
  { path: '/deliveries', label: 'Deliveries', icon: Upload },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 border-r border-white/10 bg-slate-900 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 grid place-items-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-sm font-medium tracking-tight">
              SM
            </div>
            <span className="text-base font-semibold tracking-tight text-slate-100">StockMaster</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden rounded-md p-1 text-slate-400 hover:text-slate-200 hover:bg-white/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-white/5 hover:text-slate-100'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

