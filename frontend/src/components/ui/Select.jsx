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
        className={`w-full rounded-md border ${
          error ? 'border-rose-500' : 'border-white/10'
        } bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/30 ${className}`}
        {...props}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value || option} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}

