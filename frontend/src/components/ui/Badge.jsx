export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'border-white/10 bg-white/5 text-slate-300',
    success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    warning: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    danger: 'border-rose-500/20 bg-rose-500/10 text-rose-300',
    info: 'border-sky-500/20 bg-sky-500/10 text-sky-300',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

