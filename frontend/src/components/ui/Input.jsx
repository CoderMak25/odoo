export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
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
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-md border ${
          error ? 'border-rose-500' : 'border-white/10'
        } bg-white/5 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/30 ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}

