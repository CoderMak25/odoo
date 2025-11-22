export default function Button({ 
  children, 
  variant = 'primary', 
  onClick, 
  type = 'button',
  disabled = false,
  className = '',
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-indigo-500 text-white hover:bg-indigo-400',
    secondary: 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
    danger: 'bg-rose-500 text-white hover:bg-rose-400',
    success: 'bg-emerald-500 text-white hover:bg-emerald-400',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

