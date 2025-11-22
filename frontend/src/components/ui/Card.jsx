export default function Card({ children, className = '', ...props }) {
  return (
    <div className={`rounded-lg border border-white/10 bg-white/5 p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

