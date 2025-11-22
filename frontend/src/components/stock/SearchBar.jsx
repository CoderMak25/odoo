import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search products...' }) {
  return (
    <div className="relative w-full sm:w-auto">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-md border border-white/10 bg-white/5 text-slate-200 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm transition-all"
      />
    </div>
  );
}
