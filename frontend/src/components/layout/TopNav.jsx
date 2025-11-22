import { useState, useRef, useEffect } from 'react';
import { Menu, User, LogOut, UserCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function TopNav({ onMenuClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 lg:pl-72 h-16">
        <button
          onClick={onMenuClick}
          className="lg:hidden rounded-md p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="ml-auto flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
            >
              <UserCircle className="h-5 w-5" />
              <span className="hidden sm:inline">{user?.name || 'User'}</span>
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-white/10 bg-slate-900 shadow-lg">
                <div className="p-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      // Navigate to profile page if needed
                    }}
                    className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm text-rose-400 hover:bg-white/5"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

