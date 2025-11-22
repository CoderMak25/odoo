export default function Select({
  label,
  value,
  onChange,
  options = [],
  error,
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          {label}
          {required && <span className="text-rose-400 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`w-full rounded-xl border-2 ${
          error ? 'border-rose-500' : 'border-indigo-500/30'
        } bg-gradient-to-br from-slate-800 to-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-lg hover:shadow-xl hover:border-indigo-500/50 ${className}`}
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '0.75rem',
        }}
        {...props}
      >
        <option value="" className="bg-slate-800 text-slate-200">Select {label}</option>
        {options.map((option) => (
          <option 
            key={option.value || option} 
            value={option.value || option}
            className="bg-slate-800 text-slate-200"
          >
            {option.label || option}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}

